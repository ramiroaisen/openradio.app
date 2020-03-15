import { getCollection } from "../../db/Genre";
import path from "path";
import fs from "fs";

const dest = path.resolve(__dirname, "../cache");

const main = async () => {
  const coll = await getCollection();
  const list = await coll.find({}).project({_id: 0, slug: 1, name: 1}).sort({slug: 1}).toArray();

  const genres: any = {};

  for(const genre of list){
    genres[genre.slug] = genre.name;
  }

  fs.writeFileSync(dest + "/enGenres.json", JSON.stringify(genres, null, 2));
  fs.writeFileSync(dest + "/genres.json", JSON.stringify(list.map(genre => genre.slug), null, 2));

  console.log("Done!");
}

main();