import {locale as helper} from "./src/en";
import {countryNames, weekDays, langs} from "./data";

const base = {
    ...helper,
    countries: countryNames.en,
    week: weekDays.en,
    lang: langs.en
}

import locales from "./locales.json";

interface DeepMap extends Record<string, string | DeepMap>{}

const flat = (locale: DeepMap): Record<string, string> => {
    const target: Record<string, string> = Object.create(null);
    const add = (base: string, nested: string | DeepMap) => {
        if(typeof nested === "string") {
            target[base] = nested;
        } else {
            for(const [key, value] of Object.entries(nested)) {
                const nestedKey = [base, key].filter(Boolean).join(".");
                add(nestedKey, value);
            }
        }
    }

    add("", locale);

    return target;
}

const flattedBase = flat(base);
const size = Object.keys(flattedBase).length;

import chalk from "chalk";

for(const [lang, locale] of Object.entries(locales)){
    console.log(`> checking locale ${lang} (${(locale as any).lang.code})`)
    const flatted = flat(locale as any);
    console.log(`> ${chalk.yellow(size)} === ${chalk.yellow(Object.keys(flatted).length)}`)
}
