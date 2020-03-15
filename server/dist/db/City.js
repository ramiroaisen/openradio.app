"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const conn_1 = require("./conn");
exports.getCollection = conn_1.collectionGetter("cities");
(async () => {
    const coll = await exports.getCollection();
    coll.createIndex({ slug: 1 });
    coll.createIndex({ code: 1 });
    coll.createIndex({ countryCode: 1 });
    coll.createIndex({ stateId: 1 });
    coll.createIndex({ stateId: 1, slug: 1 }, { unique: true });
})();
//# sourceMappingURL=City.js.map