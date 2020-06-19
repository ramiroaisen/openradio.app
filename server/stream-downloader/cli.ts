// import commander from "commander";
import {ObjectId} from "mongodb";

import {Station, getStation} from "../src/db/Station";
import {getConnection} from "../src/db/conn";
import {basedir} from "../src/config";
import {promises as fs, createWriteStream} from "fs";
import path from "path";

import fetch from "node-fetch";

export type Stream = {
    _id: ObjectId
    filename: string
    stationId: Station["_id"];
    stream: Station["streams"][number]
    createdAt: Date
    updatedAt: Date
    createdAtMs: number
    updatedAtMs: number
    state: Stream.State
    headers: {
        key: string
        value: string
    }[]
}

export namespace Stream {
    export enum State {
        Created = "created",
        Downloading = "downloading",
        Closed = "closed",
        Error = "error"
    }
}

const dir = "/run/media/ramiro/C4F2A987F2A97DF4/Ramiro/openradio/stream-downloads";

const main = async () => {
    const conn = await getConnection();
    const coll = conn.collection<Stream>("stream-downloads");

    const htmls = await coll.find({headers: {$elemMatch: {key: "content-type", value: /text\/html/}}}).toArray();
    const total = htmls.length;
    console.log("Clearing ", total, "files");

    for(const doc of htmls) {
        await fs.unlink(path.join(dir, doc.filename)).catch(() => {});
        await fs.unlink(path.join(dir, doc.filename) + ".json").catch(() => {});
    }

    console.log("> Done!");
}

const main1 = async () => {

    while(true) {
        await new Promise(async resolve => {

            console.log("=".repeat(100));

            const countryCode = "ar";
            const slug = "metro";
            const streamIndex = 0;

            const conn = await getConnection();
            const coll = conn.collection<Stream>("stream-downloads")

            const station = (await getStation(countryCode, slug))!;

            const _id = new ObjectId();
            const createdAt = new Date();
            const createdAtMs = +createdAt;
            const filename = _id.toString() + ".mp4";
            const stationStream = station.streams[streamIndex];

            const filepath = path.join(dir, filename);

            console.log(`> Downloading ${station.name}`)
            console.log(`> Writing to ${filepath}`)

            const res = await fetch(stationStream.url);

            const headers: Stream["headers"] = [];
            res.headers.forEach((value, key) => {
                headers.push({key, value})
            })

            if(!res.ok || !/audio|video/.test(res.headers.get("content-type") || "")) {
                console.log("> Request error");
                console.log(res.status, res.statusText);
                res.headers.forEach((value, key) => {
                    console.log(`${key}: ${value}`);
                })
                return setTimeout(resolve, 1000);
            }

            const stream: Stream = {
                _id,
                filename,
                stream: stationStream,
                createdAt,
                createdAtMs,
                updatedAt: createdAt,
                updatedAtMs: createdAtMs,
                state: Stream.State.Downloading,
                stationId: station._id,
                headers
            }

            console.log("> Writing metadata");
            await fs.writeFile(filepath + ".json", JSON.stringify(stream, null, 2));
            await coll.insertOne(stream);
            const writeStream = createWriteStream(filepath);
            res.body.pipe(writeStream);

            const interval = setInterval(() => {
                const now = new Date();
                coll.updateOne({_id: stream._id}, {$set: {
                    updatedAt: now,
                    updatedAtMs: +now
                }})
            }, 1000)

            res.body.on("end", async () => {
                clearInterval(interval);
                const now = new Date();
                await coll.updateOne({_id: stream._id}, {$set: {
                    state: Stream.State.Closed,
                    updatedAt: now,
                    updatedAtMs: +now
                }})

                console.log("> Request ended, reconnecting...");
                resolve();
            });
        })
    }
}

main1();
