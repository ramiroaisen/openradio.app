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
    coll.createIndex({ "signalCache.am": 1 });
    coll.createIndex({ "signalCache.fm": 1 });
    coll.createIndex({ origin: 1 });
})();
exports.stationListProject = {
    _id: 1,
    name: 1,
    slug: 1,
    countryCode: 1,
    origin: 1,
    "mt.img": 1
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
    twitch: 1,
    discord: 1,
    instagram: 1,
    youtube: 1,
    whatsApp: 1,
    address: 1,
    slogan: 1,
    //genresIds: 1,
    streams: 1,
    //signals: 1,
    signal: 1,
    votes: 1,
    programming: 1,
    order: 1,
    origin: 1,
    mt: 1
};
exports.signal = async (type, frec, countryCode) => {
    const coll = await exports.getCollection();
    const filter = { ["signalCache." + type]: frec };
    if (countryCode != null)
        filter.countryCode = countryCode;
    return coll.find(filter).project(exports.stationListProject);
};
exports.signalList = async (type, countryCode) => {
    const coll = await exports.getCollection();
    const filter = countryCode ? { countryCode } : {};
    const list = await coll.distinct("signalCache." + type, filter);
    list.sort((a, b) => a - b);
    return list;
};
exports.countryIndex = async (countryCode) => {
    const coll = await exports.getCollection();
    return coll.find({ countryCode }).project(exports.stationListProject);
};
exports.getStation = async (countryCode, slug) => {
    const coll = await exports.getCollection();
    const cursor = coll.find({ countryCode, slug }).project(exports.stationProject).limit(1);
    return await cursor.next();
};
//# sourceMappingURL=Station.js.map