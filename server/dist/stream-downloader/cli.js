"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import commander from "commander";
const mongodb_1 = require("mongodb");
const Station_1 = require("../src/db/Station");
const conn_1 = require("../src/db/conn");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const node_fetch_1 = __importDefault(require("node-fetch"));
var Stream;
(function (Stream) {
    let State;
    (function (State) {
        State["Created"] = "created";
        State["Downloading"] = "downloading";
        State["Closed"] = "closed";
        State["Error"] = "error";
    })(State = Stream.State || (Stream.State = {}));
})(Stream = exports.Stream || (exports.Stream = {}));
const dir = "/run/media/ramiro/C4F2A987F2A97DF4/Ramiro/openradio/stream-downloads";
const main = async () => {
    const conn = await conn_1.getConnection();
    const coll = conn.collection("stream-downloads");
    const htmls = await coll.find({ headers: { $elemMatch: { key: "content-type", value: /text\/html/ } } }).toArray();
    const total = htmls.length;
    console.log("Clearing ", total, "files");
    for (const doc of htmls) {
        await fs_1.promises.unlink(path_1.default.join(dir, doc.filename)).catch(() => { });
        await fs_1.promises.unlink(path_1.default.join(dir, doc.filename) + ".json").catch(() => { });
    }
    console.log("> Done!");
};
const main1 = async () => {
    while (true) {
        await new Promise(async (resolve) => {
            console.log("=".repeat(100));
            const countryCode = "ar";
            const slug = "metro";
            const streamIndex = 0;
            const conn = await conn_1.getConnection();
            const coll = conn.collection("stream-downloads");
            const station = (await Station_1.getStation(countryCode, slug));
            const _id = new mongodb_1.ObjectId();
            const createdAt = new Date();
            const createdAtMs = +createdAt;
            const filename = _id.toString() + ".mp4";
            const stationStream = station.streams[streamIndex];
            const filepath = path_1.default.join(dir, filename);
            console.log(`> Downloading ${station.name}`);
            console.log(`> Writing to ${filepath}`);
            const res = await node_fetch_1.default(stationStream.url);
            const headers = [];
            res.headers.forEach((value, key) => {
                headers.push({ key, value });
            });
            if (!res.ok || !/audio|video/.test(res.headers.get("content-type") || "")) {
                console.log("> Request error");
                console.log(res.status, res.statusText);
                res.headers.forEach((value, key) => {
                    console.log(`${key}: ${value}`);
                });
                return setTimeout(resolve, 1000);
            }
            const stream = {
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
            };
            console.log("> Writing metadata");
            await fs_1.promises.writeFile(filepath + ".json", JSON.stringify(stream, null, 2));
            await coll.insertOne(stream);
            const writeStream = fs_1.createWriteStream(filepath);
            res.body.pipe(writeStream);
            const interval = setInterval(() => {
                const now = new Date();
                coll.updateOne({ _id: stream._id }, { $set: {
                        updatedAt: now,
                        updatedAtMs: +now
                    } });
            }, 1000);
            res.body.on("end", async () => {
                clearInterval(interval);
                const now = new Date();
                await coll.updateOne({ _id: stream._id }, { $set: {
                        state: Stream.State.Closed,
                        updatedAt: now,
                        updatedAtMs: +now
                    } });
                console.log("> Request ended, reconnecting...");
                resolve();
            });
        });
    }
};
main1();
//# sourceMappingURL=cli.js.map