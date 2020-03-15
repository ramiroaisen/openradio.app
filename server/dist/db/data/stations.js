"use strict";
/*
const stations4 = require("./stations5.json") as Station5.Station5[];
import { Station, getCollection, Stream} from "../Station";
import { ObjectId } from "mongodb";
import fs from "fs";
import path from "path";
import {strict} from "assert";

export namespace Station5 {

  export type Station5 = {
    name: string
    slug: string
    description?: string
    img: {
      lt: string
      gt: string
    }
    genres: Genre[]
    signals: Signal[]
    votes: {
      up: number,
      down: number
    },
    country: string,
    region?: string,
    city?: string
    web?: string
    streams: Stream[]
    hasProgrammingInfo: boolean
    programming?: Programming

  }

  export type Genre = {
    name: string
    slug: string
    url: string
  }

  export type Signal = {
    region: {
      slug: string
      url: string
    }
    signal: {
      type: "am" | "fm" | "web" | "other"
      frecuency: number
    }
  }

  export type Stream = {
    type: string
    url: string
  }

  export type Programming = {
    "monday": ProgrammingDay
    "tuesday": ProgrammingDay
    "wednesday": ProgrammingDay
    "thursday": ProgrammingDay
    "friday": ProgrammingDay
    "saturday": ProgrammingDay
    "sunday": ProgrammingDay
  }

  export type ProgrammingDay = ProgrammingEntry[];

  export type ProgrammingEntry = {
    from: number,
    to: number,
    name: string
  };

}

import countries from "./collections/coutries.json";
import states from "./collections/states.json";
import cities from "./collections/cities.json";
import genres from "./collections/genres.json";

import {getCollection as getCities} from "../City";

const stations: Station[] = [];

const main = async () => {

  const cityColl = await getCities();
  
  for(const station of stations4){
    for(const signal of station.signals){
      const count = await cityColl.find({slug: signal.region.slug}).count();
      if(!count)
        console.log(count, signal.region.slug, "=>", signal.region.url);
    }
  }

  console.log("Start!");

  for(const station of stations4){

    const country = countries.find(c => c.slug === station.country)!
    
    const state = states.find(s => {
        return s.countryCode === country.code &&
          s.slug === station.region
    })

    const city = cities.find(c => {
      return c.countryCode === country.code &&
        c.slug === station.city
    })

    const signals: Station["signals"] = [];
    for(const signal of station.signals){
      const city = cities.find(city => {
        return city.countryCode === country.code &&
          city.slug === signal.region.slug
      })!

      strict.notEqual(city, null);
      strict.notEqual(city, undefined);

      signals.push({
        type: signal.signal.type,
        frecuency: signal.signal.frecuency,
        city: {...city, _id: new ObjectId(city._id), stateId: new ObjectId(city.stateId), id: 0}
      })
    }

    stations.push({
      _id: new ObjectId(),
      name: station.name,
      slug: station.slug,
      search: station.name,
      description: station.description,

      img: {
        lt: path.basename(station.img.lt),
        gt: path.basename(station.img.gt),
      },

      countryCode: country.code,
      stateId: state && new ObjectId(state._id),
      cityId: city && new ObjectId(city._id),

      genresIds: station.genres.map(genre => {
        return new ObjectId(genres.find(gen => {
          return gen.slug === genre.slug
        })!._id)
      }),
      
      streams: station.streams.map(stream => {
        return {
          ...stream,
          mime: "audio/" + stream.type
        } as Stream
      }),

      signals,

      votes: station.votes,

      programming: station.programming,

      order: 0
    })
  }

  console.log(stations.length, "stations");
  
  fs.writeFileSync(__dirname + "/collections/stations.json", JSON.stringify(stations, null, 2));
  
  const coll = await getCollection();
  await coll.drop();
  await coll.insertMany(stations);
  console.log("Done!");
}

main();
*/ 
//# sourceMappingURL=stations.js.map