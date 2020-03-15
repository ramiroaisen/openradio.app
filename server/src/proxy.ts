import http from "http";
import https from "https";
import * as config from "./config";
import { Application } from "express";
import { URL } from "url";

export const attach = (app: Application) => {
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
        res.writeHead(backend.statusCode!, backend.headers);
        //res.pipe(backend);
        backend.pipe(res);
      }).on("error", () => {
        console.log(`proxy: ${url} net error`);
        res.end();
      })
    } catch(e){
      res.end();
    }
  })
}