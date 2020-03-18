extern crate mongodb;
use mongodb::{Client, Database, Collection, options::{FindOptions, FindOneOptions, CountOptions}};

extern crate lazy_static;
use lazy_static::lazy_static;

use bson::ordered::{OrderedDocument as Doc};

use serde_derive::*;

use bson::oid::ObjectId;
use serde::{Serialize, Serializer};

use crate::enum_str;

pub mod station;

lazy_static!{
  pub static ref CLIENT: Client = Client::with_uri_str("mongodb://localhost:27017").unwrap();
  pub static ref DB: Database = CLIENT.database("openradio-2");
  pub static ref STATIONS: Collection = DB.collection("stations"); 
  pub static ref COUNTRIES: Collection = DB.collection("countries"); 
}

pub mod io {
  
  use crate::enum_str;
  use super::station;
  use serde::{Serialize, Deserialize};
  
  #[derive(Deserialize)]
  pub struct ListQuery {
    pub cc: Option<String>,
    pub page: Option<i64>,
    pub pageSize: Option<i64>
  }

  enum_str!(SignalType{
    AM("am"),
    FM("fm"),
  });

  #[derive(Deserialize)]
  pub struct SignalQuery {
    pub cc: Option<String>,
    pub tt: station::SignalType,
    pub ff: f64,
    pub page: Option<i64>,
    pub pageSize: Option<i64>,
  }

  #[derive(Deserialize)]
  pub struct FrequencyListQuery {
    pub cc: Option<String>,
    pub tt: station::SignalType
  }

  #[derive(Deserialize)]
  pub struct StationQuery {
    pub cc: String,
    pub ss: String
  }
}

#[derive(Serialize)]
pub struct Paging {
  page: i64,
  pageSize: i64,
  start: i64,
  total: i64,
  pages: i64,
  #[serde(skip_serializing_if = "Option::is_none")]
  nextPage: Option<i64>,
}

#[derive(Serialize)]
pub struct Page<T> {
  paging: Paging,
  items: Vec<T>
}
