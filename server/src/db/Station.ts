import { collectionGetter } from "./conn";
import { ObjectId, FilterQuery, Cursor } from "mongodb";
import { City } from "./City";

export const getCollection = collectionGetter<Station>("stations");

(async () => {
  const coll = await getCollection();
  coll.createIndex({countryCode: 1, slug: 1});
  coll.createIndex({order: 1})
  coll.createIndex({countryCode: 1})
  //coll.createIndex({stateId: 1})
  //coll.createIndex({cityId: 1})
  //coll.createIndex({genresIds: 1})
  //coll.createIndex({"signals.type": 1, "signals.frecuency": 1});
  coll.createIndex({"signal.type": 1});
  coll.createIndex({"signal.frec": 1});
  coll.createIndex({"signal.type": 1, "signal.frec": 1});
  coll.createIndex({"signalCache.am": 1});
  coll.createIndex({"signalCache.fm": 1});
  coll.createIndex({origin: 1});
})()

export type Station = {

  _id: ObjectId

  order: number

  name: string
  slug: string
  //alt: string
  slogan?: string | null
  desc?: string | null
  search?: string
  address?: string

  web?: string | null
  facebook?: string | null
  twitter?: string | null

  // added for mangoradio
  instagram?: string | null
  youtube?: string | null
  discord?: string | null
  twitch?: string | null
  whatsApp?: {
    url: string,
    text: string
  } | null


  mail?: string | null
  tel?: {
    url: string
    text: string
  } | null

  signal?: {
    type: "am" | "fm",
    frec: number
  } | null

  votes: {
    up: number
    down: number
  }

  //country: ObjectId
  countryCode: string
  //genres: ObjectId[]
  //region?: ObjectId

  streams: Stream[],

  programming?: Programming | null

  origin: "rw" | "mt" | "both"

  mt?: {
    img: {
      lt: string
      gt: string
    },
    desc: string
    signals: Signal[]
  }

  signalCache: {
    am: number[]
    fm: number[]
  },

  mailVerirficationResult?: {
    mail: string,
    info: any
  }
}

export type Stream = {
  type: string
  mime: string
  //type: "mp3" | "aac" | "hls" | "ogg" | "rtmp" | "rtsp" | "m4a"
  //mime?: "audio/mp4" | "audio/aac" | "audio/ogg" | "audio/m4a"
  url: string
}

export type Signal = {
  //city: City
  type: "am" | "fm"
  frec: number
}

export type Programming = {
  [key: number]: ProgrammingDay | undefined
}

export type ProgrammingDay = ProgrammingEntry[];

export type ProgrammingEntry = {
  from: number,
  to: number,
  name: string
}

export const stationListProject = {
  _id: 1,
  name: 1,
  slug: 1,
  countryCode: 1,
  origin: 1,
  "mt.img": 1
}

export const stationProject = {
  _id: 1,
  
  name: 1,
  slug: 1,
  //img: 1,

  countryCode: 1,
  //regionId: 1,
  //cityId: 1,
  
  desc: 1,
  web: 1,
  tel: 1,
  facebook: 1,
  twitter: 1,
  twitch: 1,
  discord: 1,
  instagram: 1,
  youtube: 1,
  whatsApp: 1,
  address: 1,
  slogan: 1,

  //genresIds: 1,
  streams: 1,

  //signals: 1,
  signal: 1,

  votes: 1,

  programming: 1,

  order: 1,

  origin: 1,
  mt: 1
}

export const signal = async (type: "am" | "fm", frec: number, countryCode?: string | null) => {
  const coll = await getCollection();
  const filter: FilterQuery<Station> = {["signalCache." + type]: frec};
  if(countryCode != null)
    filter.countryCode = countryCode;
  return coll.find(filter).project(stationListProject);
}

export const signalList = async (type: "am" | "fm", countryCode?: string | null): Promise<number[]> => {
  const coll = await getCollection();
  const filter: FilterQuery<Station> = countryCode ? {countryCode} : {};
  const list = await coll.distinct("signalCache." + type, filter);
  list.sort((a: number, b: number) => a - b);
  return list;
}

export const countryIndex = async (countryCode: string) => {
  const coll = await getCollection();
  return coll.find({countryCode}).project(stationListProject);
}

export const getStation = async (countryCode: string, slug: string) => {
  const coll = await getCollection();
  const cursor = coll.find({countryCode, slug}).project(stationProject).limit(1);
  return await cursor.next();
}