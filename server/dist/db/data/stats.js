"use strict";
/*
import path from "path";
import { Station5 } from "./stations";

const stations = require("./stations5.json") as Station5.Station5[]

const count = {
  description: 0,
  country: 0,
  region: 0,
  city: 0,
  web: 0,
  img: {
    lt: 0,
    gt: 0,
  },
  votes: {
    up: 0,
    down: 0,
  },
  streams: 0,
  programming: 0,
  signals: {
    am: 0,
    fm: 0,
    web: 0,
    other: 0,
    none: 0,
    counts: new Map<number, number>(),
  },
  streamCount: new Map<number, number>(),
  repeatedImg: 0,
  equalImg: 0
}

const imgSet = new Set<string>();

for(const station of stations){
  const lt = path.basename(station.img.lt);
  const gt = path.basename(station.img.gt);

  station.description && count.description++;
  station.country && count.country++;
  station.region && count.region++;
  station.city && count.city++;
  station.img.lt && count.img.lt++;
  station.img.gt && count.img.gt++;
  station.programming && count.programming++;
  station.streams.length && count.streams++;

  const c = count.signals.counts.get(station.streams.length) || 0;
  count.signals.counts.set(station.streams.length, c + 1);

  const sc = count.streamCount.get(station.streams.length) || 0;
  count.streamCount.set(station.streams.length, sc + 1);

  if(station.signals.length === 0){
    count.signals.none++;
  } else {
    const signalType = {
      am: false,
      fm: false,
      web: false,
      other: false,
    }
    for(const signal of station.signals){
      signalType[signal.signal.type] = true;
    }

    for(const key in signalType){
      if(signalType[key as keyof typeof signalType]){
        count.signals[key as keyof typeof count.signals]++;
      }
    }
  }

  imgSet.add(station.img.lt);
  if(lt === gt){
    count.equalImg++;
  } else {
    console.log(station.name, lt, gt)
  }
}

count.repeatedImg = stations.length - imgSet.size;

console.log(count);
*/ 
//# sourceMappingURL=stats.js.map