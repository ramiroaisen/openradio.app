"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Station_1 = require("../Station");
const main = async () => {
    var _a, _b, _c, _d;
    const stations = await Station_1.getCollection();
    const cursor = stations.find().project({ _id: 1, mt: 1, origin: 1, signal: 1, name: 1 });
    const total = await cursor.count();
    let i = 0;
    while (true) {
        console.log(++i, "/", total);
        let item = await cursor.next();
        if (item == null)
            break;
        let fm = [];
        let am = [];
        if (((_a = item.signal) === null || _a === void 0 ? void 0 : _a.type) === "fm") {
            fm.push((_b = item.signal) === null || _b === void 0 ? void 0 : _b.frec);
        }
        else if (((_c = item.signal) === null || _c === void 0 ? void 0 : _c.type) === "am") {
            am.push((_d = item.signal) === null || _d === void 0 ? void 0 : _d.frec);
        }
        if (item.mt) {
            for (const signal of item.mt.signals) {
                if (signal.type === "fm") {
                    fm.push(signal.frec);
                }
                else if (signal.type === "am") {
                    am.push(signal.frec);
                }
            }
        }
        await stations.updateOne({ _id: item._id }, {
            $set: { signalCache: { am, fm } }
        });
    }
};
main();
//# sourceMappingURL=signalCache.js.map