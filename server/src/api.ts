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
    const json = await paginate(await Station.countryIndex(countryCode), paging);
    res.json(json);
  })

  api.get("/stations/:cc/:s", async (req, res) => {
    const countryCode = req.params.cc;
    const slug = req.params.s;
    const station = await Station.getStation(countryCode, slug);
    res.json(station);
  })

  api.get("/signal/:tt", async (req, res) => {
    const type = req.params.tt as "am" | "fm";
    const countryCode = req.query.countryCode || null;
    const json = await Station.signalList(type, countryCode)
    res.json(json);
  })

  api.get("/signal/:tt/:f", async (req, res) => {
    const type = req.params.tt as "am" | "fm";
    const frec = parseFloat(req.params.f);
    const countryCode = req.query.countryCode || null;
    const paging = getRequestPaging(req);
    const json = await paginate(await Station.signal(type, frec, countryCode), paging);
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
}