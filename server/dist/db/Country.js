"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const conn_1 = require("./conn");
exports.getCollection = conn_1.collectionGetter("countries");
(async () => {
    const coll = await exports.getCollection();
    //coll.createIndex({slug: 1}, {unique: true});
    coll.createIndex({ code: 1 }, { unique: true });
    coll.createIndex({ continentCode: 1 });
    coll.createIndex({ lang: 1 });
})();
//# sourceMappingURL=Country.js.map