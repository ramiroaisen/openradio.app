"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
async function main() {
    const client = await mongodb_1.connect("mongodb://localhost:27017");
    const src = client.db("openradio");
    const dest = client.db("openradio-2");
    const cloneStations = async () => {
        console.log("cloning stations");
        const srcStations = src.collection("stations");
        const destStations = dest.collection("stations");
        await destStations.drop();
        const cursor = await srcStations.find({});
        while (true) {
            const station = await cursor.next();
            if (station == null)
                break;
            station.order = station.popularity;
            delete station.popularity;
            await destStations.insertOne(station);
        }
    };
    const cloneCountries = async () => {
        console.log("cloning countries");
        const srcCountries = src.collection("countries");
        const destCountries = dest.collection("countries");
        await destCountries.drop();
        const cursor = await srcCountries.find({});
        while (true) {
            const item = await cursor.next();
            if (item == null)
                break;
            const country = {
                _id: item._id,
                name: item.name,
                code: item.code,
                continentCode: item.contCode,
                lang: item.lang,
                count: item.count,
                amCount: item.amCount,
                fmCount: item.fmCount
            };
            await destCountries.insertOne(country);
        }
    };
    const cloneContinents = async () => {
        console.log("cloning countries");
        const srcC = src.collection("continents");
        const destC = dest.collection("continents");
        await destC.drop();
        const cursor = await srcC.find({});
        while (true) {
            const item = await cursor.next();
            if (item == null)
                break;
            const c = {
                _id: item._id,
                code: item.code,
                name: item.name,
            };
            await destC.insertOne(c);
        }
    };
    await cloneStations();
    await cloneCountries();
    await cloneContinents();
    console.log("Done!");
}
main();
//# sourceMappingURL=clone.js.map