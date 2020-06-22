"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
let _connection = null;
exports.getConnection = () => {
    if (_connection != null) {
        return _connection;
    }
    else {
        _connection = new Promise(async (resolve) => {
            const client = await mongodb_1.MongoClient.connect("mongodb://localhost:27017", { useNewUrlParser: true, useUnifiedTopology: true });
            resolve(client);
        });
        return _connection;
    }
};
exports.collectionGetter = (coll) => async () => {
    const client = await exports.getConnection();
    return client.db("openradio-mailing").collection(coll);
};
//# sourceMappingURL=conn.js.map