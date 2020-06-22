"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Website_1 = require("./Website");
const cheerio_1 = __importDefault(require("cheerio"));
exports.main = async () => {
    const wscoll = await Website_1.Website.getCollection();
    const cursor = wscoll.find({ "verification.statusCode": 200, "verification.isHTML": true });
    let website = null;
    let i = 0;
    let counters = {
        total_mails: 0,
        websites_with_mail: 0,
        websites_without_mail: 0,
        skipped: 0,
        elapsed: 0,
        total: await cursor.count(),
        by_count: {}
    };
    while ((website = await cursor.next())) {
        counters.elapsed++;
        if (website.mails != null) {
            counters.skipped++;
            counters.total_mails += website.mails.length;
            if (website.mails.length) {
                counters.websites_with_mail++;
            }
            else {
                counters.websites_without_mail++;
            }
            counters.by_count[website.mails.length] = (counters.by_count[website.mails.length] | 0) + 1;
            continue;
        }
        // @ts-ignore
        const $ = cheerio_1.default.load(website.verification.body);
        const mails = [...new Set($("a[href^='mailto:']").toArray().map(el => el.attribs.href.replace("mailto:", "").trim()))];
        counters.total_mails += mails.length;
        if (mails.length) {
            counters.websites_with_mail++;
        }
        else {
            counters.websites_without_mail++;
        }
        counters.by_count[mails.length] = (counters.by_count[mails.length] | 0) + 1;
        // @ts-ignore
        await wscoll.updateOne({ _id: website._id }, { $set: { mails } });
        process.stdout.cursorTo(0, 0);
        process.stdout.clearScreenDown();
        console.log(counters);
    }
};
if (module.parent == null) {
    exports.main();
}
//# sourceMappingURL=parseMailsFromWebsites.js.map