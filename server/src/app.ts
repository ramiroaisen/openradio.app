import fs from "fs";
import path from "path";

import http from "http";

import * as config from "./config";

import express, { Request, Response } from "express";

import serve from "serve-static";

import morgan from "morgan";
import helmet from "helmet";
import isBot from "isbot";
import cookies from "cookie-parser";

import {getClientIp} from "request-ip";
import {geoip} from "./types/geoip-country";

import * as redirects from "./redirects";
import * as api from "./api";

import {i18n} from "./i18n/v2/i18n";

import * as proxy from "./proxy";
import { getCollection } from "./db/Country";

export const start = async (sapper: any) => {
  const { PORT, NODE_ENV } = process.env;
  const dev = NODE_ENV === 'development';

  const app = express();

  //if(!config.local){
  if(config.env === "prod"){
    app.use(morgan("dev"));
  }

  app.use(helmet());

  app.use((req, res, next) => {
    const ua = req.headers["user-agent"];
    if(typeof ua === "string"){
      if(!/node-fetch/.test(ua) && isBot(ua)){
        console.log(`BOT: ${req.headers["user-agent"]}`)
        console.log(`BOT => ${req.url}`)
      }
    }
    next();
  })

  app.use(serve(path.resolve(__dirname, '../../static'), { etag: true, maxAge: 1000 * 60 * 60 * 24 * 365 }));

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

  app.use(cookies());
  app.use((req, res, next) => {
    if("openradio-adtest" in req.cookies) {
      res.locals.template_replace = {
        "openradio.adtest-attr": 'data-adtest="on"'
      }
    } else {
      res.locals.template_replace = {
        "openradio.adtest-attr": ""
      };
    }

    next();
  })

  app.use(
    sapper.middleware({
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