import { Application, Response, Request, NextFunction } from "express";
import { isLangCode, getRequestLang } from "./i18n/v2/i18n";
import { LangCode } from "./i18n/v2/Locale";
import { getCollection } from "./db/Country";
import { redirect } from "./utils";

export const attach = async (app: Application) => {

  const countries = await getCollection();

  const countryCodes = (await countries.find({}).project({_id: 0, code: 1}).toArray()).map(c => c.code);

  const param = (name: string, validator: (value: string) => boolean) => {
    app.param(name, (req, res, next, value) => {
      if(validator(value))
        next();
      else
        next("route");
    })
  }

  param("ll", ll => isLangCode(ll));
  param("cc", cc => countryCodes.includes(cc));
  param("tt", tt => tt === "am" || tt === "fm");
  param("f", f => /^([0-9]+|[0-9]+.[0-9]+)$/.test(f));

  const mkdest = (src: string) => {
    return (ll: LangCode, params: Request["params"], qs: string) => {
      return src
        .replace(":ll", ll)
        .replace(":cc", params.cc)
        .replace(":tt", params.tt)
        .replace(":f", params.f)
        .replace(":s", params.s)
        + qs;
      }
  }

  const add = (url: string, dest: string, checkIfCCisLangCode = false) => {
    
    const to = mkdest(dest);
    
    app.get(url, (req: Request, res: Response, next: NextFunction) => {
      
      if(checkIfCCisLangCode && isLangCode(req.params.cc))
        return next();

      const i = req.url.indexOf("?");
      const qs = i == -1 ? "" : req.url.substring(i); 
      
      const ll = getRequestLang(req);
      
      res.setHeader("Vary", "Accept-Language");
      redirect(res, 301, to(ll, req.params, qs));
    });
  }

  // Index
  add("/",   "/:ll");
  add("/xx", "/:ll");

  // Global
  add("/recents",      "/:ll/recents")
  add("/languages",    "/:ll/languages")
  add("/search",       "/:ll/search")
  add("/radio-:tt",    "/:ll/radio-:tt")
  add("/radio-:tt/:f", "/:ll/radio-:tt/:f")

  add("/xx/recents",      "/:ll/recents")
  add("/xx/languages",    "/:ll/languages")
  add("/xx/search",       "/:ll/search")
  add("/xx/radio-:tt",    "/:ll/radio-:tt")
  add("/xx/radio-:tt/:f", "/:ll/radio-:tt/:f")

  // Country
  add("/xx-:cc",              "/:ll-:cc")
  add("/xx-:cc/search",       "/:ll-:cc/search")
  add("/xx-:cc/radio/:s",     "/:ll-:cc/radio/:s")
  add("/xx-:cc/radio-:tt",    "/:ll-:cc/radio-:tt")
  add("/xx-:cc/radio-:tt/:f", "/:ll-:cc/radio-:tt/:f")
  
  add("/:cc",              "/:ll-:cc", true)
  add("/:cc/search",       "/:ll-:cc/search", true)
  add("/:cc/radio/:s",     "/:ll-:cc/radio/:s", true)
  add("/:cc/radio-:tt",    "/:ll-:cc/radio-:tt", true)
  add("/:cc/radio-:tt/:f", "/:ll-:cc/radio-:tt/:f", true)


  // Older Older
  add("/escuchar-:s-en-vivo", "/:ll-ar/radio/:s")
  add("/radios-de-:s", "/:ll");
  add("/genero/:s", "/:ll")
}