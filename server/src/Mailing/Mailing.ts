import {collectionGetter, getConnection} from "../db/conn";
import {MongoClient, ObjectId} from "mongodb";
import * as Station from "../db/Station";
import * as Country from "../db/Country";

export type Mail = {
    from: string
    to: string
    subject: string
    campaignId: string
    lang: string
    isTest: boolean
    body: {
        text: string,
        html: string
    }
    station?: {
        _id: ObjectId
        countryCode: string
        slug: string
    }
    stations?: {
        _id: ObjectId
        countryCode: string
        slug: string
    }
    info: any
}

export namespace Mail {
    export const getCollection = async () => {
        const client = await MongoClient.connect("mongodb://localhost:27017", {useUnifiedTopology: true, useNewUrlParser: true});
        return client.db("openradio-mailing").collection("mails");
    }
}

export type TemplateOptions = {
    stations: Station.Station[]
    campaignId: string
    lang: string
}

const url = (station: Station.Station, lang: string, campaignId: string) => {
    return `https://openradio.app/${lang}-${station.countryCode}/radio/${station.slug}?src=${campaignId}`
}

const template = ({stations, lang, campaignId}: TemplateOptions): {text: string, html: string} => {
const body =
    `\
Buenos días,

Soy Ramiro, de openradio.app.

Somos un portal de radio en vivo para más de 130 países y con cerca de 45.000 radios en todo el mundo.

Me comunico con ustedes para contarles que estamos listando algunas de sus radio en nuestro sitio. 

Pueden verlas entrando a:

${stations.map(station => 
    `<a href="${url(station, lang, campaignId)}">${url(station, lang, campaignId)}</a>`
).join("\n")}
    
Les queríamos pedir si podrían ser tan amables de linkearnos ustedes a nosotros también en su sitio, o comentar en sus redes que pueden ser escuchados por nuestra app

eso nos ayudaría a crecer y difundir nuestro sitio.

Quedo a su disposición para lo que necesiten.

Abrazo de radio!

Ramiro`;

    return {
        text: body,
        html: body.replace(/\n/g, "<br/>")
    }
}

//import nodemailer from "nodemailer";

import fetch from "node-fetch";
import {MailAddress} from "./MailAddress";

export type SendMailOptions = {
    text: string
    html: string
    to: string
    subject: string
}

const sendMail = async ({text, html, to, subject}: SendMailOptions) => {
    const res = await fetch("https://mail.openradio.app:5334/users/5e8d3f3ffb20f34df5561a99/submit", {
        method: "POST",
        headers: {
            "x-access-token": "QE9yaW1hcjEyMw==",
            "content-type": "application/json"
        },
        body: JSON.stringify({
            to: [{address: to}],
            subject,
            text,
            html,
            bcc: [
                {address: "test@openradio.app"},
            ]
        })
    })

    return res.json();
}

const sleep = (ms: number) => {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    })
}

import chalk from "chalk";

const test = async () => {
    const campaignId = "m2";
    const lang = "es";

    let currentCount = 0;
    let currentStationCount = 0;

    /*
    const transport = nodemailer.createTransport({
        host: "mail.openradio.app",
        port: 465,
        secure: true,
        auth: {
            type: "login",
            user: "ramiro@openradio.app",
            pass: "@Orimar123",
        },
        tls: {
            rejectUnauthorized: false
        }
    })
     */

    const maddcoll = await MailAddress.getCollection();
    const coll = await Mail.getCollection();

    const countryCodes = await (await Country.getCollection()).distinct("code", {lang: "es"});

    const stationsCollection = await Station.getCollection();
    const cursor = stationsCollection.find({countryCode: {$in: countryCodes}, mail: {$ne: null}});

    const stationIds = await stationsCollection.distinct("_id", {countryCode: {$in: countryCodes}});

    console.log(stationIds.length, "stations");
    // @ts-ignore
    const adds = (await maddcoll.find({stations: {$gt: {$size: 1}}, "stations._id": {$in: stationIds}}).toArray())
        // @ts-ignore
        .filter(add => add.stations.length > 1);

    console.log(adds.length, "addresses");

    let i = 0;
    let skipped = 0;
    for(const address of adds) {

        try {
            if(await coll.find({campaignId, to: address.address}).count()) {
                skipped++;
                console.log(++i, "skipped");
                continue;
            }

            console.log("=".repeat(50));
            console.log(chalk.green(currentCount), "|", chalk.green(currentStationCount), "|", skipped, "|", ++i, "/", adds.length);
            console.log(address.address);
            for(const station of address.stations) {
                console.log(url(station, lang, campaignId));
            }

            const body = template({stations: address.stations, lang, campaignId});

            const to = address.address;

            const subject = "Estamos listando sus radios en nuestro sitio";

            const info = await sendMail({
                to,
                html: body.html,
                text: body.text,
                subject,
            })

            await coll.insertOne({
                from: "ramiro@openradio.app",
                to,
                body,
                subject,
                campaignId,
                lang,
                stations: address.stations,
                isTest: false,
                info
            })

            currentCount++;
            currentStationCount += address.stations.length;
            await sleep(20_000);

        } catch(e) {
            console.log("[ERROR]:", e.message);
        }
    }

    console.log("Done!");
}

if(module.parent == null) {
    test();
}

