"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const Country_1 = require("../../db/Country");
const fs_1 = __importDefault(require("fs"));
const main = async () => {
    const dest = path_1.default.resolve(__dirname, "../cache/countries.json");
    const coll = await Country_1.getCollection();
    const countries = await coll.find({}).project({ _id: 0, code: 1, slug: 1, continentCode: 1 }).sort({ continentCode: 1, code: 1 }).toArray();
    fs_1.default.writeFileSync(dest, JSON.stringify(countries, null, 2));
    console.log("Done!");
};
main();
//# sourceMappingURL=countriesCache.js.map