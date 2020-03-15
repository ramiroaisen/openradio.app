"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Genre_1 = require("../../db/Genre");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const dest = path_1.default.resolve(__dirname, "../cache");
const main = async () => {
    const coll = await Genre_1.getCollection();
    const list = await coll.find({}).project({ _id: 0, slug: 1, name: 1 }).sort({ slug: 1 }).toArray();
    const genres = {};
    for (const genre of list) {
        genres[genre.slug] = genre.name;
    }
    fs_1.default.writeFileSync(dest + "/enGenres.json", JSON.stringify(genres, null, 2));
    fs_1.default.writeFileSync(dest + "/genres.json", JSON.stringify(list.map(genre => genre.slug), null, 2));
    console.log("Done!");
};
main();
//# sourceMappingURL=genres.js.map