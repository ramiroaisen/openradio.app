import {Collection, MongoClient} from "mongodb";

let _connection: Promise<MongoClient> | null = null;
export const getConnection = (): Promise<MongoClient> => {
    if(_connection != null) {
        return _connection;
    } else {
        _connection = new Promise<MongoClient>(async resolve => {
            const client = await MongoClient.connect("mongodb://localhost:27017", {useNewUrlParser: true, useUnifiedTopology: true});
            resolve(client)
        })

        return _connection;
    }
}

export const collectionGetter = <T>(coll: string) => async (): Promise<Collection<T>> => {
    const client = await getConnection();
    return client.db("openradio-mailing").collection<T>(coll);
}