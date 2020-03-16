import { getCollection } from "../Station";

const main = async () => {
  const stations = await getCollection();
  
  console.time("Distinct");
  //const types = await stations.distinct("streams.type");
  
  const types = await stations.aggregate([
    {$match: {streams: {$not: {$size: 0}}}},
    {$unwind: "$streams"},
    {$group: {_id: "$streams.type", count: {$sum: 1}}},
    {$sort: {count: -1}}
  ]).toArray();

  console.timeEnd("Distinct");

  const hls = (await stations.aggregate([
    {$match: {streams: {$not: {$size: 0}}}},
    {$unwind: "$streams"},
    {$group: {_id: "$streams.url"}},
    {$match: {_id: /\.m3u/}}
  ]).toArray()).length;

  /*
  const res = await stations.updateMany(
    {"streams.url": /\.m3u/},
    {$set: {"streams.$.type": "hls"}}
  );
  */

  const res = await stations.updateMany(
    {"streams.mime": {$in: ["audio/hls", "audio/rtsp", "audio/rtmp"]}},
    {$set: {"streams.$.mime": null}}
  );

  const mimes = await stations.aggregate([
    {$unwind: "$streams"},
    {$group: {_id: "$streams.mime", count: {$sum: 1}}},
    {$sort: {count: -1}}
  ]).toArray();

  console.log(types);
  console.log(hls);
  console.log(mimes);
  console.log(res.modifiedCount);
}

main();