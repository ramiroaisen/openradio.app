"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Station_1 = require("../Station");
const map = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
];
const formatProgramming = (src) => {
    const p = {};
    for (const key in src) {
        p[map.indexOf(key)] = src[key];
    }
    return p;
};
const main = async () => {
    const coll = await Station_1.getCollection();
    const cursor = coll.find({ programming: { $ne: null } });
    const count = await cursor.count();
    console.log(`${count} stations`);
    let i = 0;
    let station;
    while (station = await cursor.next()) {
        console.log(++i, "/", count, station.name);
        await coll.updateOne({ _id: station._id }, { $set: {
                programming: formatProgramming(station.programming)
            } });
    }
    console.log("Done!");
};
main();
//# sourceMappingURL=formatProgramming.js.map