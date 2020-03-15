import path from "path";
import { getCollection } from "../../db/Country";
import fs from "fs";

const main = async () => {

  const dest = path.resolve(__dirname, "../cache/countries.json");

  const coll = await getCollection();
  
  const countries = await coll.find({}).project({_id: 0, code: 1, slug: 1, continentCode: 1}).sort({continentCode: 1, code: 1}).toArray();

  fs.writeFileSync(dest, JSON.stringify(countries, null, 2));
  
  console.log("Done!");
}

main();