#![allow(non_snake_case)]

#[macro_use]
extern crate lazy_static;

extern crate unidecode;
use unidecode::unidecode;

extern crate mongodb;
use mongodb::options::FindOptions;
use mongodb::Client;

extern crate bson;
use bson::{bson, doc};

#[macro_use]
extern crate serde_derive;
use serde_derive::*;

use std::time::Instant;

//#[macro_use]
//extern crate serde_json;

extern crate rayon;
use rayon::prelude::*;
//extern crate num_cpus;

// CONSTS
pub const ALLOWED_CHARS_LEN: usize = 37;
pub const ALLOWED_CHARS: [char; ALLOWED_CHARS_LEN] = [
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's',
  't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.',
];

pub const SPACE: char = ' ';
pub const NUMBERS: [char; 10] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
pub const DOT: char = '.';

#[derive(Deserialize)]
pub struct Signal {
  pub frec: f32,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct DocMtImg {
  lt: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct DocMtSignal {
  frec: Option<f32>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct DocMt {
  img: DocMtImg,
  signals: Vec<DocMtSignal>,
}

#[derive(Deserialize)]
pub struct Doc {
  _id: bson::oid::ObjectId,
  name: String,
  slug: String,
  countryCode: String,
  signal: Option<Signal>,
  origin: String,
  mt: Option<DocMt>,
  order: u32,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ItemMt {
  img: DocMtImg,
}

pub struct Item {
  _id: String,
  name: String,
  slug: String,
  countryCode: String,
  frecs: Vec<f32>,
  order: u32,
  mt: Option<ItemMt>,
  origin: String,
  search: String,
  tokens: Vec<String>,
  //ngrams: Vec<String>,
}

impl Item {
  pub fn from_doc(doc: Doc) -> Self {
    let search = normalize(&doc.name);
    let tokens = tokenize(&search);
    //let ngrams = ngramize(&tokens);
    let mut frecs = Vec::<f32>::new();

    if let Some(signal) = &doc.signal {
      frecs.push(signal.frec);
      /*
      if signal.frec == 89.9 {
        println!("{} - {}", signal.frec, search);
      }
      */
    }

    if let Some(mt) = &doc.mt {
      for signal in mt.signals.iter() {
        if let Some(frec) = signal.frec {
          if !frecs.contains(&frec) {
            frecs.push(frec);
          }
        }
      }
    }

    let mt = if let Some(mt) = &doc.mt {
      Some(ItemMt {
        img: mt.img.clone(),
      })
    } else {
      None
    };

    Self {
      _id: doc._id.to_string(),
      name: doc.name.clone(),
      slug: doc.slug,
      countryCode: doc.countryCode,
      frecs: frecs,
      order: doc.order,
      search: search.clone(),
      mt: mt,
      origin: doc.origin,
      tokens,
      //ngrams,
    }
  }
}

#[derive(Deserialize, Serialize, Debug)]
pub struct Query {
  search: String,
  countryCode: Option<String>,
  ipCountry: Option<String>,
  frecs: Vec<f32>,
  tokens: Vec<String>,
  //ngrams: Vec<String>,
  page: usize,
  pageSize: usize,
}

impl Query {
  pub fn from_io(query: &io::Query) -> Self {
    let search = normalize(&query.q).to_string();
    let tokens = tokenize(&search);
    //let ngrams = ngramize(&tokens);
    let frecs = parse_frecuencies(&search);

    Self {
      search,
      tokens,
      //ngrams,
      frecs,
      countryCode: query.countryCode.clone(),
      ipCountry: query.ipCountry.clone(),
      page: query.page,
      pageSize: query.pageSize,
    }
  }
}

#[derive(Serialize)]
pub struct SearchResult {
  _id: String,
  name: String,
  slug: String,
  countryCode: String,
  score: f32,
  origin: String,
  mt: Option<ItemMt>,
}

pub struct Index {
  items: Vec<Item>,
}

impl Index {
  pub fn new() -> Self {
    Self {
      items: Vec::<Item>::new(),
    }
  }

  pub fn from_cursor(cursor: mongodb::Cursor) -> Self {
    /*let items = cursor
      .map(|it| {
        let bson_doc = bson::Bson::from(it.unwrap());
        let doc: Doc = bson::from_bson(bson_doc).unwrap();
        Item::from_doc(doc)
      })
      .collect::<Vec<Item>>();
    */

    let items = cursor
      .collect::<Vec<Result<bson::Document, _>>>()
      .into_par_iter()
      .map(|res| {
        let it = res.unwrap();
        let bson_doc = bson::Bson::from(it);
        let doc: Doc = bson::from_bson(bson_doc).unwrap();
        Item::from_doc(doc)
      })
      .collect::<Vec<Item>>();


    Self { items }
  }

  pub fn empty() -> Self {
    Self { items: vec![] }
  }
}

pub fn normalize(src: &String) -> String {
  let decoded: String = unidecode(src.to_lowercase().as_str());

  let n = decoded
    .chars()
    .map(|ch| {
      if ALLOWED_CHARS.contains(&ch) {
        ch
      } else {
        SPACE
      }
    })
    .collect::<String>();
  let tokens = n.split_whitespace().collect::<Vec<&str>>();
  return tokens.join(" ");
}

pub fn tokenize(src: &String) -> Vec<String> {
  src
    .split_whitespace()
    .map(|t| t.to_string())
    .collect::<Vec<String>>()
}

pub fn ngramize(tokens: &Vec<String>) -> Vec<String> {
  let mut ngrams = Vec::<String>::new();
  for n in 1..(tokens.len() + 1).min(4) {
    tokens.windows(n).for_each(|w| ngrams.push(w.join(" ")))
  }

  ngrams
}

pub fn parse_frecuencies(src: &String) -> Vec<f32> {
  let mut chars = src.chars();
  let mut frecs = Vec::<f32>::new();

  while let Some(ch) = chars.next() {
    if NUMBERS.contains(&ch) {
      let mut has_dot = false;
      let mut acc = vec![ch];
      while let Some(ch) = chars.next() {
        if NUMBERS.contains(&ch) {
          acc.push(ch)
        } else if ch == DOT && has_dot == false {
          has_dot = true;
          acc.push(DOT);
        } else {
          break;
        }
      }

      // always ok
      if let Ok(frec) = acc.iter().collect::<String>().as_str().parse::<f32>() {
        frecs.push(frec);
      }
    }
  }

  frecs
}

pub mod scores {
  pub const MAX: f32 = 1.0;
  pub const EXACT_MATCH: f32 = MAX;
  pub const START_MATCH_SPACE: f32 = 0.500;
  pub const START_MATCH: f32 = 0.450;
  pub const INCLUDES: f32 = 0.400;
  pub const EXACT_FRECUENCY: f32 = 0.400;
  pub const EXACT_TOKEN: f32 = 0.300;
  pub const START_TOKEN: f32 = 0.200;
  pub const INCLUDES_TOKEN: f32 = 0.100;
}

fn classify(item: &Item, query: &Query) -> f32 {
  // Filter by countryCode
  if let Some(cc) = &query.countryCode {
    if cc != &item.countryCode {
      return 0.0;
    }
  }
  let mut score: f32 = 0.0;
  let mut countryScore: f32 = 0.0;

  if let Some(ipc) = &query.ipCountry {
    if ipc == &item.countryCode {
      countryScore = 0.200;
    }
  }

  if query.search.len() == 0 {
    return countryScore + 0.800;
  }

  // Exact match
  if query.search == item.search {
    return countryScore + 0.800;
  }

  if query.tokens.len() > 1 {
    if item.search.contains(&query.search) {
      score += 0.250;
      if item.search.starts_with(&query.search) {
        score += 0.250;
        if let Some(ch) = item.search.chars().nth(query.search.len()) {
          if ch == SPACE {
            score += 0.125;
          }
        }
      }
    }
  }

  for qtoken in query.tokens.iter() {
    for itoken in item.tokens.iter() {
      if qtoken == itoken {
        score += 0.150;
      } else if itoken.contains(qtoken.as_str()) {
        score += 0.075;
        if itoken.starts_with(qtoken.as_str()) {
          score += 0.025;
        } else if itoken.ends_with(qtoken.as_str()) {
          score += 0.010;
        }
      }
    }
  }
  // Frecuency match
  'outer: for f in query.frecs.iter() {
    for itemf in item.frecs.iter() {
      if itemf == f {
        score += 0.250;
        break 'outer;
      }
    }
  }

  if score != 0.0 {
    return score + countryScore;
  }

  return 0.0;
}

pub mod io {

  #[derive(Deserialize, Serialize, Debug)]
  pub struct Query {
    pub q: String,
    pub countryCode: Option<String>,
    pub ipCountry: Option<String>,
    pub page: usize,
    pub pageSize: usize,
  }

  #[derive(Deserialize, Serialize, Debug)]
  pub struct QueryMessage {
    pub id: usize,
    pub query: Query,
  }

  #[derive(Serialize, Debug)]
  pub struct Paging {
    pub page: usize,
    pub pages: usize,
    pub pageSize: usize,
    pub total: usize,
    pub nextPage: Option<usize>,
  }

  #[derive(Serialize)]
  pub struct Result {
    pub time: usize,
    pub paging: Paging,
    pub items: Vec<crate::SearchResult>
  }

  #[derive(Serialize)]
  pub struct Out {
    pub replyTo: usize,
    pub result: Result,
  }
}

pub fn sort(a: &(f32, &Item), b: &(f32, &Item)) -> std::cmp::Ordering {
  b.0
    .partial_cmp(&a.0)
    .unwrap()
    .then(a.1.order.partial_cmp(&b.1.order).unwrap())
}

pub fn search(query: &Query) -> io::Result {
  
  let start = Instant::now();
  let index = &*INDEX;
  
  let mut intermediate: Vec<(f32, &Item)> = index
    .items
    .par_iter()
    //.iter()
    .filter_map(|item| {
      let score = classify(item, &query);
      if score == 0.0 {
        None
      } else {
        Some((score, item))
      }
    })
    .collect();
  intermediate.par_sort_by(sort);

  let show = &intermediate[..]
    .chunks(query.pageSize as usize)
    .nth(query.page as usize - 1);
  let items = match show {
    Some(slice) => slice
      .to_vec()
      .iter()
      .map(|(score, item)| SearchResult {
        _id: item._id.clone(),
        name: item.name.clone(),
        slug: item.slug.clone(),
        countryCode: item.countryCode.clone(),
        origin: item.origin.clone(),
        mt: item.mt.clone(),
        score: *score,
      })
      .collect(),
    None => vec![],
  };
  let total = intermediate.len();
  let pages = (total as f32 / query.pageSize as f32).ceil() as usize;
  let nextPage = if query.page < pages {
    Some(query.page + 1)
  } else {
    None
  };

  let paging = io::Paging {
    page: query.page,
    pageSize: query.pageSize,
    pages,
    nextPage,
    total,
  };

  let time = start.elapsed().as_millis() as usize;

  //println!("{}", serde_json::to_string(&paging).unwrap());

  io::Result {
    time,
    paging,
    items
  }
}

lazy_static! {
  static ref INDEX: Index = {      
    let client = Client::with_uri_str("mongodb://localhost:27017").unwrap();
    let db = client.database("openradio-2");
    let coll = db.collection("stations");

    let filter = doc! {};

    let projection = doc! {
      "_id": 1,
      "name": 1,
      "slug": 1,
      "countryCode": 1,
      "signal": 1,
      "order": 1,
      "origin": 1,
      "mt.img.lt": 1,
      "mt.signals": 1
    };

    let sort = doc! {"order": 1};
    let opts = FindOptions::builder()
      .projection(projection)
      .sort(sort)
      .build();
    let cursor = coll.find(filter, opts).unwrap();
    let idx = Index::from_cursor(cursor);
    
    idx
  };
}




#[macro_use]
extern crate neon;

extern crate neon_serde;
use neon::prelude::*;

struct SearchTask {
  query: Query
}

impl Task for SearchTask {
  type Output = io::Result;
  type Error = String;
  type JsEvent = JsValue;

  fn perform(&self) -> Result<Self::Output, Self::Error> {
    Ok(search(&self.query))
  }

  fn complete(self, mut cx: TaskContext, result: Result<Self::Output, Self::Error>) -> JsResult<Self::JsEvent> {
    let value = neon_serde::to_value(&mut cx, &result.unwrap())?;
    Ok(value)
  }
}


pub fn search_neon(mut cx: FunctionContext) -> JsResult<JsUndefined> {
  let js_query = cx.argument::<JsValue>(0)?;
  let io_query: io::Query = neon_serde::from_value(&mut cx, js_query)?;
  let query = Query::from_io(&io_query);
  let f = cx.argument::<JsFunction>(1)?;
  let task = SearchTask{query};
  task.schedule(f);
  Ok(cx.undefined())
}

register_module!(mut m, {
  //let _index = &*INDEX;
  m.export_function("search", search_neon)?;
  Ok(())
});