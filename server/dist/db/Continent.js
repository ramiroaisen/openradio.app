"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const conn_1 = require("./conn");
exports.getCollection = conn_1.collectionGetter("continents");
(async () => {
    const coll = await exports.getCollection();
    coll.createIndex({ code: 1 }, { unique: true });
    //coll.createIndex({slug: 1}, {unique: true})
})();
//# sourceMappingURL=Continent.js.map