import fs from "fs";
import path from "path";

import {weekDays, langs, countryNames} from "./data";

const destDir = __dirname + "/dist";
const srcDir = __dirname + "/src";
const destFile = __dirname + "/locales.json";
const cacheFile = __dirname + "/cache/cache.json";

import {Module as Locale, Locale as LocaleFull, defaultLang, langCodes, LangCode} from "./Locale";

import fetch from "node-fetch";
import {Agent} from "https";
import chalk from "chalk";

import rimraf from "rimraf";
import pLimit from "p-limit";

const concurrency = 25;
const override = true;
const queue = pLimit(concurrency);

type Cache = Record<string, Record<string, string>>;
let cache: Cache = {};
try { cache = require(cacheFile); } catch(e) {}
const destCache: Cache = {...cache};

const key = process.env.GOOGLE_API_KEY ||
    fs.readFileSync(process.env.HOME + "/google_api_key.txt", "utf8").trim();

const srcLang = defaultLang;

import {locale as en} from "./src/en";
import {locale as es} from "./src/es";
import {locale as pt} from "./src/pt";

const srcs = {en, es, pt};
const srcLangs = Object.keys(srcs);

import {locale as base} from "./src/en";

let totalRequests = 0;
let doneRequests = 0;
let cachedRequests = 0;

const retry = async <T>(fn: () => Promise<T>): Promise<T> => {
    try {
        const res = await fn();
        return res;
    } catch(e) {
        return retry(fn);
    }
}

class TimeoutError extends Error {}

const timeout = <T>(ms: number,  fn: () => Promise<T>): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
        setTimeout(() => reject(new TimeoutError()), ms);
        return fn().then(resolve, reject);
    })
}


const processKeys = () => {
    const keys: Record<number, string> = {};
    let i = 0;
    return {
        pre: (src: string) => {
            return src.replace(/\{(.+?)\}/g, (m, p1) => {
                i++;
                keys[i] = p1;
                return "{" + i + "}";
            })
        },

        pos: (out: string) => {
            return out.replace(/\{(.+?)\}/g, (m, i) => {
                return "{" + keys[+i] +  "}";
            })
        }
    }
}

const translateString = async ({src, to}: {src: string, to: string}): Promise<string> => {

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

        const {pre, pos} = processKeys();

        const json = await fetch(
            `https://translation.googleapis.com/language/translate/v2?key=${key}`,
            {
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
    })))
}

const translateArray = async ({src, to}: {src: string[], to: string}): Promise<string[]> => {
    const ps: Promise<string>[] = [];
    const dest: string[] = []
    for(const item of src) {
        ps.push(translateString({src: item, to}));
    }
    return Promise.all(ps);
}

const translateMap = async <T extends LocaleMap>({src, to}: {src: T, to: string}): Promise<T> => {
    const target = Object.create(null) as LocaleMap;
    const ps = Object.create(null) as any;

    for(const [key, value] of Object.entries(src)) {
        ps[key] = translateAny({src: value, to});
    }

    await Promise.all(Object.values(ps));

    for(const [key, value] of Object.entries(ps)) {
        (target as any)[key] = await value;
    }

    return target as any;
}

const translateAny = async <T extends LocaleValue>({src, to}: {src: T, to: string}): Promise<T> => {
    if(typeof src === "string") {
        return await translateString({src, to}) as any;
    } else if (src instanceof Array) {
        return await translateArray({src, to}) as any;
    } else {
        return await translateMap({src: src as any, to});
    }
}

type LocaleValue = string | string[] | LocaleMap;
interface LocaleMap extends Record<string, string | string[] | LocaleMap> {};

const agent = new Agent({keepAlive: true});

/*
const listLanguages = async (): Promise<string[]> => {
    const json = await fetch(`https://translation.googleapis.com/language/translate/v2/languages?key=${key}`)
        .then(res => res.json());

    return json.data.languages.map((o: any) => o.language);
}
*/

const listLanguages = async () => {
    return Object.keys(langs);
}

const renderLocale = (locale: Locale): string => {
    return `\
import { Module } from "../Locale";
 
const locale: Module = ${JSON.stringify(locale, null, 2)};

export default locale;`;
}

async function main() {
    const res = await listLanguages();
    console.log(res.length, "languages");

    //fs.writeFileSync("./machineTranslatedList.json", JSON.stringify(res, null, 2));
    if(override) {
        console.log("> Cleaning directory " + chalk.yellow(destDir));
        await new Promise((resolve, reject) => rimraf(destDir + "/*.ts", (err) => {
            if(err) reject(err);
            else resolve();
        }));
    }

    const doneLangs: string[] = [];
    const skippedLangs: string[] = [];

    const langCodesToGenerate = res.filter(code => code !== srcLang);

    const render = () => {

        let buffer = "";
        const wl = (str: string) => buffer += str + "\n";

        wl("=".repeat(process.stdout.getWindowSize()[0]))
        if(override) {
            wl(`> Cleared directory ${chalk.yellow(destDir)}`);
        }
        wl("> Translating locales: " + langCodesToGenerate.map(lang => chalk.yellow(lang)).join(", "));
        wl("=".repeat(process.stdout.getWindowSize()[0]))
        wl(`> Concurrency: ${concurrency}`)
        wl("=".repeat(process.stdout.getWindowSize()[0]))
        wl(`> Total requests: ${chalk.yellow(totalRequests)}`)
        wl(`> Active requests: ${chalk.yellow(queue.activeCount)}`)
        wl(`> Cached responses: ${chalk.yellow(cachedRequests)}`)
        wl(`> Done requests: ${chalk.yellow(doneRequests)}`)
        wl(`> Pending requests: ${chalk.yellow(queue.pendingCount)}`)
        wl("=".repeat(process.stdout.getWindowSize()[0]))
        wl(`> Langs: ${chalk.yellow(doneLangs.length + skippedLangs.length)} / ${chalk.yellow(langCodesToGenerate.length)}`);
        wl(`> Skipped: ${skippedLangs.map(lang => chalk.yellow(lang)).join(", ")}`)
        wl(`> Done: ${doneLangs.map(lang => chalk.yellow(lang)).join(", ")}`)

        process.stdout.cursorTo(0, 0);
        process.stdout.clearScreenDown();
        process.stdout.write(buffer);

        fs.writeFileSync(cacheFile, JSON.stringify(destCache, null, 2));
    }

    const map = {} as Record<LangCode, Locale>;

    const ps = langCodesToGenerate.map(async lang => {
        const filename = `${lang}.ts`;
        const dest = path.join(destDir, filename);
        if(fs.existsSync(dest) && !override) {
            skippedLangs.push(lang);
            return;
        }
        const target = await translateMap({src: base, to: lang});
        map[lang as LangCode] = target;
        fs.writeFileSync(dest, renderLocale(target));
        doneLangs.push(lang);
    })

    const renderInterval = setInterval(render, 250);

    await Promise.all(ps)

    for(const [lang, locale] of Object.entries(srcs)) {
        map[lang as LangCode] = locale;
    }

    const full = {} as Record<LangCode, LocaleFull>;

    for(const [lang, locale] of Object.entries(map)) {
        full[lang as LangCode] = {
            lang: langs[lang as LangCode],
            ...locale,
            week: weekDays[lang as LangCode],
            countries: countryNames[lang as LangCode],
        }
    }

    render();

    clearInterval(renderInterval);


    fs.writeFileSync(destFile, JSON.stringify(full, null, 2));
    console.log("> Dist written to " + chalk.yellow(destFile));

    fs.writeFileSync(cacheFile, JSON.stringify(destCache, null, 2));
    console.log("> Cache written to " + chalk.yellow(cacheFile));
    console.log("> Done!");
}

main();