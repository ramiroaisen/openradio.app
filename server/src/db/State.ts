import { collectionGetter } from "./conn";
import { ObjectId } from "mongodb";

export const getCollection = collectionGetter<State>("states");

(async () => {
  const coll = await getCollection();
  coll.createIndex({slug: 1})
  coll.createIndex({code: 1})
  coll.createIndex({countryCode: 1, slug: 1}, {unique: true})
})()

export type State = {
  _id: ObjectId
  name: string
  slug: string
  countryCode: string
  count: number
}
