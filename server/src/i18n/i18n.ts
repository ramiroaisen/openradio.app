import { Request, Response, Application, NextFunction } from "express";
import langParser from "accept-language-parser";
import iso from "i18n-iso-countries";
import { Locale, Module } from "./Locale";
import * as locales from "./locales";
import {countryMap} from "./data/countryMap";
import langs from "./data/langs.json";
import deepExtend from "deep-extend";
import weekDays from "i18n-week-days";
import { redirect } from "../utils";
import { Country, getCollection } from "../db/Country";

export type LangCode = keyof typeof langs;

export const defaultLang = "en";

export const langCodes = iso.langs().sort();

export const isLangCode = (code: string): code is LangCode => {
  return langCodes.includes(code);
}

const make = (def: Module, ...args: Partial<Module>[]): Module => {
  return deepExtend({}, def, ...args) as Module
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
  
  export const makeLocale = (code: LangCode): Locale => {    
    
    const locale = code === defaultLang ? 
      locales[defaultLang] : 
      make(locales[defaultLang], locales[code]);

    return {
      ...locale,
      countries: countryMap[code],
      week: weekDays[code],
      lang: langs[code],
      
    }
  }

  const cache = new Map<LangCode, Locale>();
  for(const langCode of Object.keys(langs)){
    cache.set(langCode as LangCode, makeLocale(langCode as LangCode));
  }

  export const attach = async (app: Application) => {

    const countries = await getCollection();

    const lang = (req: Request, res: Response, next: NextFunction) => {
      
      const {lang, countryCode} = req.params;

      if(!isLangCode(lang))
        return res.status(404).send("404 Not Found");

      res.lang = lang + (countryCode ? `-${countryCode.toUpperCase()}` : "");
      res.locale = cache.get(lang)!;

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

      return res.json(cache.get(req.params.code));
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