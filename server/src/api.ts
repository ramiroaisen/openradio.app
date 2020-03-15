import { FilterQuery, Cursor, Collection } from "mongodb";
import { Application, Request, Response, application, Router } from "express";
import { performance } from "perf_hooks";

//import * as Search from "./search-ts";

import * as Station from "./db/Station";
import * as Country from "./db/Country";
import * as Genre from "./db/Genre";
import { PaginatedResult, PagingOptions } from "./db/common";
import { State } from "./db/State";
import { City } from "./db/City";
import { Continent, getCollection as getContinentsCollection } from "./db/Continent";
import { stationsListProject, stationProject } from "./_db-common";
import { getSearcher, Query } from "./search";
import { $events } from "threads/dist/symbols";

let stations: Collection<Station.Station>;
let countries: Collection<Country.Country>;
let genres: Collection<Genre.Genre>;
let continents: Collection<Continent>;

export const connect = async () => {
  stations = await Station.getCollection();
  countries = await Country.getCollection();
  genres = await Genre.getCollection();
  continents = await getContinentsCollection(); 
}

export const paginate = async <T = Station.Station>(cursor: Cursor<T>, { sort = true, page = 1, pageSize = 60 } = {}): Promise<PaginatedResult<T>> => {
  const total = await cursor.count();
  const start = (page - 1) * pageSize;
  const pages = Math.ceil(total / pageSize);
  const nextPage = pages > page ? page + 1 : null;

  if(sort){
    cursor = cursor.sort({order: 1});
  }

  const items = await cursor
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .toArray();

  return { paging: { page, pageSize, start, total, pages, nextPage }, items };
}

export const list = async (query: FilterQuery<Station.Station> = {}, paging?: PagingOptions, project?: object): Promise<PaginatedResult<Station.Station>> => {
  project = project || Station.stationListProject;

  let cursor = stations
    .find(query)
    .project(project);
  return await paginate(cursor, paging);
}

export const getStation = async (countryCode: string, slug: string) => {
  const res = await stations.find({countryCode, slug}).project(Station.stationProject).limit(1).toArray();
  return res[0] || null;
}

// TODO: Must go from cache or find a better way
export const signalList = async (type: "am" | "fm", countryCode?: string) => {
  
  //const filter: FilterQuery<Station.Station> = { signals: { $elemMatch: {"signal.type": type} } }; 
  /*
  let filter: FilterQuery<Station.Station> = {
    $or: [
      {"signal.type": type},
      {"mt.signals": {$elemMatch: {type}}}
    ]
  };

  if(countryCode != null) filter = {$and: [{countryCode}, filter]};
  */
  //if (countryCode != null) filter.countryCode = countryCode;
  //const signals = await stations!.distinct("signal.frec", filter);
  //return signals.sort((a: number, b: number) => a - b);

  /*
  const cursor = stations.aggregate<{frec: number, count: number}>([
    { $match: filter },
    { $group: { _id: "$signal.frec", count: { $sum: 1 } } },
    { $project: { frec: "$_id", count: 1, _id: 0 } },
    { $sort: { frec: 1 } }
  ]);
  */
  let filter1 = {"signal.type": type, "signal.frec": {$ne: null}} as FilterQuery<Station.Station>;
  let filter2 = {origin: "mt", "mt.signals": {$ne: []}} as FilterQuery<Station.Station>;

  if(countryCode != null){
    filter1 = {$and: [{countryCode}, filter1]};
    filter2 = {$and: [{countryCode}, filter2]};
  }

  const sigs = await stations.distinct("signal.frec", filter1);
  const mt = (await stations.aggregate([
    {$match: filter2},
    {$unwind: "$mt.signals"},
    {$replaceRoot: {newRoot: "$mt.signals"}},
    {$match: {type}},
    {$project: {_id: 0, frec: 1}}
  ]).toArray()) as any as {frec: number}[];

  for(let i = 0; i < mt.length; i++){
    let frec = mt[i].frec;
    if(sigs.indexOf(frec) === -1) 
      sigs.push(frec);
  }

  sigs.sort((a: number, b: number) => a - b);

  return sigs;
  
  /*
  const signals = await cursor.toArray();
  
  return signals.map(({frec, count}) => [frec, count])
  */
  /*
  const countryCodeFilter = countryCode ? {countryCode} : {};

  const cursor = stations.aggregate([
    {$match: countryCodeFilter},
    {$unwind: "$signals"},
    {$replaceRoot: {newRoot: "$signals"}},
    {$match: {type, frecuency: {$ne: null}}},
    {$group: {_id: "$frecuency", count: {$sum: 1}}},
    {$sort: {_id: 1}}
  ]) as any;
  const res = await cursor.toArray();
  return res.map(({_id, count}: {_id: number, count: number}) => [_id, count]);
  /*
  const agg: {[key: number]: number} = {};
  let doc;
  while(doc = (await cursor.next()) as {_id: number, count: number}){
    agg[doc._id] = doc.count;
  }
  return agg;
  */
}

export const signal = async (type: "am" | "fm", frec: number, countryCode: string | null = null, paging: PagingOptions) => {
  /*
  const filter: FilterQuery<Station.Station> = {
    signals: { $elemMatch: {type, frecuency} }
  };
  */

  let filter: FilterQuery<Station.Station> = {
    $or: [
      { signal: {type, frec}},
      {"mt.signals": { $elemMatch: { type, frec }}}
    ]
  }

  if (countryCode != null) filter = {$and: [{countryCode}, filter]};

  return await list(filter, paging);
}

const countryProject = {
  _id: 0,
  name: 1,
  code: 1,
  contCode: 1,
  lang: 1,
  count: 1,
  amCount: 1,
  fmCount: 1,  
}

export const countryList = async () => {
  return countries.aggregate([{
    $lookup: {
      from: "stations",
      localField: "code",
      foreignField: "countryCode",
      as: "stations"
    }
  }, {
    $project: {
      _id: 1,
      name: 1,
      code: 1,
      lang: 1,
      count: { $size: "$stations" }
    }
  }]).sort({name: 1}).toArray();

  //return await countries.find().project(countryProject).sort({name: 1}).toArray();
}

export const updateCountries = async () => {
  // TODO: do all this in one command
  console.log("updating countries");
  const start = performance.now();
  const items = await countries.aggregate([{
    $lookup: {
      from: "stations",
      localField: "code",
      foreignField: "countryCode",
      as: "stations"
    }
  }, {
    $project: {
      _id: 1,
      name: 1,
      code: 1,
      lang: 1,
      count: { $size: "$stations" }
    }
  }]).sort({name: 1}).toArray();

  console.log(`countries getted in ${performance.now() - start}ms`);

  for (let i = 0; i < items.length; i++) {
    const country = items[i];
    console.log(`updating country ${country.name} => ${country.count} stations`);
    const fmCount = await stations.find({countryCode: country.code, "signal.type": "fm"}).count();
    const amCount = await stations.find({countryCode: country.code, "signal.type": "am"}).count();
    await countries.updateOne({ _id: country._id }, { $set: { count: country.count, amCount, fmCount } });
  }

  const processTime = performance.now() - start;
  console.log(`countries updated in ${processTime}ms`);
}

export const getCountry = async (code: string) => {
  const country = await countries.findOne({ code });
  return country;
}

export const getCountryInfo = async (code: string) => {
  const c = await countries.aggregate([
    {$match: { code } },
    {$lookup: {
      from: "states",
      localField: "code",
      foreignField: "countryCode",
      as: "states"
    }},
    {$lookup: {
      from: "cities",
      localField: "code",
      foreignField: "countryCode",
      as: "cities"
    }}
  ]).toArray();

  return c && c[0] as null | Country.Country & { states: State[], cities: City[] };
}

//export const contList = async () => {
//  return await db!.continents.find({}).project({ _id: 0 }).toArray();
//}

export const getRequestPaging = (req: Request): PagingOptions => {
  return {
    pageSize: Math.min(parseInt(req.query.pageSize) || 60, 60),
    page: parseInt(req.query.page) || 1,
  }
}

export const getGenreList = async (countryCode?: string) => {
  
  const filter = countryCode ? {countryCode} : {};

  return stations.aggregate([
    {$match: filter},
    {$unwind: "$genresIds"},
    {$group: {_id: "$genresIds", count: {$sum: 1}}},
    {$match: {count: {$ne: 0}}},
    {$sort: {count: -1}},
    {$lookup: {
      from: "genres",
      localField: "_id",
      foreignField: "_id",
      as: "genre"
    }},
    {$unwind: "$genre"},
    {$project: {
      _id: 1,
      slug: "$genre.slug",
      count: 1
    }}
  ]).toArray();
}

export const getContinents = async () => {
  return (await continents.aggregate([
    {$lookup: {
      from: "countries",
      localField: "code",
      foreignField: "continentCode",
      as: "countries"
    }},
    {$project: {
      _id: 0,
      code: 1,
      "countries.code": 1
    }}
  ])
  .toArray())
  .filter(c => !!(c as any).countries.length);
}

export const attach = async (app: Application) => {
  
  await connect();
  const {search} = await getSearcher();

  const api = Router();

  const param = (name: string, validator: (value: string) => boolean) => {
    api.param(name, (req, res, next, value) => {
      if(validator(value)){
        next();
      } else {
        next("route");
      }
    })
  }

  param("cc", cc => /^[a-z]{2}$/.test(cc));
  param("tt", tt => tt === "am" || tt === "fm");
  param("f", f => /^[0-9]+|[0-9]+\.[0-9]+$/.test(f))

  api.get("/search", async (req, res) => {
    try{
      const countryCode = req.query.countryCode || null;
      const q = req.query.q || "";
      const paging = getRequestPaging(req);
      const query: Query = {...paging, q, countryCode};
      if(req.ipCountry != null){
        query.ipCountry = req.ipCountry.code;
      }
      const result = await search(query);
      res.json(result);
    } catch(e){
      res.type("application/json");
      res.status(500).send(JSON.stringify({error: {message: e.message}}));
    }
  })

  api.get("/stations/:cc", async (req, res) => {
    const countryCode = req.params.cc;
    const paging = getRequestPaging(req);
    const json = await list({ countryCode }, paging);
    res.json(json);
  })

  api.get("/stations/:cc/:s", async (req, res) => {
    const countryCode = req.params.cc;
    const slug = req.params.s;
    const station = await getStation(countryCode, slug);
    res.json(station);
  })

  api.get("/signal/:tt", async (req, res) => {
    const type = req.params.tt as "am" | "fm";
    const countryCode = req.query.countryCode || null;
    const json = await signalList(type, countryCode)
    res.json(json);
  })

  api.get("/signal/:tt/:f", async (req, res) => {
    const type = req.params.tt as "am" | "fm";
    const frec = parseFloat(req.params.frec);
    const countryCode = req.query.countryCode || null;
    const paging = getRequestPaging(req);
    const json = await signal(type, frec, countryCode, paging);
    res.json(json);
  })

  api.get("/continents", async (req, res) => {
    const json = await getContinents();
    res.json(json);
  })

  api.get("/countries", async (req, res) => {
    const json = await countryList();
    res.json(json);
  })

  api.get("/countries/:cc", async (req, res) => {
    const json = await countries.findOne({code: req.params.cc});
    res.json(json);
  })

  app.use("/api", api);

  /*

  app.get("/api/genres", async (req, res) => {
    const json = await getGenreList(req.query.countryCode);
    res.json(json);
  }),

  app.get("/api/genres/:genre", (req, res) => {
    const genre = genres.findOne({slug: req.params.genre});
    if(genre == null)
      return res.json({error: {code: 404, message: "Not Found"}});
    
    res.json(genre);
  })

  app.get("/api/by-genre/:genre", async (req, res) => {
    const genre = await genres.findOne({slug: req.params.genre});
    if(genre == null)
      return res.json({error: {code: 404, message: "Not Found"}});
    
    const filter: FilterQuery<Station.Station> = {genresIds: genre._id};
    if(req.query.countryCode)
      filter.countryCode = req.query.countryCode;
    
    const paging = getRequestPaging(req);

    const result = await list(filter, paging);

    res.json({...result, genre});
  })
  */
}