"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const conn_1 = require("./conn");
exports.getCollection = conn_1.collectionGetter("genres");
(async () => {
    const coll = await exports.getCollection();
    coll.createIndex({ slug: 1 }, { unique: true });
    coll.createIndex({ name: 1 });
    coll.createIndex({ count: -1 });
})();
//# sourceMappingURL=Genre.js.map