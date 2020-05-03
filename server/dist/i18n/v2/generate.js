"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const data_1 = require("./data");
const destDir = __dirname + "/dist";
const srcDir = __dirname + "/src";
const destFile = __dirname + "/locales.json";
const cacheFile = __dirname + "/cache/cache.json";
const Locale_1 = require("./Locale");
const node_fetch_1 = __importDefault(require("node-fetch"));
const https_1 = require("https");
const chalk_1 = __importDefault(require("chalk"));
const rimraf_1 = __importDefault(require("rimraf"));
const p_limit_1 = __importDefault(require("p-limit"));
const concurrency = 25;
const override = true;
const queue = p_limit_1.default(concurrency);
let cache = {};
try {
    cache = require(cacheFile);
}
catch (e) { }
const destCache = { ...cache };
const key = process.env.GOOGLE_API_KEY ||
    fs_1.default.readFileSync(process.env.HOME + "/google_api_key.txt", "utf8").trim();
const srcLang = Locale_1.defaultLang;
const en_1 = require("./src/en");
const es_1 = require("./src/es");
const pt_1 = require("./src/pt");
const srcs = { en: en_1.locale, es: es_1.locale, pt: pt_1.locale };
const srcLangs = Object.keys(srcs);
const en_2 = require("./src/en");
let totalRequests = 0;
let doneRequests = 0;
let cachedRequests = 0;
const retry = async (fn) => {
    try {
        const res = await fn();
        return res;
    }
    catch (e) {
        return retry(fn);
    }
};
class TimeoutError extends Error {
}
const timeout = (ms, fn) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => reject(new TimeoutError()), ms);
        return fn().then(resolve, reject);
    });
};
const processKeys = () => {
    const keys = {};
    let i = 0;
    return {
        pre: (src) => {
            return src.replace(/\{(.+?)\}/g, (m, p1) => {
                i++;
                keys[i] = p1;
                return "{" + i + "}";
            });
        },
        pos: (out) => {
            return out.replace(/\{(.+?)\}/g, (m, i) => {
                return "{" + keys[+i] + "}";
            });
        }
    };
};
const translateString = async ({ src, to }) => {
    totalRequests++;
    const cached = cache[to] && cache[to][src];
    if (cached != null) {
        doneRequests++;
        cachedRequests++;
        destCache[to] = destCache[to] || {};
        destCache[to][src] = cached;
        return cached;
    }
    return queue(() => retry(() => timeout(2000, async () => {
        const { pre, pos } = processKeys();
        const json = await node_fetch_1.default(`https://translation.googleapis.com/language/translate/v2?key=${key}`, {
            method: "POST",
            body: JSON.stringify({
                q: pre(src),
                source: srcLang,
                target: to,
                format: "text"
            })
        }).then(res => res.json());
        doneRequests++;
        const value = pos(json.data.translations[0].translatedText);
        destCache[to] = destCache[to] || {};
        destCache[to][src] = value;
        return value;
    })));
};
const translateArray = async ({ src, to }) => {
    const ps = [];
    const dest = [];
    for (const item of src) {
        ps.push(translateString({ src: item, to }));
    }
    return Promise.all(ps);
};
const translateMap = async ({ src, to }) => {
    const target = Object.create(null);
    const ps = Object.create(null);
    for (const [key, value] of Object.entries(src)) {
        ps[key] = translateAny({ src: value, to });
    }
    await Promise.all(Object.values(ps));
    for (const [key, value] of Object.entries(ps)) {
        target[key] = await value;
    }
    return target;
};
const translateAny = async ({ src, to }) => {
    if (typeof src === "string") {
        return await translateString({ src, to });
    }
    else if (src instanceof Array) {
        return await translateArray({ src, to });
    }
    else {
        return await translateMap({ src: src, to });
    }
};
;
const agent = new https_1.Agent({ keepAlive: true });
/*
const listLanguages = async (): Promise<string[]> => {
    const json = await fetch(`https://translation.googleapis.com/language/translate/v2/languages?key=${key}`)
        .then(res => res.json());

    return json.data.languages.map((o: any) => o.language);
}
*/
const listLanguages = async () => {
    return Object.keys(data_1.langs);
};
const renderLocale = (locale) => {
    return `\
import { Module } from "../Locale";
 
const locale: Module = ${JSON.stringify(locale, null, 2)};

export default locale;`;
};
async function main() {
    const res = await listLanguages();
    console.log(res.length, "languages");
    //fs.writeFileSync("./machineTranslatedList.json", JSON.stringify(res, null, 2));
    if (override) {
        console.log("> Cleaning directory " + chalk_1.default.yellow(destDir));
        await new Promise((resolve, reject) => rimraf_1.default(destDir + "/*.ts", (err) => {
            if (err)
                reject(err);
            else
                resolve();
        }));
    }
    const doneLangs = [];
    const skippedLangs = [];
    const langCodesToGenerate = res.filter(code => code !== srcLang);
    const render = () => {
        let buffer = "";
        const wl = (str) => buffer += str + "\n";
        wl("=".repeat(process.stdout.getWindowSize()[0]));
        if (override) {
            wl(`> Cleared directory ${chalk_1.default.yellow(destDir)}`);
        }
        wl("> Translating locales: " + langCodesToGenerate.map(lang => chalk_1.default.yellow(lang)).join(", "));
        wl("=".repeat(process.stdout.getWindowSize()[0]));
        wl(`> Concurrency: ${concurrency}`);
        wl("=".repeat(process.stdout.getWindowSize()[0]));
        wl(`> Total requests: ${chalk_1.default.yellow(totalRequests)}`);
        wl(`> Active requests: ${chalk_1.default.yellow(queue.activeCount)}`);
        wl(`> Cached responses: ${chalk_1.default.yellow(cachedRequests)}`);
        wl(`> Done requests: ${chalk_1.default.yellow(doneRequests)}`);
        wl(`> Pending requests: ${chalk_1.default.yellow(queue.pendingCount)}`);
        wl("=".repeat(process.stdout.getWindowSize()[0]));
        wl(`> Langs: ${chalk_1.default.yellow(doneLangs.length + skippedLangs.length)} / ${chalk_1.default.yellow(langCodesToGenerate.length)}`);
        wl(`> Skipped: ${skippedLangs.map(lang => chalk_1.default.yellow(lang)).join(", ")}`);
        wl(`> Done: ${doneLangs.map(lang => chalk_1.default.yellow(lang)).join(", ")}`);
        process.stdout.cursorTo(0, 0);
        process.stdout.clearScreenDown();
        process.stdout.write(buffer);
        fs_1.default.writeFileSync(cacheFile, JSON.stringify(destCache, null, 2));
    };
    const map = {};
    const ps = langCodesToGenerate.map(async (lang) => {
        const filename = `${lang}.ts`;
        const dest = path_1.default.join(destDir, filename);
        if (fs_1.default.existsSync(dest) && !override) {
            skippedLangs.push(lang);
            return;
        }
        const target = await translateMap({ src: en_2.locale, to: lang });
        map[lang] = target;
        fs_1.default.writeFileSync(dest, renderLocale(target));
        doneLangs.push(lang);
    });
    const renderInterval = setInterval(render, 250);
    await Promise.all(ps);
    for (const [lang, locale] of Object.entries(srcs)) {
        map[lang] = locale;
    }
    const full = {};
    for (const [lang, locale] of Object.entries(map)) {
        full[lang] = {
            lang: data_1.langs[lang],
            ...locale,
            week: data_1.weekDays[lang],
            countries: data_1.countryNames[lang],
        };
    }
    render();
    clearInterval(renderInterval);
    fs_1.default.writeFileSync(destFile, JSON.stringify(full, null, 2));
    console.log("> Dist written to " + chalk_1.default.yellow(destFile));
    fs_1.default.writeFileSync(cacheFile, JSON.stringify(destCache, null, 2));
    console.log("> Cache written to " + chalk_1.default.yellow(cacheFile));
    console.log("> Done!");
}
main();
//# sourceMappingURL=generate.js.map