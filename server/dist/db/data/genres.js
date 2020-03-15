"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _genres_json_1 = __importDefault(require("./_genres.json"));
const Genre_1 = require("../Genre");
const mongodb_1 = require("mongodb");
const fs_1 = __importDefault(require("fs"));
const genres = [];
const main = async () => {
    const coll = await Genre_1.getCollection();
    for (const genre of _genres_json_1.default) {
        genres.push({
            _id: new mongodb_1.ObjectId(),
            name: genre.name,
            slug: genre.slug,
            count: 0
        });
    }
    console.log(genres.length, "genres");
    fs_1.default.writeFileSync(__dirname + "/collections/genres.json", JSON.stringify(genres, null, 2));
    await coll.drop();
    coll.insertMany(genres);
};
main();
//# sourceMappingURL=genres.js.map