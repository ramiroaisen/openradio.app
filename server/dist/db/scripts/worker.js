"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const worker_1 = require("threads/worker");
const cheerio_1 = __importDefault(require("cheerio"));
const fs_1 = require("fs");
const load = async (filename) => {
    const source = await fs_1.promises.readFile(filename, "utf8");
    return cheerio_1.default.load(source);
};
const getWeb = async (filename) => {
    const $ = await load(filename);
    const $a = $(".contacts a").eq(0);
    if ($a.length == 0)
        return null;
    else
        return $a.attr("href");
};
const getSignals = async (filename) => {
    const $ = await load(filename);
    const signals = [];
    const log = [];
    $(".frequencies li").each((i, li) => {
        const $li = $(li);
        const regionName = $li.find("a").text().trim();
        const regionHref = $li.find("a").attr("href") || "";
        const str = $li.find(".frequency").text().trim();
        if (str == "") {
            signals.push({ regionHref, regionName, type: "other", str });
        }
        else if (/onl?ine|internet|web/i.test(str)) {
            signals.push({ regionName, regionHref, type: "web", str });
        }
        else if (/^\d+\.\d+$/.test(str)) {
            signals.push({ regionName, regionHref, type: "fm", frec: parseFloat(str), str });
        }
        else {
            let match = str.match(/([\d\.]+).*(am|fm|hd\d?)/i);
            if (match) {
                const frec = parseFloat(match[1]);
                let type;
                const t = match[2].toLowerCase();
                switch (t) {
                    case "am":
                    case "fm":
                        type = t;
                        break;
                    // hd as fm
                    default: type = "fm";
                }
                signals.push({ regionHref, regionName, type, frec, str });
            }
            else {
                if (match = str.match(/(fm|am).*([\d\.]+)/i)) {
                    signals.push({
                        regionHref,
                        regionName,
                        type: match[1].toLowerCase(),
                        frec: parseFloat(match[2]),
                        str
                    });
                }
                else {
                    signals.push({ regionHref, regionName, type: "other", str });
                    log.push(str);
                }
            }
        }
    });
    return [signals, log.join("\n")];
};
const worker = { getWeb, getSignals };
worker_1.expose(worker);
//# sourceMappingURL=worker.js.map