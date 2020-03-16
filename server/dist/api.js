"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const perf_hooks_1 = require("perf_hooks");
//import * as Search from "./search-ts";
const Station = __importStar(require("./db/Station"));
const Country = __importStar(require("./db/Country"));
const Genre = __importStar(require("./db/Genre"));
const Continent_1 = require("./db/Continent");
const search_1 = require("./search");
let stations;
let countries;
let genres;
let continents;
exports.connect = async () => {
    stations = await Station.getCollection();
    countries = await Country.getCollection();
    genres = await Genre.getCollection();
    continents = await Continent_1.getCollection();
};
exports.paginate = async (cursor, { sort = true, page = 1, pageSize = 60 } = {}) => {
    const total = await cursor.count();
    const start = (page - 1) * pageSize;
    const pages = Math.ceil(total / pageSize);
    const nextPage = pages > page ? page + 1 : null;
    if (sort) {
        cursor = cursor.sort({ order: 1 });
    }
    const items = await cursor
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .toArray();
    return { paging: { page, pageSize, start, total, pages, nextPage }, items };
};
exports.list = async (query = {}, paging, project) => {
    project = project || Station.stationListProject;
    let cursor = stations
        .find(query)
        .project(project);
    return await exports.paginate(cursor, paging);
};
exports.getStation = async (countryCode, slug) => {
    const res = await stations.find({ countryCode, slug }).project(Station.stationProject).limit(1).toArray();
    return res[0] || null;
};
// TODO: Must go from cache or find a better way
exports.signalList = async (type, countryCode) => {
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
    let filter1 = { "signal.type": type, "signal.frec": { $ne: null } };
    let filter2 = { origin: "mt", "mt.signals": { $ne: [] } };
    if (countryCode != null) {
        filter1 = { $and: [{ countryCode }, filter1] };
        filter2 = { $and: [{ countryCode }, filter2] };
    }
    const sigs = await stations.distinct("signal.frec", filter1);
    const mt = (await stations.aggregate([
        { $match: filter2 },
        { $unwind: "$mt.signals" },
        { $replaceRoot: { newRoot: "$mt.signals" } },
        { $match: { type } },
        { $project: { _id: 0, frec: 1 } }
    ]).toArray());
    for (let i = 0; i < mt.length; i++) {
        let frec = mt[i].frec;
        if (sigs.indexOf(frec) === -1)
            sigs.push(frec);
    }
    sigs.sort((a, b) => a - b);
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
};
exports.signal = async (type, frec, countryCode = null, paging) => {
    /*
    const filter: FilterQuery<Station.Station> = {
      signals: { $elemMatch: {type, frecuency} }
    };
    */
    let filter = {
        $or: [
            { signal: { type, frec } },
            { "mt.signals": { $elemMatch: { type, frec } } }
        ]
    };
    if (countryCode != null)
        filter = { $and: [{ countryCode }, filter] };
    return await exports.list(filter, paging);
};
const countryProject = {
    _id: 0,
    name: 1,
    code: 1,
    contCode: 1,
    lang: 1,
    count: 1,
    amCount: 1,
    fmCount: 1,
};
exports.countryList = async () => {
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
        }]).sort({ name: 1 }).toArray();
    //return await countries.find().project(countryProject).sort({name: 1}).toArray();
};
exports.updateCountries = async () => {
    // TODO: do all this in one command
    console.log("updating countries");
    const start = perf_hooks_1.performance.now();
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
        }]).sort({ name: 1 }).toArray();
    console.log(`countries getted in ${perf_hooks_1.performance.now() - start}ms`);
    for (let i = 0; i < items.length; i++) {
        const country = items[i];
        console.log(`updating country ${country.name} => ${country.count} stations`);
        const fmCount = await stations.find({ countryCode: country.code, "signal.type": "fm" }).count();
        const amCount = await stations.find({ countryCode: country.code, "signal.type": "am" }).count();
        await countries.updateOne({ _id: country._id }, { $set: { count: country.count, amCount, fmCount } });
    }
    const processTime = perf_hooks_1.performance.now() - start;
    console.log(`countries updated in ${processTime}ms`);
};
exports.getCountry = async (code) => {
    const country = await countries.findOne({ code });
    return country;
};
exports.getCountryInfo = async (code) => {
    const c = await countries.aggregate([
        { $match: { code } },
        { $lookup: {
                from: "states",
                localField: "code",
                foreignField: "countryCode",
                as: "states"
            } },
        { $lookup: {
                from: "cities",
                localField: "code",
                foreignField: "countryCode",
                as: "cities"
            } }
    ]).toArray();
    return c && c[0];
};
//export const contList = async () => {
//  return await db!.continents.find({}).project({ _id: 0 }).toArray();
//}
exports.getRequestPaging = (req) => {
    return {
        pageSize: Math.min(parseInt(req.query.pageSize) || 60, 60),
        page: parseInt(req.query.page) || 1,
    };
};
exports.getGenreList = async (countryCode) => {
    const filter = countryCode ? { countryCode } : {};
    return stations.aggregate([
        { $match: filter },
        { $unwind: "$genresIds" },
        { $group: { _id: "$genresIds", count: { $sum: 1 } } },
        { $match: { count: { $ne: 0 } } },
        { $sort: { count: -1 } },
        { $lookup: {
                from: "genres",
                localField: "_id",
                foreignField: "_id",
                as: "genre"
            } },
        { $unwind: "$genre" },
        { $project: {
                _id: 1,
                slug: "$genre.slug",
                count: 1
            } }
    ]).toArray();
};
exports.getContinents = async () => {
    return (await continents.aggregate([
        { $lookup: {
                from: "countries",
                localField: "code",
                foreignField: "continentCode",
                as: "countries"
            } },
        { $project: {
                _id: 0,
                code: 1,
                "countries.code": 1
            } }
    ])
        .toArray())
        .filter(c => !!c.countries.length);
};
exports.attach = async (app) => {
    await exports.connect();
    const { search } = await search_1.getSearcher();
    const api = express_1.Router();
    const param = (name, validator) => {
        api.param(name, (req, res, next, value) => {
            if (validator(value)) {
                next();
            }
            else {
                next("route");
            }
        });
    };
    param("cc", cc => /^[a-z]{2}$/.test(cc));
    param("tt", tt => tt === "am" || tt === "fm");
    param("f", f => /^[0-9]+|[0-9]+\.[0-9]+$/.test(f));
    api.get("/search", async (req, res) => {
        try {
            const countryCode = req.query.countryCode || null;
            const q = req.query.q || "";
            const paging = exports.getRequestPaging(req);
            const query = { ...paging, q, countryCode };
            if (req.ipCountry != null) {
                query.ipCountry = req.ipCountry.code;
            }
            const result = await search(query);
            res.json(result);
        }
        catch (e) {
            res.type("application/json");
            res.status(500).send(JSON.stringify({ error: { message: e.message } }));
        }
    });
    api.get("/stations/:cc", async (req, res) => {
        const countryCode = req.params.cc;
        const paging = exports.getRequestPaging(req);
        const json = await exports.list({ countryCode }, paging);
        res.json(json);
    });
    api.get("/stations/:cc/:s", async (req, res) => {
        const countryCode = req.params.cc;
        const slug = req.params.s;
        const station = await exports.getStation(countryCode, slug);
        res.json(station);
    });
    api.get("/signal/:tt", async (req, res) => {
        const type = req.params.tt;
        const countryCode = req.query.countryCode || null;
        const json = await exports.signalList(type, countryCode);
        res.json(json);
    });
    api.get("/signal/:tt/:f", async (req, res) => {
        const type = req.params.tt;
        const frec = parseFloat(req.params.f);
        const countryCode = req.query.countryCode || null;
        const paging = exports.getRequestPaging(req);
        const json = await exports.signal(type, frec, countryCode, paging);
        res.json(json);
    });
    api.get("/continents", async (req, res) => {
        const json = await exports.getContinents();
        res.json(json);
    });
    api.get("/countries", async (req, res) => {
        const json = await exports.countryList();
        res.json(json);
    });
    api.get("/countries/:cc", async (req, res) => {
        const json = await countries.findOne({ code: req.params.cc });
        res.json(json);
    });
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
};
//# sourceMappingURL=api.js.map