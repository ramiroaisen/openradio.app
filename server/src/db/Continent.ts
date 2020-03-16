import { collectionGetter } from "./conn";
import { ObjectId } from "mongodb";

export const getCollection = collectionGetter<Continent>("continents");

(async () => {
  const coll = await getCollection();
  coll.createIndex({code: 1}, {unique: true})
  //coll.createIndex({slug: 1}, {unique: true})
})()

export type Continent = {
  _id: ObjectId
  name: string
  code: string
}
