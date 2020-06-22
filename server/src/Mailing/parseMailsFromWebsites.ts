import {Website} from "./Website";
import fetch from "node-fetch";
import cheerio from "cheerio";
import chalk from "chalk";

export const main = async () => {
    const wscoll = await Website.getCollection();
    const cursor = wscoll.find({"verification.statusCode": 200, "verification.isHTML": true});

    let website: Website | null = null;
    let i = 0;
    let counters = {
        total_mails: 0,
        websites_with_mail: 0,
        websites_without_mail: 0,
        skipped: 0,
        elapsed: 0,
        total: await cursor.count(),
        by_count: {} as Record<number, number>
    };

    while((website = await cursor.next())) {

        counters.elapsed++;

        if(website.mails != null) {
            counters.skipped++;
            counters.total_mails += website.mails.length;
            if(website.mails.length) {
                counters.websites_with_mail++;
            } else {
                counters.websites_without_mail++;
            }

            counters.by_count[website.mails.length] = (counters.by_count[website.mails.length] | 0) + 1
            continue;
        }
        // @ts-ignore
        const $ = cheerio.load(website.verification.body);
        const mails = [...new Set($("a[href^='mailto:']").toArray().map(el => el.attribs.href.replace("mailto:", "").trim()))];

        counters.total_mails += mails.length;
        if(mails.length) {
            counters.websites_with_mail++;
        } else {
            counters.websites_without_mail++;
        }
        counters.by_count[mails.length] = (counters.by_count[mails.length] | 0) + 1;

        // @ts-ignore
        await wscoll.updateOne({_id: website._id}, {$set: {mails}});

        process.stdout.cursorTo(0, 0);
        process.stdout.clearScreenDown();
        console.log(counters);
    }
}

if(module.parent == null) {
    main();
}