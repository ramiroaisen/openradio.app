use serde_derive;
use crate::enum_str;
use crate::util::serialize_oid;
use std::collections::BTreeMap as Map;
use lazy_static::lazy_static;
use mongodb::options::*;
use bson::ordered::{OrderedDocument as Doc};

pub mod mt{
  #[derive(Serialize, Deserialize)]
  pub struct Mt {
    pub img: Img,
    pub desc: Option<String>
  }

  #[derive(Serialize, Deserialize)]
  pub struct Img {
    pub lt: String,
    pub gt: String
  }

  enum_str!(SignalType{
    AM("am"),
    FM("fm"),
    WEB("web"),
    OTHER("other"),
  });

  #[derive(Serialize, Deserialize)]
  pub struct Signal {
    pub r#type: SignalType,
    pub frec: Option<f64>,
    pub regionName: String,
    pub regionHref: String,
    pub r#str: String
  }

  #[derive(Serialize, Deserialize)]
  pub struct ListItem {
    pub img: ListItemImg
  }

  #[derive(Serialize, Deserialize)]
  pub struct ListItemImg {
    lt: String
  }
}


#[derive(Serialize, Deserialize)]
pub struct Tel {
  url: String,
  text: String
}

enum_str!(SignalType{
  AM("am"),
  FM("fm"),
});

enum_str!(Origin{
  RW("rw"),
  MT("mt"),
  BOTH("both"),
});

#[derive(Serialize, Deserialize)]
pub struct Signal{
  r#type: SignalType,
  frec: f64
}

#[derive(Serialize, Deserialize)]
pub struct Votes{
  up: u32,
  down: u32
}

#[derive(Serialize, Deserialize)]
pub struct SignalCache {
  pub am: Vec<f64>,
  pub fm: Vec<f64>
}


#[derive(Serialize, Deserialize)]
pub struct Stream{
  pub r#type: String,
  pub mime: String,
  pub url: String
  //type: "mp3" | "aac" | "hls" | "ogg" | "rtmp" | "rtsp" | "m4a"
  //mime?: "audio/mp4" | "audio/aac" | "audio/ogg" | "audio/m4a" 
}


pub type Programming = Map<String, Option<Vec<ProgrammingEntry>>>;

pub struct ProgrammingEntry {
  from: f64,
  to: f64,
  name: String
}

#[derive(Serialize, Deserialize)]
pub struct Full {
  #[serde(serialize_with = "serialize_oid")]
  pub _id: bson::oid::ObjectId,
  pub order: u32,
  pub name: String,
  pub slug: String,
  pub slogan: Option<String>,
  pub desc: Option<String>,
  pub address: Option<String>,
  pub web: Option<String>,
  pub facebook: Option<String>,
  pub twitter: Option<String>,
  pub mail: Option<String>,
  pub tel: Option<Tel>,
  pub signal: Option<Signal>,
  pub votes: Votes,
  pub countryCode: String,
  pub streams: Vec<Stream>,

  //pub programming: Option<Programming>,

  pub origin: Origin,

  pub mt: Option<mt::Mt>,
  pub signalCache: SignalCache
}

#[derive(Serialize, Deserialize)]
pub struct ListItem {
  #[serde(serialize_with = "serialize_oid")]
  pub _id: bson::oid::ObjectId,
  pub name: String,
  pub slug: String,
  pub countryCode: String,
  pub origin: Origin,
  #[serde(skip_serializing_if = "Option::is_none")]
  pub mt: Option<mt::ListItem>
}

#[derive(Serialize, Deserialize)]
pub struct Item {
  
  #[serde(serialize_with = "serialize_oid")]
  pub _id: bson::oid::ObjectId,
  
  pub order: u32,
  pub name: String,
  pub slug: String,
  
  #[serde(skip_serializing_if = "Option::is_none")]
  pub slogan: Option<String>,
  
  #[serde(skip_serializing_if = "Option::is_none")]
  pub desc: Option<String>,
  
  #[serde(skip_serializing_if = "Option::is_none")]
  pub address: Option<String>,
  
  #[serde(skip_serializing_if = "Option::is_none")]
  pub web: Option<String>,
  
  #[serde(skip_serializing_if = "Option::is_none")]
  pub facebook: Option<String>,
  
  #[serde(skip_serializing_if = "Option::is_none")]
  pub twitter: Option<String>,
  
  #[serde(skip_serializing_if = "Option::is_none")]
  pub mail: Option<String>,
  
  #[serde(skip_serializing_if = "Option::is_none")]
  pub tel: Option<Tel>,
  
  #[serde(skip_serializing_if = "Option::is_none")]
  pub signal: Option<Signal>,
  
  pub votes: Votes,
  pub countryCode: String,
  pub streams: Vec<Stream>,

  //pub programming: Option<Programming>,

  pub origin: Origin,

  #[serde(skip_serializing_if = "Option::is_none")]
  pub mt: Option<mt::Mt>,
}

pub async fn get(cc: &String, ss: &String) -> Option<Item> {
  
  let coll = &super::STATIONS;

  let filter = doc!{"countryCode": cc, "slug": ss};
  let projection = doc!{
    "_id": 1,
    "order": 1,
    "name": 1,
    "slug": 1,
    "slogan": 1,
    "desc": 1,
    "address": 1,
    "web": 1,
    "facebook": 1,
    "twitter": 1,
    "mail": 1,
    "tel": 1,
    "signal": 1,
    "votes": 1,
    "countryCode": 1,
    "streams": 1,
    "programming": 1,
    "origin": 1,
    "mt": 1,
  };

  let opts = FindOneOptions::builder()
    .projection(projection)
    .build();

  let doc = coll.find_one(filter, opts).unwrap()?;

  let item: Item = bson::from_bson(bson::Bson::Document(doc)).unwrap();

  Some(item)
}


pub mod query{
  
  pub struct Paging {
    pub page: i64,
    pub pageSize: i64
  }

  impl Paging {
    pub fn new(page: Option<i64>, pageSize: Option<i64>) -> Self {
      let mut paging = Self::default();
      if let Some(page) = page { paging.page = page } 
      if let Some(pageSize) = pageSize { paging.pageSize = pageSize }
      paging
    }
  }

  impl Default for Paging {
    fn default() -> Paging {
      Paging {
        page: 1,
        pageSize: 60
      }
    }
  }

  pub struct List {
    pub cc: Option<String>,
  }

  impl Default for List{
    fn default() -> List {
      List { cc: None }
    }
  }

  pub struct Signal {
    pub cc: Option<String>,
    pub tt: super::SignalType,
    pub ff: f64
  }
}

pub fn list_projection() -> Doc {
  doc!{
    "_id": 1,
    "name": 1,
    "slug": 1,
    "countryCode": 1,
    "origin": 1,
    "mt": 1
  }
}

pub fn list_sort() -> Doc {
  doc!{"order": 1}
}

pub async fn paginate(filter: Doc,  paging: query::Paging) -> super::Page<ListItem> {
  let coll = &super::STATIONS;
  let projection = list_projection();
  let sort = list_sort();

  let page = paging.page;
  let pageSize = paging.pageSize;
  let start = (page - 1) * pageSize;
  let total = coll.count_documents(filter.clone(), None).unwrap();
  let pages = (total as f32 / pageSize as f32).ceil() as i64; 
  let nextPage = match page < pages {
    true => Some(page + 1),
    false => None
  };

  let opts = FindOptions::builder()
    .sort(sort)
    .projection(projection)
    .skip(start)
    .limit(pageSize)
    .build();

  let cursor = coll.find(filter, opts);

  let items: Vec<ListItem> = cursor.unwrap()
    .map(|res| {
      let doc = res.unwrap();
      let item: ListItem = bson::from_bson(bson::Bson::Document(doc)).unwrap();
      item
    })
    .collect();

  super::Page {
    paging: super::Paging {
      page,
      pageSize,
      pages,
      total,
      start,
      nextPage
    },

    items
  }
}

pub async fn list(query: query::List, paging: query::Paging) -> super::Page<ListItem> {

  let mut filter = bson::ordered::OrderedDocument::new();

  if let Some(cc) = query.cc {
    filter.insert_bson(String::from("countryCode"), bson::Bson::String(cc));
  }

  paginate(filter, paging).await
}

pub async fn signal(query: query::Signal, paging: query::Paging) -> super::Page<ListItem> {

  let coll = &super::STATIONS;

  let ff = query.ff;
  let tt = query.tt;

  let key = format!("signalCache.{}", tt);

 let filter = match query.cc {  
    Some(cc) => doc!{ key: ff, "countryCode": cc },
    None => doc!{ key: ff }
  };

  paginate(filter, paging).await
}

pub async fn frequency_list(cc: Option<String>, tt: SignalType) -> Vec<f64> {

  let coll = &super::STATIONS;

  let key = format!("signalCache.{}", tt.as_str());

  let filter = match cc {
    Some(cc) => doc!{"countryCode": cc},
    None => doc!{}
  };

  let mut ffs = coll
    .distinct(key.as_str(), filter, None)
    .unwrap()
    .into_iter()
    .map(|ff| bson::from_bson::<f64>(ff).unwrap() )
    .collect::<Vec<f64>>();
  
  ffs.sort_by(|a, b| a.partial_cmp(b).unwrap());
  
  ffs
}