"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
exports.url = "mongodb://localhost:27017";
exports.dbname = "openradio-2";
let db = null;
exports.getConnection = async () => {
    // use always the same connection
    if (db != null)
        return db;
    return db = new Promise(async (resolve) => {
        const client = await mongodb_1.MongoClient.connect(exports.url, {
            useUnifiedTopology: true,
            useNewUrlParser: true
        });
        resolve(client.db(exports.dbname));
    });
};
exports.collectionGetter = (name) => {
    // always use the same collection
    let memo;
    return async () => {
        if (memo != null) {
            return memo;
        }
        else {
            return memo = new Promise(async (resolve) => {
                const db = await exports.getConnection();
                resolve(db.collection(name));
            });
        }
    };
};
//# sourceMappingURL=conn.js.map