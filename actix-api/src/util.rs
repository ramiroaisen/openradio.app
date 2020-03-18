use bson::oid::ObjectId;
use serde::{Serializer};

pub fn serialize_oid<S>(o: &ObjectId, s: S) -> Result<S::Ok, S::Error>
where S: Serializer {
  s.serialize_str(o.to_hex().as_str())
}
