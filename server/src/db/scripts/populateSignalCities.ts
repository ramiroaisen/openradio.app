import { Station, getCollection } from "../Station";
import { getCollection as getCities } from "../City";
import { strict as assert } from "assert";

/*
const main = async () => {
  const coll = await getCollection();
  const cities = await getCities();
  const cursor = await coll.find({signals: {$not: {$size: 0}}}).project({_id: 1, signals: 1, slug: 1, countryCode: 1});
  const total = await cursor.count();

  console.log(total, "sations");
  let i = 0;
  let station;
  while(station = await cursor.next()){
    console.log(++i, "/", total);
    const signals: Station["signals"] = [];
    console.log(JSON.stringify(station, null, 2));
    for(const signal of station.signals){
      const city = (await cities.findOne({_id: signal.cityId}))!;
      assert.notEqual(city, null);
      signals.push({...signal, city})
    }

    await coll.updateOne({_id: station._id}, {$set: {signals}});
  }

  console.log("Done!");
}

main();
*/