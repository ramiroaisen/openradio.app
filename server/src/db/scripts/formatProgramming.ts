import { getCollection, ProgrammingDay } from "../Station"

const map = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

type Programming = {
  [key: number]: ProgrammingDay
}

const formatProgramming = (src: any): Programming  => {
  const p: Programming = {}
  for(const key in src){
    p[map.indexOf(key)] = src[key];
  }
  return p;
}


const main = async () => {

  const coll = await getCollection();

  const cursor = coll.find({programming: {$ne: null as any}});

  const count = await cursor.count();

  console.log(`${count} stations`);

  let i = 0;
  let station;
  while(station = await cursor.next()){
    console.log(++i, "/", count, station.name);
    await coll.updateOne(
      {_id: station._id},
      {$set: {
        programming: formatProgramming(station.programming) as any
      }}
    )
  }

  console.log("Done!");

}

main();