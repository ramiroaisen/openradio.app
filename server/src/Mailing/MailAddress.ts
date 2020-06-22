import * as Station from "../db/Station";
import {collectionGetter} from "./conn";
import {sleep} from "../utils";
import verify = MailAddress.verify;
const Verifier = require("email-verify") as any;
const codeStrings = (Object as any).fromEntries(Object.entries(Verifier.verifyCodes).map(([key, value]) => [value, key]));

export type MailAddress = {
    address: string,
    stations: Pick<Station.Station, "_id" | "countryCode" | "slug">[]
    verificationInfo: {
        timestamp: number
        date: Date,
        info: any,
        error: any
    }
}

export namespace MailAddress {

    export const getCollection = collectionGetter<MailAddress>("addresses");

    getCollection().then(coll => {
        coll.createIndex({address: 1}, {unique: true});
        coll.createIndex({stations: 1})
    })

    export const verify = async (address: string): Promise<MailAddress["verificationInfo"]> => {
        const timestamp = Date.now();
        const date = new Date(timestamp);
        return new Promise(resolve => {
            Verifier.verify(address, (error: any, info: any) => {
                resolve({
                    timestamp,
                    date,
                    error,
                    info: {...info, codeStr: codeStrings[info.code]}
                });
            })
        })
    }
}

import chalk from "chalk";
import Limit from "p-limit";

const limit = Limit(5);

const main = async () => {
    const stationsCollection = await Station.getCollection();
    const addresses = await stationsCollection.distinct("mail", {mail: {$ne: null}});
    const mailAddressCollection = await MailAddress.getCollection();
    const totalStations = await stationsCollection.find({mail: {$ne: null}}).count();
    const totalAddresses = addresses.length;
    console.log(totalStations, "stations with mail");
    console.log(totalAddresses, "total addresses");

    let noSuccess = 0;
    let success = 0;
    let errors = 0;
    let skipped = 0;
    let i = 0;

    const sum = (mailAddress: MailAddress) => {
        if(mailAddress.verificationInfo!.info && mailAddress.verificationInfo!.info.success) {
            success++
        } else {
            noSuccess++;
        }

        if(mailAddress.verificationInfo!.error) {
            errors++;
        }
    }

    for(const address of addresses) {
        limit(async () => {
            ++i;

            process.stdout.cursorTo(0, 0);
            process.stdout.clearScreenDown();
            console.log({success, errors, skipped, noSuccess, elapsed: i, totalStations, totalAddresses})

            const mailAddress = await mailAddressCollection.findOne({address});
            if(mailAddress != null) {
                skipped++;
                sum(mailAddress)
                return;
            }

            const stations = await stationsCollection
                .find({mail: address})
                .project({_id: 1, slug: 1, countryCode: 1
                }).toArray();

            const verificationInfo = await MailAddress.verify(address);

            const document = {
                address,
                stations,
                verificationInfo,
            }

            sum(document);

            await mailAddressCollection.insertOne(document);
        })
    };
}

/*
const addErrStr = async () => {
    const coll = await MailAddress.getCollection();
    const addresses = await coll.find().toArray();
    let i = 0;
    for(const address of addresses) {
        console.log(++i);
        if(address.verificationInfo.info && address.verificationInfo.info.code) {
            const codeStr = codeStrings[address.verificationInfo.info.code];
            if(codeStr) {
                await coll.updateOne({"address": address.address}, {$set: {"verificationInfo.info.codeStr": codeStr}});
            }
        }
    }
}
 */

const retry = async () => {
    const coll = await MailAddress.getCollection();
    const addresses = await coll.find({"verificationInfo.info.code": Verifier.verifyCodes.SMTPConnectionError}).toArray();
    console.log(addresses.length, "to retry");

    let success = 0;
    let error = 0;
    let errorCodes: Record<string, number> = {};
    let elapsed = 0;
    let total = addresses.length;
    for(const address of addresses) {
        limit(async () => {

            process.stdout.cursorTo(0, 0);
            process.stdout.clearScreenDown();
            console.log({success, error, elapsed, total, errorCodes});
            const verificationInfo = await MailAddress.verify(address.address);

            ++elapsed;

            if(verificationInfo.info.success) {
                success++;
            } else {
                error++;
                const codeStr =  verificationInfo.info.code;
                if(codeStr) {
                    errorCodes[codeStr] = (errorCodes[codeStr] | 0) + 1;
                }
            }

            const timestamp = Date.now();
            const date = new Date(timestamp);
            await coll.updateOne({"address": address.address}, {
                $set: {
                    verificationInfo,
                    timestamp,
                    date
                }
            })
        })
    }
}
/*
import fetch from "node-fetch";
import cheerio from "cheerio";
import {URL} from "url";
const removeRadioWebsitesMails = async () => {
    const body = await fetch("https://radiowebsites.org").then(res => res.text());
    const $ = cheerio.load(body);
    const urls = [...new Set($("#content-area a[href^=https]").toArray().map(el => el.attribs.href))];
    const hosts = urls.map(url => new URL(url).hostname);
    hosts.push("radiowebsites.org");

    const query: object = {
        $or: hosts.map(host => ({mail: new RegExp("@" + host)}))
    }

    const stcoll = await Station.getCollection();
    const stations = await stcoll.find(query);
    const total = await stations.count();
    const mails = await stcoll.distinct("mail", query);
    const origins = await stcoll.distinct("origin", query);
    //console.log(query);
    //console.log(mails);
    //console.log(origins);
    let station: Station.Station | null;
    let i = 0;

    const coll = await MailAddress.getCollection();
    const res = await coll.deleteMany({
        $or: hosts.map(host => ({address: new RegExp("@" + host)}))
    })

    console.log(res);

    while((station = await stations.next())) {
        console.log(++i, "/", total);
        await stcoll.updateOne({_id: station._id}, {
            $set: {"_radiowebsites.mail": station.mail},
            $unset: {mail: ""},
        })
    }
}
 */

if(module.parent == null) {
    //removeRadioWebsitesMails()
}