import { MongoClient, Db, Collection } from "mongodb";

export const url = "mongodb://localhost:27017";
export const dbname = "openradio-2";

let db: Promise<Db> | null = null;

export const getConnection = async (): Promise<Db> => {
  
  // use always the same connection
  if(db != null)
    return db;

  return db = new Promise(async resolve => {
    const client = await MongoClient.connect(url, {
      useUnifiedTopology: true,
      useNewUrlParser: true      
    })

    resolve(client.db(dbname));
  })
}

export const collectionGetter = <T>(name: string): () => Promise<Collection<T>> => {
  
  // always use the same collection
  let memo: Promise<Collection<T>>;

  return async () => {
    if(memo != null){
      return memo;
    } else {
      return memo = new Promise(async resolve => {
        const db = await getConnection();
        resolve(db.collection<T>(name));
      })
    }
  }
}