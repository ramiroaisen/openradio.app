import removeAccents from "remove-accents";
import { Station, getCollection, stationListProject } from "./db/Station";
import { PaginatedResult, PagingOptions, SearchQuery } from "./db/common";
import { tick } from "./utils";

export type SearchResult = PaginatedResult<Station & {score: number}>

export type BoxedStation = [SearchStation, number];
export type SearchStation = Station & {
  search: string
  tokens: string[]
}

enum Scores {
  MAX = 1,
  EXACT_MATCH = Scores.MAX,
  START_MATCH_SPACE = 0.975,
  START_MATCH = 0.950,
  INCLUDES = 0.925,
  EXACT_FRECUENCY = 0.900,
  TOKEN_BASE = 0.500,
  EXACT_TOKEN = 0.125,
  START_TOKEN = 0.060,
  INCLUDES_TOKEN = 0.025
}

//export type ResultStation = Station & {
//  score: number
//}

const SPACE = " ".charCodeAt(0);

const normalize = (q: string) => removeAccents(q).toLowerCase().replace(/!([a-z0-9\.])+/g, " ").trim();

const tokenize = (q: string): string[] => {
  const helper: string[] = [];
  const tokens = q.split(" ");
  for(let i = 0; i < tokens.length; i++){
    const token = tokens[i];
    if(!helper.includes(token)){
      helper.push(token);
    }
  }
  return helper;
}

const numberChars = "0123456789."

const parseFrecuencies = (source: string) => {
  const frecs: number[] = [];
  for(let i = 0; i < source.length; i++){
    let acc = "";
    let char = source.charAt(i);
    // TODO: Change to no regexp
    if(numberChars.includes(char)){
      acc = char;
      while(char = source.charAt(++i)){
        if(numberChars.includes(char)){
          acc += char;
        } else {
          break;
        }
      }

      if(acc !== "")
        frecs.push(parseFloat(acc))
    }
  }

  return frecs;
}

const isBoxedStation = (item: Station | BoxedStation): item is BoxedStation => Array.isArray(item);

let index: SearchStation[] = [];

function paginate(cursor: (Station | BoxedStation)[], paging: PagingOptions): PaginatedResult<Station> {
  
  console.log(`${cursor.length} results`);

  const {page, pageSize} = paging;
  const total = cursor.length;
  const start = (page - 1) * pageSize;
  const pages = Math.ceil(total / pageSize);
  const nextPage = pages > page ? page + 1 : null;

  const items = cursor.slice(start, start + pageSize).map((item: Station | BoxedStation) => {
    
    const helper: any = {};

    if(isBoxedStation(item)){
      helper.score = item[1];
      item = item[0];
    } else {
      helper.score = 0;
    }

    for(const [key, value] of Object.entries(stationListProject)){
      if(value === 1){
        helper[key] = item[key as keyof Station];
      }
    }

    return helper;

  }) as Station[];

  return { paging: { page, pageSize, start, total, pages, nextPage }, items };
}


export const connect = async () => {
  if(index.length !== 0)
    return;

  const stations = await getCollection();
  console.time("generating search index");
  const helper = await 
    stations
      .find()
      .project({...stationListProject, signal: 1, order: 1})
      //.sort({popularity: 1})
      .toArray();

  helper.forEach(station => {
    const search = normalize(station.name);
    const tokens = tokenize(search);
    (station as SearchStation).search = search;
    (station as SearchStation).tokens = tokens;
  })

  index.push(...helper as SearchStation[]);

  console.timeEnd("generating search index");
}

export const search = async (query: SearchQuery, paging: PagingOptions) => {

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
  if(q.length === 0){
    if(query.countryCode == null){
      return paginate(cursor, paging);
    } else {
      return paginate(
        cursor.filter(item => item.countryCode === query.countryCode),
        paging
      )
    }
  }

  let results: BoxedStation[] = [];
  
  const add = (item: SearchStation, score: Scores) => results.push([item, score]);

  for(let i = 0; i < cursor.length; i++){
    await tick();
    const item = cursor[i];
    
    // Filter by countryCode
    if(query.countryCode != null && query.countryCode !== item.countryCode)
      continue;

    // Exact match
    if(q === item.search){
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
    for(let i = 0; i < frecs.length; i++){
      if(item.signal && item.signal.frec === frecs[i]){
        add(item, Scores.EXACT_FRECUENCY)
        _continue = true;
        break;
      }
    }

    if(_continue)
      continue;
    
    // Start match
    if(item.search.startsWith(q)){
      // Follows a space (better match)
      if(item.search.charCodeAt(q.length) === SPACE){
        add(item, Scores.START_MATCH_SPACE);
      } else {
        add(item, Scores.START_MATCH);
      }
      continue;
    }

    // Includes all string (more than one token)
    if(tokens.length > 1 && item.search.includes(q)){
      add(item, Scores.INCLUDES)
      continue;
    }

    // Has token Score(base)=5000
    let score = 0; 
    for(let j = 0; j < tokens.length; j++){
      const token = tokens[j];
      for(let k = 0; k < item.tokens.length; k++){
        const itemToken = item.tokens[k];
        
        // Token exact match
        if(token === itemToken){
          score += Scores.EXACT_TOKEN;
        
        // Token startsWith
        } else if(itemToken.startsWith(token)){
          score += Scores.START_TOKEN;
        
        // Token includes
        } else if(itemToken.includes(token)){
          score += Scores.INCLUDES_TOKEN;
        }
      }
    }

    // Sum Base 5000
    if(score !== 0){
      add(item, score + Scores.TOKEN_BASE);
    } 
  }

  console.time("sorting");
  results.sort((a, b) =>
    b[1] - a[1] || a[0].order - b[0].order 
  );

  console.timeEnd("sorting");

  const paginatedResult = paginate(results, paging);
  
  console.timeEnd("searching");

  return paginatedResult;
}