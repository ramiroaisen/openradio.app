import { Request, Response, Application, NextFunction } from "express";
import langParser from "accept-language-parser";
import { redirect } from "../../utils";
import {Locale, LangCode, defaultLang, langCodes} from "./Locale";

import { Country, getCollection } from "../../db/Country";

import locales from "./locales.json";
//const locales: Record<LangCode, Locale> = helper;

export const isLangCode = (code: string): code is LangCode => {
  return langCodes.includes(code);
}

export const getRequestLang = (req: Request): LangCode => {
  const langString = req.headers["accept-language"];
  if(langString == null){
    return defaultLang;
  }
  
  const langs = langParser.parse(langString);
  for(const lang of langs){
    if(isLangCode(lang.code)){
      return lang.code;
    }
  }
  
  return defaultLang;
}

export namespace i18n {

  export const attach = async (app: Application) => {

    const countries = await getCollection();

    const lang = (req: Request, res: Response, next: NextFunction) => {
      
      const {lang, countryCode} = req.params;

      if(!isLangCode(lang))
        return res.status(404).send("404 Not Found");

      res.lang = lang + (countryCode ? `-${countryCode.toUpperCase()}` : "");
      res.locale = locales[lang] as unknown as Locale;

      res.setHeader("Content-Language", res.lang);

      next();
    }

    const country = async (req: Request, res: Response, next: NextFunction) => {
      req.country = await countries.findOne({code: req.params.countryCode});
      next();
    }

    app.use("/:lang([a-z]{2})", lang)
    app.use("/:lang([a-z]{2})-:countryCode([a-z]{2})", lang, country)

    app.get("/", (req, res) => {
      res.setHeader("Vary", "Accept-Language");
      const toURL = "/" + getRequestLang(req);
      // redirect with push (nginx)
      redirect(res, 302, toURL);
    })

    app.get("/i18n/locales/:code([a-z]{2}).json", (req, res) => {
      if(!isLangCode(req.params.code)){
        return res.status(404).send("404 Not Found");
      }

      return res.json(locales[req.params.code]);
    })
  }

  export const sapperSession = (req: Express.Request, res: Express.Response) => {
    return {
      lang: res.lang?.split("-")[0],
      locale: res.locale,
      //country: req.country && {...req.country, _id: req.country._id.toHexString()}
      country: req.country
    }
  }
}