import { basedir } from "./config";
//import { spawn } from "child_process";
//import Ws from "ws";

//export const bin = `${basedir}/rs/target/release/openradio-search`;

const {search, start} = require("../../neon-search/lib") as any;

export type Query = {
  q: string
  countryCode?: string | null
  ipCountry?: string | null
  page: number
  pageSize: number
}

export type Out = {
  id: number
  query: Query
}

export type In = {
  replyTo: number
  result: SearchResult
}

export type Paging = {
  page: number
  pageSize: number
  pages: number
  total: number
  next?: number | null
}

export type SearchItem = {
  _id: string
  name: string
  slug: string
  countryCode: string
  score: number
}

export type SearchResult = {
  paging: Paging
  items: SearchItem[]
}

export type Awaiter = (result: SearchResult) => void;

export const getSearcher = async () => {
  start();
  return {search};
}

/*
let _uid = 0;
export const uid = () => ++_uid;

export const getSearcher = async () => {

  const child = spawn(bin);

  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);

  const resolvers = new Map<number, Awaiter>();

  // await for the first data (process ready)
  const start = Date.now();
  const clientp = new Promise<Ws>(resolve => child.stdout.once("data", async url => {

    console.log(`[search] index created in ${Date.now() - start}ms`);

    const client = new Ws("ws://127.0.0.1:3000");

    await new Promise(resolve => client.on("open", resolve));

    client.on("message", (data) => {
      try {
        const msg: In = JSON.parse(data.toString());
        const resolver = resolvers.get(msg.replyTo);
        if (resolver == null) {
          console.log("[search] call replyTo to empty awaiter", msg.replyTo)
        } else {
          resolvers.delete(msg.replyTo);
          resolver(msg.result);
        }
      } catch (e) {
        console.log("[search] could not read JSON result: ", e.message)
      }
    })

    setInterval(() => {
      client.ping();
    }, 5000)


    resolve(client);
  }));

  const search = async (query: Query) => {
    const client = await clientp; 
    return new Promise(resolve => {
      const start = Date.now();
      const id = uid();
      const out: Out = { id, query };
      resolvers.set(id, result => {
        const ms = Date.now() - start;
        console.log(`[search]: ${JSON.stringify(query)}: ${result.paging.total} in ${ms}ms`);
        resolve(result);
      });
      client.send(JSON.stringify(out));
    })
  }

  return { search };
}
*/