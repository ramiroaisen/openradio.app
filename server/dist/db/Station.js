"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const conn_1 = require("./conn");
exports.getCollection = conn_1.collectionGetter("stations");
(async () => {
    const coll = await exports.getCollection();
    coll.createIndex({ countryCode: 1, slug: 1 });
    coll.createIndex({ order: 1 });
    coll.createIndex({ countryCode: 1 });
    //coll.createIndex({stateId: 1})
    //coll.createIndex({cityId: 1})
    //coll.createIndex({genresIds: 1})
    //coll.createIndex({"signals.type": 1, "signals.frecuency": 1});
    coll.createIndex({ "signal.type": 1 });
    coll.createIndex({ "signal.frec": 1 });
    coll.createIndex({ "signal.type": 1, "signal.frec": 1 });
})();
exports.stationListProject = {
    _id: 1,
    name: 1,
    slug: 1,
    //img: 1,
    countryCode: 1
};
exports.stationProject = {
    _id: 1,
    name: 1,
    slug: 1,
    //img: 1,
    countryCode: 1,
    //regionId: 1,
    //cityId: 1,
    desc: 1,
    web: 1,
    tel: 1,
    facebook: 1,
    twitter: 1,
    address: 1,
    slogan: 1,
    //genresIds: 1,
    streams: 1,
    //signals: 1,
    signal: 1,
    votes: 1,
    programming: 1,
    order: 1
};
//# sourceMappingURL=Station.js.map