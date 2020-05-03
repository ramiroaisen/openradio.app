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
const baseSize = Object.keys(flattedBase).length;

import chalk from "chalk";

for(const [lang, locale] of Object.entries(locales)){
    process.stdout.write(`> checking locale ${chalk.yellow(lang)} (${chalk.yellow((locale as any).lang.code)})`)
    const flatted = flat(locale as any);
    const size = Object.keys(flatted).length;
    if (size !== baseSize) {
        process.stdout.write(` => ${chalk.red("✕")} ${chalk.red(size)} entries`);
    } else {
        process.stdout.write(` => ${chalk.green("✓")} ${chalk.yellow(size)} entries`);
    }

    process.stdout.write("\n");

    for(const [key, value] of Object.entries(flattedBase)) {
        if(typeof value !== "string") {
            console.log(`> ${chalk.yellow(`en.${key}`)} is not a string`);
            continue;
        }

        if (!(key in flatted)) {
            console.log(`> missing entry ${chalk.yellow(lang + "." + key)}`)
        }
    }

    for(const [key, value] of Object.entries(flatted)) {
        if(typeof value !== "string") {
            console.log(`> ${chalk.yellow(lang + "." + key)} is not a string`);
            continue;
        }

        if (!(key in flattedBase)) {
            console.log(`> unknown entry ${chalk.yellow(lang + "." + key)}`);
        }
    }

}
