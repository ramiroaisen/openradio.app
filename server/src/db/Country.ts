import { collectionGetter } from "./conn";
import { ObjectId } from "mongodb";
import { LangCode } from "../i18n/v2/Locale";

export const getCollection = collectionGetter<Country>("countries");

(async () => {
  const coll = await getCollection();
  //coll.createIndex({slug: 1}, {unique: true});
  coll.createIndex({code: 1}, {unique: true});
  coll.createIndex({continentCode: 1});
  coll.createIndex({lang: 1});
})()

export type Country = {
  _id: ObjectId
  name: string
  code: string
  continentCode: string
  lang: LangCode
  count: number
  amCount: number
  fmCount: number
  origin: "rw" | "mt" | "both"
}
