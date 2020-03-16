import { connect } from "mongodb"
import { getCollection } from "../Country";
import { Station, getCollection as getStations } from "../Station";

const main = async () => {
  const client = await connect("mongodb://localhost:27017", {useNewUrlParser: true, useUnifiedTopology: true});
  const MT = client.db("openradio-3");
  //const countriesMT = await MT.collection("countries").find().toArray();

  const stationsMT = MT.collection("stations");
  const stations = await getStations();
  
  const countries = await getCollection();

  //await countries.updateMany({}, {$set: {origin: "rw"}});
  const ctoadd = await countries.find({origin: "mt"}).toArray();
  console.log(ctoadd.length, "countries added");

  const codes = ctoadd.map(c => c.code);

  console.log(JSON.stringify(codes));

  const stoadd = await stationsMT.find({countryCode: {$in: codes}}).count();
  console.log(stoadd, "stations to add")

  await stations.deleteMany({origin: "mt"});

  const map = (src: any): Station => {
    return {
      _id: src._id,
      name: src.name,
      slug: src.slug,
      order: src.order,
      origin: "mt",
      streams: src.streams,
      countryCode: src.countryCode,
      mt: {
        img: {
          lt: src.img.lt,
          gt: src.img.gt
        },
        desc: src.description,
        signals: src.signals,
      },
      votes: src.votes,
      programming: src.programming
    }
  }

  for(const cc of codes){
    console.log("Inserting stations from ", cc);
    const srcs = await stationsMT.find({countryCode: cc}).toArray();
    console.log(srcs.length, "stations");
    const mapped = srcs.map(map);
    const res = await stations.insertMany(mapped);
    console.log(res.insertedCount, "inserted");
  }

  /*
  add station orders
  for(const code of codes){
    console.log("ordering country ", code);
    const sts = await stationsMT.find({countryCode: code}).toArray();
    console.log(sts.length, "stations");
    let order = 0;
    for(const st of sts){
      stationsMT.updateOne({_id: st._id}, {$set:{order:++order}});
    }
  }
  */

  // insert toadd countries
  /*
  const mapped = toadd.map((c: any) => ({...c, origin: "mt"}));
  const res = await countries.insertMany(mapped);
  console.log(res.insertedCount, "countries inserted");
  */

  // set origin "rw" to stations;
  /*
  const res = await stations.updateMany({}, {$set: {origin: "rw"}});
  console.log(res.modifiedCount, "stations modified");
  */
}

main();