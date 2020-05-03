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
const Country = __importStar(require("../db/Country"));
const Station = __importStar(require("../db/Station"));
const Locale_1 = require("../i18n/v2/Locale");
const i18n_1 = require("../i18n/v2/i18n");
const fs_1 = __importDefault(require("fs"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const chalk_1 = __importDefault(require("chalk"));
const http_1 = require("http");
const perf_hooks_1 = require("perf_hooks");
const now = () => perf_hooks_1.performance.now() | 0;
const terminal_kit_1 = require("terminal-kit");
exports.render = (entries, baseUrl) => {
    return `\
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml"> 
  ${entries.map(entry => `<url>
    <loc>${baseUrl + entry.loc}</loc>
    ${entry.alternates.map(alt => `<xhtml:link rel="alternate" href="${baseUrl + alt.href}" hreflang="${alt.lang}"/>`).join("\n    ")}
  </url>`).join("\n  ")}
</urlset>`;
};
exports.generateSitemap = async (baseUrl) => {
    const entries = [];
    const countries = await (await Country.getCollection()).find({}).sort({ code: 1 }).toArray();
    const stationsColl = await Station.getCollection();
    // /[lang]
    // /es
    entries.push({
        loc: "/en",
        alternates: [
            ...Locale_1.langCodes.map(ll => ({ href: `/${ll}`, lang: ll })),
            { href: `/`, lang: "x-default" }
        ]
    });
    const add = (from) => {
        entries.push({
            loc: "/en" + from,
            alternates: [
                ...Locale_1.langCodes.map(ll => ({ href: `/${ll}${from}`, lang: ll })),
                { href: from, lang: `x-default` }
            ]
        });
    };
    add("/languages");
    add("/recents");
    add("/radio-am");
    add("/radio-fm");
    const ccll = (ll) => i18n_1.isLangCode(ll) ? ll : "en";
    // /:ll-:cc
    // /es-ar
    for (const country of countries) {
        const ll = ccll(country.lang);
        const cc = country.code;
        entries.push({
            loc: `/${ll}-${cc}`,
            alternates: [
                ...Locale_1.langCodes.map(ll => ({ href: `/${ll}-${cc}`, lang: `${ll}-${cc}` })),
                { href: `/xx-${cc}`, lang: "x-default" }
            ]
        });
    }
    // :ll-:cc/radio/:s
    // /es-ar/radio/mega
    for (const country of countries) {
        const ll = ccll(country.lang);
        const cc = country.code;
        let stations = await stationsColl.find({ countryCode: cc }).sort({ order: 1 }).project({ slug: 1 }).toArray();
        for (const station of stations) {
            const s = station.slug;
            entries.push({
                loc: `/${ll}-${cc}/radio/${s}`,
                alternates: [
                    ...Locale_1.langCodes.map(ll => ({ href: `/${ll}-${cc}/radio/${s}`, lang: `${ll}-${cc}` })),
                    { href: `/xx-${cc}/radio/${s}`, lang: "x-default" }
                ]
            });
        }
    }
    const ams = (await stationsColl.distinct("signal.frec", { "signal.type": "am" })).sort();
    const fms = (await stationsColl.distinct("signal.frec", { "signal.type": "fm" })).sort();
    // /[lang]/radio-am/[singalFrec]
    // /es/radio-am/1100
    for (const am of ams) {
        add(`/radio-am/${am}`);
    }
    // /[lang]/radio-fm/[signalFrec]
    // /es/radio-fm/98.3
    for (const fm of fms) {
        add(`/radio-fm/${fm}`);
    }
    for (const tt of ["am", "fm"]) {
        for (const country of countries) {
            const ll = ccll(country.lang);
            const cc = country.code;
            const has = !!(tt === "am" ? country.amCount : country.fmCount);
            if (!has)
                continue;
            // /[lang]-[countryCode]/radio-[signalType]
            // /es-ar/radio-am
            // /es-ar/radio-fm
            entries.push({
                loc: `/${ll}-${cc}/radio-${tt}`,
                alternates: [
                    ...Locale_1.langCodes.map(ll => ({ href: `/${ll}-${cc}/radio-${tt}`, lang: `${ll}-${cc}` })),
                    { href: `/xx-${cc}/radio-${tt}`, lang: "x-default" }
                ]
            });
            const frecs = (await stationsColl.distinct("signal.frec", { "signal.frec": { $ne: null }, countryCode: country.code })).sort();
            for (const f of frecs) {
                // /[lang]-[countryCode]/radio-[signalType]/[signalFrec]
                // /es-ar/radio-am/1100
                // /es-ar/radio-fm/98.3
                entries.push({
                    loc: `/${ll}-${cc}/radio-${tt}/${f}`,
                    alternates: [
                        ...Locale_1.langCodes.map(ll => ({ href: `/${ll}-${cc}/radio-${tt}/${f}`, lang: `${ll}-${cc}` })),
                        { href: `/xx-${cc}/radio-${tt}/${s}`, lang: "x-default" }
                    ]
                });
            }
        }
    }
    let urls = 0;
    for (let entry of entries)
        urls += entry.alternates.length;
    const metadata = {
        entries: entries.length,
        urls
    };
    //fs.writeFileSync(__dirname + "/sitemap.xml", render(entries, baseUrl));
    //fs.writeFileSync(__dirname + "/sitemap.json", JSON.stringify(entries, null, 2));
    //fs.writeFileSync(__dirname + "/metadata.json", JSON.stringify(metadata, null, 2));
    console.log("Done!");
    return entries;
};
const concurrency = 100;
const startInterval = 50;
const s = 1000;
const m = s * 60;
const h = m * 60;
const d = h * 24;
const etaString = (ms) => {
    const days = (ms / d) | 0;
    const hours = ((ms % d) / h) | 0;
    const mins = ((ms % h) / m) | 0;
    const secs = ((ms % m) / s) | 0;
    return [
        days && `${days}d`,
        (days || hours) && `${hours}h`.padStart(3, "0"),
        (days || hours || mins) && `${mins}m`.padStart(3, "0"),
        `${secs}s`.padStart(3, "0")
    ]
        .filter(Boolean)
        .join(" ");
};
const testSitemap = async (entries, baseUrl) => {
    terminal_kit_1.terminal.fullscreen(true);
    const agent = new http_1.Agent({ keepAlive: true, keepAliveMsecs: 10000 });
    // first check all loc's
    const urls = new Set();
    for (const entry of entries) {
        urls.add(entry.loc);
    }
    // then check alternates
    for (const entry of entries) {
        entry.alternates.forEach(alt => {
            urls.add(alt.href);
        });
    }
    const iter = urls.values();
    /*
    const iter = (function* (){
      for(const entry of entries){
        yield entry.loc
      }
    })()
    */
    const errors = [];
    const errorLog = fs_1.default.createWriteStream(__dirname + "/errors.txt", "utf8");
    const addError = (error) => {
        errors.push(error);
        errorLog.write(`${error[0]}: ${error[1]}\n`);
    };
    const count = new Map();
    const current = new Set();
    const start = now();
    const total = urls.size;
    let elapsed = 0;
    let responseTimeSum = 0;
    const out = process.stdout;
    const w = out.write.bind(out);
    const render = () => {
        const elapsedMs = now() - start;
        let writtenLines = 0;
        const wl = (str) => {
            if (writtenLines > out.rows)
                return;
            writtenLines++;
            w(str + "\n");
        };
        //process.stdout.clearLine(0);
        out.cursorTo(0, 0);
        out.clearScreenDown();
        out.cursorTo(0, 0);
        wl("=".repeat(75));
        wl(chalk_1.default.blue(`Testing sitemap`));
        wl(chalk_1.default.green(baseUrl));
        wl(chalk_1.default.yellow(String(entries.length)) + " entries");
        wl(chalk_1.default.yellow(String(total)) + " urls (with alternates)");
        wl(`Concurrency: ${chalk_1.default.yellow(String(concurrency))}`);
        const percent = elapsed / total;
        const remaining = total - elapsed;
        const rs = Math.round(elapsed / (elapsedMs / 1000));
        const msr = Math.round(elapsedMs / elapsed);
        wl("=".repeat(75));
        wl("Elapsed: " + chalk_1.default.yellow((percent * 100).toFixed(2) + "%"));
        wl("ETA: " + etaString(elapsedMs / elapsed * remaining));
        wl(`Req/s: ${chalk_1.default.yellow(String(rs))} req/s`);
        wl(`AVG Response Time: ${chalk_1.default.yellow(String((responseTimeSum / elapsed) | 0))}ms`);
        wl("=".repeat(75));
        const title = " Response Codes (see ./errors.txt) ";
        wl(title);
        wl("=".repeat(title.length));
        const codes = Array.from(count.entries()).sort(([a], [b]) => a - b);
        for (const [code, count] of codes) {
            wl(chalk_1.default.yellow(String(code || "Net Error")) + ": " + chalk_1.default.yellow(String(count)));
        }
        wl("=".repeat(75));
        const showUrlNum = process.stdout.rows - writtenLines - 1;
        for (const url of Array.from(current.values()).slice(0, showUrlNum)) {
            wl(chalk_1.default.green(url));
        }
        // no newline
        w("=".repeat(75));
    };
    let renderInterval;
    const next = async () => {
        const { value: _url, done } = iter.next();
        if (done) {
            clearInterval(renderInterval);
            render();
            if (current.size === 0) {
                errorLog.close();
            }
            return;
        }
        const url = _url;
        current.add(url);
        const start = now();
        try {
            const res = await node_fetch_1.default(baseUrl + url, { agent, redirect: "manual" });
            count.set(res.status, (count.get(res.status) || 0) + 1);
            if (![200, 301, 302].includes(res.status)) {
                //if(301 !== res.status){
                addError([res.status, url]);
            }
        }
        catch (e) {
            count.set(0, (count.get(0) || 0) + 1);
            addError([0, url]);
        }
        finally {
            current.delete(url);
            elapsed++;
            responseTimeSum += (now() - start);
            next();
        }
    };
    renderInterval = setInterval(render, 250);
    for (let i = 0; i < concurrency; i++) {
        await sleep(startInterval);
        next();
    }
};
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const renderIndex = (pages, baseUrl) => {
    return `\
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Array(pages).fill(0).map((_, i) => `\
  <sitemap>
    <loc>${baseUrl}/sitemap-4/sitemap-${i + 1}.xml</loc>
  </sitemap>`).join("\n")}
</sitemapindex>`;
};
const main = async () => {
    const baseUrl = ("https://openradio.app");
    const entries = await exports.generateSitemap(baseUrl);
    //const entries: Entry[] = require("./sitemap.json");
    const pageSize = 1000;
    const numPages = Math.ceil(entries.length / pageSize);
    fs_1.default.writeFileSync(__dirname + "/sitemap-4.xml", renderIndex(numPages, baseUrl));
    try {
        fs_1.default.mkdirSync(__dirname + "/sitemap-4");
    }
    catch (e) { }
    ;
    for (let page = 0; page < numPages; page++) {
        const start = page * pageSize;
        const end = start + pageSize;
        const slice = entries.slice(start, end);
        fs_1.default.writeFileSync(__dirname + `/sitemap-4/sitemap-${page + 1}.xml`, exports.render(slice, baseUrl));
    }
    testSitemap(entries, "http://localhost:7700");
};
main();
//# sourceMappingURL=generate.js.map