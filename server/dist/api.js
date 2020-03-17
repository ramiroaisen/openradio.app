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
        const json = await exports.paginate(await Station.countryIndex(countryCode), paging);
        res.json(json);
    });
    api.get("/stations/:cc/:s", async (req, res) => {
        const countryCode = req.params.cc;
        const slug = req.params.s;
        const station = await Station.getStation(countryCode, slug);
        res.json(station);
    });
    api.get("/signal/:tt", async (req, res) => {
        const type = req.params.tt;
        const countryCode = req.query.countryCode || null;
        const json = await Station.signalList(type, countryCode);
        res.json(json);
    });
    api.get("/signal/:tt/:f", async (req, res) => {
        const type = req.params.tt;
        const frec = parseFloat(req.params.f);
        const countryCode = req.query.countryCode || null;
        const paging = exports.getRequestPaging(req);
        const json = await exports.paginate(await Station.signal(type, frec, countryCode), paging);
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
};
//# sourceMappingURL=api.js.map