"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const remove_accents_1 = __importDefault(require("remove-accents"));
const Station_1 = require("./db/Station");
const utils_1 = require("./utils");
var Scores;
(function (Scores) {
    Scores[Scores["MAX"] = 1] = "MAX";
    Scores[Scores["EXACT_MATCH"] = 1] = "EXACT_MATCH";
    Scores[Scores["START_MATCH_SPACE"] = 0.975] = "START_MATCH_SPACE";
    Scores[Scores["START_MATCH"] = 0.95] = "START_MATCH";
    Scores[Scores["INCLUDES"] = 0.925] = "INCLUDES";
    Scores[Scores["EXACT_FRECUENCY"] = 0.9] = "EXACT_FRECUENCY";
    Scores[Scores["TOKEN_BASE"] = 0.5] = "TOKEN_BASE";
    Scores[Scores["EXACT_TOKEN"] = 0.125] = "EXACT_TOKEN";
    Scores[Scores["START_TOKEN"] = 0.06] = "START_TOKEN";
    Scores[Scores["INCLUDES_TOKEN"] = 0.025] = "INCLUDES_TOKEN";
})(Scores || (Scores = {}));
//export type ResultStation = Station & {
//  score: number
//}
const SPACE = " ".charCodeAt(0);
const normalize = (q) => remove_accents_1.default(q).toLowerCase().replace(/!([a-z0-9\.])+/g, " ").trim();
const tokenize = (q) => {
    const helper = [];
    const tokens = q.split(" ");
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (!helper.includes(token)) {
            helper.push(token);
        }
    }
    return helper;
};
const numberChars = "0123456789.";
const parseFrecuencies = (source) => {
    const frecs = [];
    for (let i = 0; i < source.length; i++) {
        let acc = "";
        let char = source.charAt(i);
        // TODO: Change to no regexp
        if (numberChars.includes(char)) {
            acc = char;
            while (char = source.charAt(++i)) {
                if (numberChars.includes(char)) {
                    acc += char;
                }
                else {
                    break;
                }
            }
            if (acc !== "")
                frecs.push(parseFloat(acc));
        }
    }
    return frecs;
};
const isBoxedStation = (item) => Array.isArray(item);
let index = [];
function paginate(cursor, paging) {
    console.log(`${cursor.length} results`);
    const { page, pageSize } = paging;
    const total = cursor.length;
    const start = (page - 1) * pageSize;
    const pages = Math.ceil(total / pageSize);
    const nextPage = pages > page ? page + 1 : null;
    const items = cursor.slice(start, start + pageSize).map((item) => {
        const helper = {};
        if (isBoxedStation(item)) {
            helper.score = item[1];
            item = item[0];
        }
        else {
            helper.score = 0;
        }
        for (const [key, value] of Object.entries(Station_1.stationListProject)) {
            if (value === 1) {
                helper[key] = item[key];
            }
        }
        return helper;
    });
    return { paging: { page, pageSize, start, total, pages, nextPage }, items };
}
exports.connect = async () => {
    if (index.length !== 0)
        return;
    const stations = await Station_1.getCollection();
    console.time("generating search index");
    const helper = await stations
        .find()
        .project({ ...Station_1.stationListProject, signal: 1, order: 1 })
        //.sort({popularity: 1})
        .toArray();
    helper.forEach(station => {
        const search = normalize(station.name);
        const tokens = tokenize(search);
        station.search = search;
        station.tokens = tokens;
    });
    index.push(...helper);
    console.timeEnd("generating search index");
};
exports.search = async (query, paging) => {
    console.time("searching");
    let cursor = index;
    // MAXLENGTH 50
    const q = normalize(query.q.slice(0, 50));
    const tokens = tokenize(q);
    //const match = q.match(/\d+(?:\.\d+)?/);
    //const signal = match ? parseFloat(match[0]) : null;
    const frecs = parseFrecuencies(q);
    console.log(`searching ${query.q}`);
    console.log(`norm:`, q);
    console.log(`tokens: `, JSON.stringify(tokens));
    console.log(`frecuencies:`, JSON.stringify(frecs));
    // If empty string return all index (no score)
    if (q.length === 0) {
        if (query.countryCode == null) {
            return paginate(cursor, paging);
        }
        else {
            return paginate(cursor.filter(item => item.countryCode === query.countryCode), paging);
        }
    }
    let results = [];
    const add = (item, score) => results.push([item, score]);
    for (let i = 0; i < cursor.length; i++) {
        await utils_1.tick();
        const item = cursor[i];
        // Filter by countryCode
        if (query.countryCode != null && query.countryCode !== item.countryCode)
            continue;
        // Exact match
        if (q === item.search) {
            add(item, Scores.EXACT_MATCH);
            continue;
        }
        /*
        // Frecuency match
        let frecMatched = false;
        parent: for(let j = 0; j < frecs.length; j++){
          const frec = frecs[j];
          for(let i = 0; i < item.signals.length; i++){
            const signal = item.signals[i];
            if(signal.frecuency && signal.frecuency === frec){
              boxedResults.push([item, Scores.EXACT_FRECUENCY]);
              frecMatched = true;
              break parent;
            }
          }
        }
    
    
        if(frecMatched) continue;
        */
        let _continue = false;
        for (let i = 0; i < frecs.length; i++) {
            if (item.signal && item.signal.frec === frecs[i]) {
                add(item, Scores.EXACT_FRECUENCY);
                _continue = true;
                break;
            }
        }
        if (_continue)
            continue;
        // Start match
        if (item.search.startsWith(q)) {
            // Follows a space (better match)
            if (item.search.charCodeAt(q.length) === SPACE) {
                add(item, Scores.START_MATCH_SPACE);
            }
            else {
                add(item, Scores.START_MATCH);
            }
            continue;
        }
        // Includes all string (more than one token)
        if (tokens.length > 1 && item.search.includes(q)) {
            add(item, Scores.INCLUDES);
            continue;
        }
        // Has token Score(base)=5000
        let score = 0;
        for (let j = 0; j < tokens.length; j++) {
            const token = tokens[j];
            for (let k = 0; k < item.tokens.length; k++) {
                const itemToken = item.tokens[k];
                // Token exact match
                if (token === itemToken) {
                    score += Scores.EXACT_TOKEN;
                    // Token startsWith
                }
                else if (itemToken.startsWith(token)) {
                    score += Scores.START_TOKEN;
                    // Token includes
                }
                else if (itemToken.includes(token)) {
                    score += Scores.INCLUDES_TOKEN;
                }
            }
        }
        // Sum Base 5000
        if (score !== 0) {
            add(item, score + Scores.TOKEN_BASE);
        }
    }
    console.time("sorting");
    results.sort((a, b) => b[1] - a[1] || a[0].order - b[0].order);
    console.timeEnd("sorting");
    const paginatedResult = paginate(results, paging);
    console.timeEnd("searching");
    return paginatedResult;
};
//# sourceMappingURL=search-ts.js.map