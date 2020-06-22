import http from "http";
import https from "https";
import * as config from "./config";
import { Application, Request, Response } from "express";
import { URL } from "url";
import net from "net";
const parse_headers = require("parse-headers");

export const attach = (app: Application) => {

  const socketProxy = (req: Request, res: Response, urlstr: string) => {
    try {
      const url = new URL(urlstr);
      const accept = (req.headers.accept || "audio/*");
      const port = Number(url.port) || (url.protocol === "https:" ? 443 : 80);
      const socket = net.connect(port, url.hostname);
      socket.on("ready", () => {
        const HEAD = [
          `GET ${url.pathname + url.search} HTTP/1.0`,
          `host: ${url.hostname}`,
          `accept: ${accept}`
        ].join("\r\n") + "\r\n\r\n";
        socket.write(HEAD);
        let head_received = false;
        let head = "";
        socket.on("data", (chunk) => {
          if(!head_received) {
            const str = chunk.toString("utf8");
            let parts = str.split("\r\n\r\n", 2);
            head += parts[0];
            if (parts.length !== 1) {
              head_received = true;
              const contentType = parse_headers(head)["content-type"];
              const headers = contentType ? {"content-type": contentType} : {};
              res.writeHead(200, headers);
              socket.pipe(res);
            }
          }
        }).on("error", error => {
          res.end();
        })
      })
    } catch(e) {
      res.end();
    }
  }

  app.use("/proxy", (req, res) => {
    //only proxy from own domains
    if(!config.local){
      
      const reject = () => {
        res.writeHead(401);
        res.end("401 Error Unauthorized")
      }

      const refererString = req.get("referer");
      if(!refererString){
        return reject();
      
      } else {

        try{
          const referer = new URL(refererString);
          if(!["openradio.app", "openradio.ar", "openradio.local"].includes(referer.hostname)){
            return reject();
          } 
        
        } catch(e){
          return reject();
          
        }
      }
    }
    
    // removes "/proxy/"
    const url = req.originalUrl.slice(7);
    
    console.log(`Proxing request to => ${url}`);
    
    const get = url.startsWith("https") ? https.get : http.get;
    
    try{
      get(url, backend => {
        console.log("getted", backend);
        res.writeHead(backend.statusCode!, backend.headers);
        //res.pipe(backend);
        backend.pipe(res);
      }).on("error", error => {

        // ICY url
        // @ts-ignore
        if(error.code === "HPE_INVALID_CONSTANT") {
          if(url.startsWith("https")) {
            res.header("x-openradio-proxy-fail", "unimplemented icy-https proxy request");
            res.end();
            console.log(`proxy: ${url} error, unimplemented icy-https proxy request`);
          } else {
            console.log(`proxy: ${url}, entering raw proxy mode (probably ICY server)`);
            socketProxy(req, res, url);
          }
          return;
        }

        res.header("x-openradio-proxy-fail", "unknown");
        res.end();
        console.log(`proxy: ${url} error, unknown: ` + error.message);
      })
    } catch(e){
      res.header("x-openradio-proxy-fail", "cannot connect to host");
      res.end();
      console.log(`proxy: ${url} error in connection: ` + e.message);
    }
  })
}