import { collectionGetter } from "./conn";
import { ObjectId } from "mongodb";

export const getCollection = collectionGetter<Genre>("genres");

(async () => {
  const coll = await getCollection();
  coll.createIndex({slug: 1}, {unique: true})
  coll.createIndex({name: 1})
  coll.createIndex({count: -1})
})()

export type Genre = {
  _id: ObjectId
  name: string
  slug: string
  count: number
}