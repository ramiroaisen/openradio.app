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

#[macro_use]
extern crate json;

#[macro_use]
extern crate lazy_static;


use json::JsonValue;
use serde_derive::*;

extern crate tokio;

#[derive(Serialize, Deserialize)]
pub struct ListQuery {
  countryCode: String,
  page: Option<usize>,
  pageSize: Option<usize>
}

pub async fn default404() -> impl Responder {
  HttpResponse::NotFound()
    .content_type("text/plain")
    .body("404 Not Found")
}

pub async fn json404() -> impl Responder {
  let json = object!{
    error: {
      code: 404,
      message: "Not Found"
    }
  };
  HttpResponse::NotFound()
    .content_type("application/json")
    .body(json.dump())
}

pub async fn list(query: web::Query<db::io::ListQuery>) -> impl Responder {
  
  let result = db::countryIndex(query.0).await;

  HttpResponse::Ok()
    .content_type("application/json")
    .body(serde_json::to_string(&result).unwrap())
}

extern crate env_logger;

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
          .default_service(web::route().to(json404))
      
      ).default_service(web::route().to(default404))
  
  }).keep_alive(60);

  println!("listening on port {}", 8088);

  server.bind("127.0.0.1:8088")?
  .run()
  .await
}
