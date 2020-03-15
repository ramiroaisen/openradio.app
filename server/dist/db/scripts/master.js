"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Station_1 = require("../Station");
const conqurrent_1 = require("conqurrent");
const threads_1 = require("threads");
const Country_1 = require("../Country");
const filename = (station) => {
    return `/home/ramiro/Dev/mytuner/site/stations/${station.slug}.html`;
};
const shared = async () => {
    const worker = new threads_1.Worker("./worker");
    const cpus = 8;
    const workers = await Promise.all(Array(cpus).fill(0).map(() => threads_1.spawn(worker)));
    const coll = await Station_1.getCollection();
    const stations = await coll.find({ origin: "mt" }).toArray();
    return { coll, stations, workers, cpus };
};
const getWebs = async () => {
    const { workers, coll, stations, cpus } = await shared();
    const total = stations.length;
    console.log(total, "stations");
    const start = Date.now();
    let ok = 0;
    let malformed = 0;
    let no = 0;
    const poll = conqurrent_1.concurrent(cpus);
    const urls = await poll(stations, async (station, i) => {
        console.log(i, "/", total, "|||", malformed, "|", no, "|", ok);
        const worker = workers[i % cpus];
        const url = await worker.getWeb(filename(station));
        if (url == null) {
            no++;
        }
        else {
            try {
                new URL(url);
                coll.updateOne({ _id: station._id }, { $set: { web: url } });
                ok++;
            }
            catch (e) {
                malformed++;
            }
        }
    });
    console.log(Date.now() - start);
};
const getSignals = async () => {
    const { workers, coll, stations, cpus } = await shared();
    const poll = conqurrent_1.concurrent(cpus);
    await poll(stations, async (station, i) => {
        const worker = workers[i % cpus];
        const [signals, log] = await worker.getSignals(filename(station));
        //i % 1000 || console.log(i);
        log && console.log(i, log);
        coll.updateOne({ _id: station._id }, { $set: { "mt.signals": signals } });
    });
    console.log("done!");
};
const updateCounters = async () => {
    const coll = await Country_1.getCollection();
    const countries = await coll.find().toArray();
    const stations = await Station_1.getCollection();
    let i = 0;
    let total = await countries.length;
    for (const country of countries) {
        console.log("updating", ++i, "/", total, "|", country.code, ": ", country.name);
        const count = async (type) => {
            const agg = [
                { $match: {
                        $and: [
                            { countryCode: country.code },
                            {
                                $or: [
                                    { "signal.type": type },
                                    { "mt.signals": { $elemMatch: { type } } }
                                ]
                            }
                        ]
                    } },
                { $count: "count" }
            ];
            const doc = await stations.aggregate(agg).toArray();
            return doc && doc[0] && doc[0].count || 0;
        };
        const ams = await count("am");
        const fms = await count("fm");
        const sum = await stations.find({ countryCode: country.code }).count();
        console.log(JSON.stringify({ ams, fms, sum }));
        await coll.updateOne({ _id: country._id }, { $set: {
                count: sum,
                fmCount: fms,
                amCount: ams
            } });
    }
};
updateCounters();
//# sourceMappingURL=master.js.map