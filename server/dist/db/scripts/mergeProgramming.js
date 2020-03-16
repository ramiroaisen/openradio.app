"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// put programming from mt to rw db (station npm equality based on stream's urls)
const mongodb_1 = require("mongodb");
const Station_1 = require("../Station");
const main = async () => {
    const connMt = await mongodb_1.connect("mongodb://localhost:27017", { useNewUrlParser: true, useUnifiedTopology: true });
    const stationsMt = connMt.db("openradio-3").collection("stations");
    const stationsRw = await Station_1.getCollection();
    const cursor = await stationsMt.find({ streams: { $ne: [] } }).sort({ order: -1 });
    const total = await cursor.count();
    let i = 0;
    let src;
    while (src = await cursor.next()) {
        console.log(++i, "/", total);
        const urls = src.streams.map(stream => stream.url);
        const res = await stationsRw.updateMany({ "streams.url": { $in: urls } }, {
            $set: { programming: src.programming }
        });
        console.log(res.modifiedCount, " modified");
    }
    const progCount = await stationsRw.find({ programming: { $ne: null } }).count();
    console.log(progCount, "stations with Programming");
};
main();
//# sourceMappingURL=mergeProgramming.js.map