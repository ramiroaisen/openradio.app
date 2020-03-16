"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const child_process_1 = require("child_process");
const ws_1 = __importDefault(require("ws"));
exports.bin = `${config_1.basedir}/rs/target/release/openradio-search`;
let _uid = 0;
exports.uid = () => ++_uid;
exports.getSearcher = async () => {
    const child = child_process_1.spawn(exports.bin);
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
    const resolvers = new Map();
    // await for the first data (process ready)
    const start = Date.now();
    /*
    // One conn per search (fail)
    await new Promise<Ws>(resolve => child.stdout.once("data", async url => {
      console.log("[search] index created in ", Date.now() - start, "ms")
      resolve();
    }))
    
    const search = (query: Query) => new Promise<SearchResult>(async resolve => {
      const start = Date.now();
      const id = uid();
      const out: Out = { id, query };
      const client = new Ws("ws://127.0.0.1:3000");
      client.once("open", () => {
        client.once("message", (data) => {
          client.close();
          const result = JSON.parse(data.toString()).result;
          resolve(result)
          const ms = Date.now() - start;
          console.log(`[search]: ${JSON.stringify(query)}: ${result.paging.total} in ${ms}ms`);
        })
        client.send(JSON.stringify(out))
      })
    })*/
    const clientp = new Promise(resolve => child.stdout.once("data", async (url) => {
        console.log(`[search] index created in ${Date.now() - start}ms`);
        const client = new ws_1.default("ws://127.0.0.1:3000");
        await new Promise(resolve => client.on("open", resolve));
        client.on("message", (data) => {
            try {
                const msg = JSON.parse(data.toString());
                const resolver = resolvers.get(msg.replyTo);
                if (resolver == null) {
                    console.log("[search] call replyTo to empty awaiter", msg.replyTo);
                }
                else {
                    resolvers.delete(msg.replyTo);
                    resolver(msg.result);
                }
            }
            catch (e) {
                console.log("[search] could not read JSON result: ", e.message);
            }
        });
        setInterval(() => {
            client.ping();
        }, 5000);
        resolve(client);
    }));
    const search = async (query) => {
        const client = await clientp;
        return new Promise(resolve => {
            const start = Date.now();
            const id = exports.uid();
            const out = { id, query };
            resolvers.set(id, result => {
                const ms = Date.now() - start;
                console.log(`[search]: ${JSON.stringify(query)}: ${result.paging.total} in ${ms}ms`);
                resolve(result);
            });
            client.send(JSON.stringify(out));
        });
    };
    return { search };
};
//# sourceMappingURL=search.js.map