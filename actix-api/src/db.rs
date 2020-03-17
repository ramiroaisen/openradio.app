extern crate mongodb;
use mongodb::{Client, Database, Collection, options::{FindOptions, CountOptions}};

extern crate lazy_static;
use lazy_static::lazy_static;

use bson::ordered::{OrderedDocument as Doc};

use serde_derive::*;

use bson::oid::ObjectId;
use serde::{Serialize, Serializer};

lazy_static!{
  pub static ref CLIENT: Client = Client::with_uri_str("mongodb://localhost:27017").unwrap();
  pub static ref DB: Database = CLIENT.database("openradio-2");
  pub static ref STATIONS: Collection = DB.collection("stations"); 
}

fn serialize_oid<S>(o: &ObjectId, s: S) -> Result<S::Ok, S::Error>
where S: Serializer {
  s.serialize_str(o.to_hex().as_str())
}

pub mod io {
  
  use serde::{Serialize, Deserialize};
  
  #[derive(Serialize, Deserialize)]
  pub struct ListQuery {
    pub countryCode: Option<String>,
    pub page: Option<i64>,
    pub pageSize: Option<i64>
  }
}

pub fn stations_list_project() -> Doc {
  doc!{
    "_id": 1,
    "name": 1,
    "slug": 1,
    "countryCode": 1,
    "origin": 1,
    "mt": 1
  }
}

pub fn stations_sort() -> Doc {
  doc! {"order": 1}
}

pub mod inner {
  use serde_derive::*;
  
  #[derive(Serialize, Deserialize)]
  pub struct Mt{
    img: MtImg
  }

  #[derive(Serialize, Deserialize)]
  pub struct MtImg{
    lt: String,
    gt: String,
  }
}

#[derive(Serialize, Deserialize)]
pub struct StationListItem {
  
  #[serde(serialize_with = "serialize_oid")]
  _id: ObjectId,
  
  name: String,
  slug: String,
  countryCode: String,
  origin: String,
 
  #[serde(skip_serializing_if = "Option::is_none")]
  mt: Option<inner::Mt>
}

#[derive(Serialize)]
pub struct Paging {
  page: i64,
  pageSize: i64,
  start: i64,
  total: i64,
  pages: i64,
  nextPage: Option<i64>,
}

#[derive(Serialize)]
pub struct Page {
  paging: Paging,
  items: Vec<StationListItem>
}


pub async fn countryIndex(query: io::ListQuery) -> Page {
  let coll = &STATIONS;
   
  let filter = match query.countryCode {
    Some(cc) => doc!{"countryCode": cc},
    None => doc!{}
  };
  
  /*
  let cursor = coll.find(filter, options).unwrap();
  
  let stations: Vec<StationListItem> = cursor
    .map(|res| {
      let doc = res.unwrap();
      let item: StationListItem = bson::from_bson(bson::Bson::Document(doc)).unwrap();
      item
    })
    .collect();
  */

  list(filter, query.page, query.pageSize, None)
}

pub fn list(filter: Doc, page: Option<i64>, page_size: Option<i64>, sort: Option<bool>) -> Page{
  
  let coll = &STATIONS;
  let coll = &STATIONS;
  
  let sort = sort.unwrap_or(true);
  let page: i64 = page.unwrap_or(1);
  let pageSize: i64 = page_size.unwrap_or(60);
  let start = (page - 1) * pageSize;
  let total = coll.count_documents(filter.clone(), None).unwrap();
  let pages = (total as f32 / pageSize as f32).ceil() as i64; 
  let nextPage = {
    if page < pages {
      Some(page + 1)
    } else {
      None
    }
  };

  let opts = {
    if sort {
      FindOptions::builder()
        .projection(stations_list_project())
        .skip(start)
        .limit(pageSize)
        .build()
    } else {
      FindOptions::builder()
        .projection(stations_list_project())
        .sort(stations_sort())
        .skip(start)
        .limit(pageSize)
        .build()
    }
  };
  
  let cursor = coll.find(filter, opts);

  let items: Vec<StationListItem> = cursor.unwrap()
  .map(|res| {
    let doc = res.unwrap();
    let item: StationListItem = bson::from_bson(bson::Bson::Document(doc)).unwrap();
    item
  })
  .collect();

  Page {
    paging: Paging {
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