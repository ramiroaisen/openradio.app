"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const i18n_iso_countries_1 = __importDefault(require("i18n-iso-countries"));
const Country_1 = require("../../db/Country");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const dest = path_1.default.resolve(__dirname, "../data/countries");
const main = async () => {
    const countries = await Country_1.getCollection().then(coll => coll.find({}).sort({ countryCode: 1 }).toArray());
    console.log(countries.length, "countries");
    const langCodes = i18n_iso_countries_1.default.langs().sort();
    const map = {};
    for (const code of langCodes) {
        const locale = {};
        for (const country of countries) {
            locale[country.code] = i18n_iso_countries_1.default.getName(country.code.toUpperCase(), code).replace(/\,.+/, "").replace(/\(.+\)/, "").trim();
        }
        map[code] = locale;
    }
    const lines = [];
    for (const [code, locale] of Object.entries(map)) {
        fs_1.default.writeFileSync(dest + "/" + code + ".json", JSON.stringify(locale, null, 2));
        console.log(`${code} => ${dest}/${code}.json`);
        lines.push(`import ${code} from "./countries/${code}.json";`);
    }
    lines.push("");
    lines.push(`export const countryMap = {${Array.from(Object.keys(map)).join(", ")}};`);
    fs_1.default.writeFileSync(path_1.default.resolve(__dirname, "../data/countries.ts"), lines.join("\n"));
};
main();
//# sourceMappingURL=countries.js.map