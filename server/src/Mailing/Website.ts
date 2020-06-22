import * as Station from "../db/Station";
import {collectionGetter} from "./conn";

export type Website = {
    url: string
    stations: Pick<Station.Station, "_id" | "slug" | "countryCode">[]
    mails?: string[]
    verification: {
        completed: true
        timestamp: number,
        date: Date,
        headers: Record<string, string>
        ok: boolean
        statusCode: number
        body: string
        isHTML: boolean
    } | { date: Date, timestamp: number, completed: false, error: { message: string } }
}

export namespace Website {
    export const getCollection = collectionGetter<Website>("websites");

    getCollection().then(coll => {
        coll.createIndex({url: 1}, {unique: true});
    })
}

import {URL} from "url";
import cheerio from "cheerio";
import fetch from "node-fetch";

export const radiowebSiteUrls = async () => {
    const body = await fetch("https://radiowebsites.org").then(res => res.text());
    const $ = cheerio.load(body);
    const urls = [...new Set($("#content-area a[href^=https]").toArray().map(el => el.attribs.href))];
    const hosts = urls.map(url => new URL(url).hostname);
    hosts.push("radiowebsites.org");
    return hosts;
}

import Limit from "p-limit";
const limit = Limit(5);

const timeout = <T>(ms: number, fn: () => Promise<T>): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
        fn().then(resolve, reject);
        setTimeout(() => reject(new Error("timeout")), ms);
    })
}

import chalk from "chalk";
import fs from "fs";

const create = async () => {
    const coll = await Website.getCollection();
    const stcoll = await Station.getCollection();
    const total_stations = await stcoll.find({web: {$ne: null}}).count();
    const urls = await stcoll.distinct("web", {web: {$ne: null}});
    const total_urls = urls.length;

    let elapsed = 0;
    let statusCodes: Record<number, number> = {};
    let success = 0;
    let errors = 0;
    let cached = 0;

    const left = () => total_urls - cached - elapsed;

    const current_requests: string[] = [];
    const remove_current = (url: string) => {
        const i = current_requests.indexOf(url);
        if(i !== -1) { current_requests.splice(i, 1); }
    }

    const {yellow: y, red: r, green: g, blue: b} = chalk;

    const render = () => {
        let buffer = "";
        let linesAvail = process.stdout.rows;
        const wl = (line: string) => {
            linesAvail--;
            buffer += line + "\n";
        }

        wl("=".repeat(5) + " Hello " + "=".repeat(5));
        wl(y(total_stations) + " stations with website");
        wl(y(total_urls) + " different webs");
        wl(y(current_requests.length) + " current requests");
        wl("Elapsed: " + y(elapsed));
        wl("Success: " + y(success));
        wl("Errors: " + y(errors));
        wl("Cached: " + y(cached));
        wl("Requests Left: " + y(left()));
        wl("Status Codes:");
        for(const key in statusCodes) {
            wl(b(key)+ ": " + y(statusCodes[key]));
        }
        wl("=".repeat(50))
        for(const url of current_requests) {
            if(linesAvail < 1)
                break;
            wl(url);
        }

        process.stdout.cursorTo(0,0);
        process.stdout.clearScreenDown();
        process.stdout.write(buffer.trim());
    }

    setInterval(render, 250);

    const log = fs.createWriteStream("error.log");
    const error = (url: string, message: string) => {
        log.write(url + " => " + message + "\n");
    }

    for(const url of urls) {
        limit(async () => {
            if(await coll.find({url}).count()) {
                cached++;
                return;
            }

            const timestamp = Date.now();
            const date = new Date(timestamp);
            const stations = await stcoll.find({web: url}).project({_id: 1, countryCode: 1, slug: 1}).toArray();

            current_requests.push(url);

            try {
                const res = await timeout(120_000, () => fetch(url, {headers: {accept: "text/html"}}));

                const headers: Record<string, string> = {}
                res.headers.forEach((value, name) => {
                    headers[name] = value;
                })

                const statusCode = res.status;
                const ok = res.ok;
                statusCodes[statusCode] = (statusCodes[statusCode] | 0) + 1;

                success++;

                const isHTML = !!headers["content-type"] && headers["content-type"].trim().startsWith("text/html");
                const body = isHTML ? await res.text() : "";

                await coll.insertOne({
                    url, stations, verification: {
                        completed: true,
                        isHTML,
                        body,
                        headers,
                        statusCode,
                        ok,
                        date,
                        timestamp
                    }
                })

            } catch(e) {
                errors++;
                error(url, e.message);
                await coll.insertOne({
                    url, stations, verification: {date, timestamp, completed: false, error: {message: e.message}}
                })
            } finally {
                ++elapsed;
                remove_current(url);
            }
        })
    }
}

if(module.parent == null) {
    create();
}