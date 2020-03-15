import fs from "fs";
import path from "path";

import http from "http";

import * as config from "./config";

//const polka = require("polka");
import express, { Request, Response } from "express";

// TODO: Write definitions
//const sirv = require("sirv") as any;
import serve from "serve-static";

import compression from "compression";
import morgan from "morgan";
import helmet from "helmet";

import {getClientIp} from "request-ip";
import geoip from "geoip-lite";

import * as redirects from "./redirects";
import * as api from "./api";

//const i18n = require("./i18n/server");
import {i18n} from "./i18n/i18n";

import * as proxy from "./proxy";
import { getCollection } from "./db/Country";

//const redirects = require("./redirects");

export const start = async (sapper: any) => {
  const { PORT, NODE_ENV } = process.env;
  const dev = NODE_ENV === 'development';

  const app = express();

  //if(!config.local){
  if(config.env === "prod"){
    app.use(morgan("dev"));
  }

  app // You can also use Express
    .use(
      compression({ threshold: 0 }),
      helmet(),
      //sirv('static/static/imm', { dev: false, maxAge: 31536000, immutable: true }),
      //sirv(path.resolve(__dirname, '../../static'), { dev: false, etag: true, maxAge: 1000 * 60 * 60 * 24 }),
      serve(path.resolve(__dirname, '../../static'), { etag: true, maxAge: 1000 * 60 * 60 * 24 * 365 })
    );
  
  console.log("Attaching redirects");
  await redirects.attach(app);

  console.log("Attaching /i18n");
  await i18n.attach(app);
  
  console.log("Attaching /proxy");
  proxy.attach(app);
  
  const countries = await getCollection();
  app.use(async (req, res, next) => {
    const ip = getClientIp(req);
    if(ip != null){
      req.realIp = ip;
      const info = geoip.lookup(ip);
      if(info && info.country){
        const code = info.country.toLowerCase();
        req.ipCountry = await countries.findOne({code});
      }
    }
    next();
  })

  
  console.log("Attaching /api...");
  await api.attach(app);
  
  let link = ["/static/global.min.css", "/static/fonts/muli/muli.min.css"].map(css => `<${css}>;rel=preload;as=style`).join(",");
  //link += ",</static/fonts/muli/7Auwp_0qiz-afTLGLQ.woff2>;rel=preload;as=font";

  app.use((req, res, next) => {
    res.sapperLink = link;
    next();
  })

  app.use(
    sapper.middleware({
      //ignore: ["/api", "/i18n", "/proxy"],
      session: (req: Request, res: Response) => {
        const {ipCountry} = req;
        return {...i18n.sapperSession(req, res), ipCountry}
      }
    })
  );

  http.createServer({}, app).listen(config.port, () => {
    console.log(`> http server listening on port ${config.port}`);
  });
}