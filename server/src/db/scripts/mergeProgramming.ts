// put programming from mt to rw db (station npm equality based on stream's urls)
import { connect } from "mongodb"
import { Station, getCollection } from "../Station";

const main = async () => {
  const connMt = await connect("mongodb://localhost:27017", {useNewUrlParser: true, useUnifiedTopology: true});
  const stationsMt = connMt.db("openradio-3").collection<Station>("stations");

  const stationsRw = await getCollection();

  const cursor = await stationsMt.find({streams: {$ne: []}}).sort({order: -1});
  const total = await cursor.count();
  let i = 0;
  let src;

  while(src = await cursor.next()){
    console.log(++i, "/", total);
    const urls = src.streams.map(stream => stream.url);
    const res = await stationsRw.updateMany({"streams.url": {$in: urls}}, {
      $set: { programming: src.programming }
    });

    console.log(res.modifiedCount, " modified");
  }

  const progCount = await stationsRw.find({programming: {$ne: null}}).count();
  console.log(progCount, "stations with Programming")
}

main();

