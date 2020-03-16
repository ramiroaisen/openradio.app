import { collectionGetter } from "./conn";
import { ObjectId } from "mongodb";

export const getCollection = collectionGetter<City>("cities");

(async () => {
  const coll = await getCollection();
  coll.createIndex({slug: 1})
  coll.createIndex({code: 1})
  coll.createIndex({countryCode: 1})
  coll.createIndex({stateId: 1})
  coll.createIndex({stateId: 1, slug: 1}, {unique: true})
})()

export type City = {
  _id: ObjectId
  id: number
  name: string
  slug: string

  countryCode: string
  stateId: ObjectId

  count: number
}