use bson::oid::ObjectId;
use serde::{Serializer};

pub fn serialize_oid<S>(o: &ObjectId, s: S) -> Result<S::Ok, S::Error>
where S: Serializer {
  s.serialize_str(o.to_hex().as_str())
}


pub mod response {
  
  use actix_web::{
    dev::RequestHead, guard::Guard, web, App, HttpRequest, HttpResponse, HttpServer, Responder,
  };
  
  pub fn default404() -> HttpResponse {
    HttpResponse::NotFound()
      .content_type("text/plain")
      .body("404 Not Found")
  }
  
  pub fn json404() -> HttpResponse {
    let json = object! {
      error: {
        code: 404,
        message: "Not Found"
      }
    };
    HttpResponse::NotFound()
      .content_type("application/json")
      .body(json.dump())
  }
  
  pub fn jsonOk(json: impl serde::Serialize) -> HttpResponse {
    HttpResponse::Ok()
      .content_type("application/json")
      .body(serde_json::to_string(&json).unwrap())
  }
}