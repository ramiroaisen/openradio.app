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
const size = Object.keys(flattedBase).length;
const chalk_1 = __importDefault(require("chalk"));
for (const [lang, locale] of Object.entries(locales_json_1.default)) {
    console.log(`> checking locale ${lang} (${locale.lang.code})`);
    const flatted = flat(locale);
    console.log(`> ${chalk_1.default.yellow(size)} === ${chalk_1.default.yellow(Object.keys(flatted).length)}`);
}
//# sourceMappingURL=check.js.map