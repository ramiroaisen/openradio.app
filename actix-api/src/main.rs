#![allow(non_snake_case)]
#![allow(unused_variables)]
#![allow(unused_imports)]
#![allow(dead_code)]

extern crate serde;
extern crate serde_json;

#[macro_use]
extern crate serde_derive;

#[macro_use]
pub mod enum_str;

pub mod db;
pub mod util;

use actix_web::{
  dev::RequestHead, guard::Guard, web, App, HttpRequest, HttpResponse, HttpServer, Responder,
};

#[macro_use]
extern crate bson;

#[macro_use]
extern crate json;

#[macro_use]
extern crate lazy_static;

use json::JsonValue;
use serde_derive::*;

extern crate tokio;

extern crate env_logger;

use crate::util::response::*;

#[derive(Serialize, Deserialize)]
pub struct ListQuery {
  countryCode: String,
  page: Option<usize>,
  pageSize: Option<usize>,
}

pub async fn list(query: web::Query<db::io::ListQuery>) -> HttpResponse {
  let paging = db::station::query::Paging::new(query.0.page, query.0.pageSize);
  let query = db::station::query::List{ cc: query.0.cc };
  let json = db::station::list(query, paging).await;
  jsonOk(json)
}

pub async fn signal(query: web::Query<db::io::SignalQuery>) -> HttpResponse {
  
  let paging = db::station::query::Paging::new(query.0.page, query.0.pageSize);

  let query = db::station::query::Signal {
    cc: query.0.cc,
    ff: query.0.ff,
    tt: query.0.tt
  };
  
  let result = db::station::signal(query, paging).await;
  
  jsonOk(result)
}

pub async fn frequency_list(query: web::Query<db::io::FrequencyListQuery>) -> HttpResponse {
  jsonOk(db::station::frequency_list(query.0.cc, query.0.tt).await)
}

pub async fn station(params: web::Path<(String, String)>) -> HttpResponse {
  let item = db::station::get(&params.0, &params.1).await;
  match item {
    Some(item) => jsonOk(item),
    None => json404()
  }
}

#[actix_rt::main]
async fn main() -> std::io::Result<()> {
  
  use actix_web::middleware::Logger;
  std::env::set_var("RUST_LOG", "actix_web=debug");
  
  env_logger::init();

  let server = HttpServer::new(|| {
    App::new()
      .wrap(Logger::default())
      .service(
        web::scope("/api")
          .route("/stations", web::get().to(list))
          .route("/signal", web::get().to(signal))
          .route("/stations/{cc}/{ss}", web::get().to(station))
          .default_service(web::route().to(json404)),
      )
      .default_service(web::route().to(default404))
  })
  .keep_alive(60);
  println!("listening on port {}", 8088);

  server.bind("127.0.0.1:8088")?.run().await
}
