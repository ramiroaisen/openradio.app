"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Station = __importStar(require("../db/Station"));
const conn_1 = require("./conn");
var Website;
(function (Website) {
    Website.getCollection = conn_1.collectionGetter("websites");
    Website.getCollection().then(coll => {
        coll.createIndex({ url: 1 }, { unique: true });
    });
})(Website = exports.Website || (exports.Website = {}));
const url_1 = require("url");
const cheerio_1 = __importDefault(require("cheerio"));
const node_fetch_1 = __importDefault(require("node-fetch"));
exports.radiowebSiteUrls = async () => {
    const body = await node_fetch_1.default("https://radiowebsites.org").then(res => res.text());
    const $ = cheerio_1.default.load(body);
    const urls = [...new Set($("#content-area a[href^=https]").toArray().map(el => el.attribs.href))];
    const hosts = urls.map(url => new url_1.URL(url).hostname);
    hosts.push("radiowebsites.org");
    return hosts;
};
const p_limit_1 = __importDefault(require("p-limit"));
const limit = p_limit_1.default(5);
const timeout = (ms, fn) => {
    return new Promise((resolve, reject) => {
        fn().then(resolve, reject);
        setTimeout(() => reject(new Error("timeout")), ms);
    });
};
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = __importDefault(require("fs"));
const create = async () => {
    const coll = await Website.getCollection();
    const stcoll = await Station.getCollection();
    const total_stations = await stcoll.find({ web: { $ne: null } }).count();
    const urls = await stcoll.distinct("web", { web: { $ne: null } });
    const total_urls = urls.length;
    let elapsed = 0;
    let statusCodes = {};
    let success = 0;
    let errors = 0;
    let cached = 0;
    const left = () => total_urls - cached - elapsed;
    const current_requests = [];
    const remove_current = (url) => {
        const i = current_requests.indexOf(url);
        if (i !== -1) {
            current_requests.splice(i, 1);
        }
    };
    const { yellow: y, red: r, green: g, blue: b } = chalk_1.default;
    const render = () => {
        let buffer = "";
        let linesAvail = process.stdout.rows;
        const wl = (line) => {
            linesAvail--;
            buffer += line + "\n";
        };
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
        for (const key in statusCodes) {
            wl(b(key) + ": " + y(statusCodes[key]));
        }
        wl("=".repeat(50));
        for (const url of current_requests) {
            if (linesAvail < 1)
                break;
            wl(url);
        }
        process.stdout.cursorTo(0, 0);
        process.stdout.clearScreenDown();
        process.stdout.write(buffer.trim());
    };
    setInterval(render, 250);
    const log = fs_1.default.createWriteStream("error.log");
    const error = (url, message) => {
        log.write(url + " => " + message + "\n");
    };
    for (const url of urls) {
        limit(async () => {
            if (await coll.find({ url }).count()) {
                cached++;
                return;
            }
            const timestamp = Date.now();
            const date = new Date(timestamp);
            const stations = await stcoll.find({ web: url }).project({ _id: 1, countryCode: 1, slug: 1 }).toArray();
            current_requests.push(url);
            try {
                const res = await timeout(120000, () => node_fetch_1.default(url, { headers: { accept: "text/html" } }));
                const headers = {};
                res.headers.forEach((value, name) => {
                    headers[name] = value;
                });
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
                });
            }
            catch (e) {
                errors++;
                error(url, e.message);
                await coll.insertOne({
                    url, stations, verification: { date, timestamp, completed: false, error: { message: e.message } }
                });
            }
            finally {
                ++elapsed;
                remove_current(url);
            }
        });
    }
};
if (module.parent == null) {
    create();
}
//# sourceMappingURL=Website.js.map