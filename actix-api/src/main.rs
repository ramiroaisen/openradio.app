#![allow(non_snake_case)]
#![allow(unused_variables)]
#![allow(unused_imports)]
#![allow(dead_code)]

mod db;

use actix_web::{
  web, 
  App, 
  HttpResponse, 
  HttpRequest, 
  HttpServer, 
  Responder,
};

#[macro_use]
extern crate bson;

use json::JsonValue;
use serde_derive::*;

extern crate tokio;

#[derive(Serialize, Deserialize)]
pub struct ListQuery {
  countryCode: String,
  page: Option<usize>,
  pageSize: Option<usize>
}

pub async fn list(query: web::Query<db::io::ListQuery>) -> impl Responder {
  
  let result = db::countryIndex(query.0).await;

  HttpResponse::Ok()
    .content_type("application/json")
    .body(serde_json::to_string(&result).unwrap())
}

#[actix_rt::main]
async fn main() -> std::io::Result<()> {

  let server = HttpServer::new(|| {
    App::new().service(
      web::scope("/api")
        .route("/stations", web::get().to(list))
    )
  }).keep_alive(60);

  println!("listening on port {}", 8088);

  server.bind("127.0.0.1:8088")?
  .run()
  .await
}
