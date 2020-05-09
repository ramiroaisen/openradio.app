"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const en_1 = require("./src/en");
const data_1 = require("./data");
const base = {
    ...en_1.locale,
    countries: data_1.countryNames.en,
    week: data_1.weekDays.en,
    lang: data_1.langs.en
};
const locales_json_1 = __importDefault(require("./locales.json"));
const flat = (locale) => {
    const target = Object.create(null);
    const add = (base, nested) => {
        if (typeof nested === "string") {
            target[base] = nested;
        }
        else {
            for (const [key, value] of Object.entries(nested)) {
                const nestedKey = [base, key].filter(Boolean).join(".");
                add(nestedKey, value);
            }
        }
    };
    add("", locale);
    return target;
};
const flattedBase = flat(base);
const baseSize = Object.keys(flattedBase).length;
const chalk_1 = __importDefault(require("chalk"));
for (const [lang, locale] of Object.entries(locales_json_1.default)) {
    process.stdout.write(`> checking locale ${chalk_1.default.yellow(lang)} (${chalk_1.default.yellow(locale.lang.code)})`);
    const flatted = flat(locale);
    const size = Object.keys(flatted).length;
    if (size !== baseSize) {
        process.stdout.write(` => ${chalk_1.default.red("✕")} ${chalk_1.default.red(size)} entries`);
    }
    else {
        process.stdout.write(` => ${chalk_1.default.green("✓")} ${chalk_1.default.yellow(size)} entries`);
    }
    process.stdout.write("\n");
    for (const [key, value] of Object.entries(flattedBase)) {
        if (typeof value !== "string") {
            console.log(`> ${chalk_1.default.yellow(`en.${key}`)} is not a string`);
            continue;
        }
        if (!(key in flatted)) {
            console.log(`> missing entry ${chalk_1.default.yellow(lang + "." + key)}`);
        }
    }
    for (const [key, value] of Object.entries(flatted)) {
        if (typeof value !== "string") {
            console.log(`> ${chalk_1.default.yellow(lang + "." + key)} is not a string`);
            continue;
        }
        if (!(key in flattedBase)) {
            console.log(`> unknown entry ${chalk_1.default.yellow(lang + "." + key)}`);
        }
    }
}
//# sourceMappingURL=check.js.map