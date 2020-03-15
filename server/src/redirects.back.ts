import { Application, Response, Request } from "express";
import { isLangCode, getRequestLang, LangCode } from "./i18n/i18n";
import { getCollection } from "./db/Country";
import { redirect } from "./utils";

export const attach = async (app: Application) => {

  const countries = await getCollection();

  const countryCodes = (await countries.find({}).project({_id: 0, code: 1}).toArray()).map(c => c.code);

  const add = (from: string, to: (lang: LangCode, params: Request["params"]) => string) => {
    app.get(from, async (req, res, next) => {
      if (
        isLangCode(req.params.countryCode) || 
        !countryCodes.includes(req.params.countryCode)
        ) {
          return next();
      }

      const lang = getRequestLang(req);
      res.setHeader("Vary", "Accept-Language");
      return redirect(res, 301, to(lang, req.params));
    });
  }

  app.get("/:countryCode([a-z]{2})/radio/:slug", async (req, res) => {
    const lang = getRequestLang(req);
    res.setHeader("Vary", "Accept-Language");
    redirect(res, 301, `/${lang}-${req.params.countryCode}/radio/${req.params.slug}`);
  })

  add("/:countryCode([a-z]{2})",
    (lang, params) => `/${lang}-${params.countryCode}`);

  add("/:countryCode([a-z]{2})/search",
    (lang, params) => `${lang}-${params.countryCode}/search`);

  add("/:countryCode([a-z]{2})/radio-:signalType(am|fm)",
    (lang, params) => `/${lang}-${params.countryCode}/radio-${params.signalType}`)

  add("/:countryCode([a-z]{2})/radio-:signalType(am|fm)/:signalFrec([0-9]+|[0-9+].[0-9]+)",
    (lang, params) => `/${lang}-${params.countryCode}/radio-${params.signalType}/${params.signalFrec}`)

  // OLDER ONES
  app.get("/escuchar-:slug-en-vivo", (req, res) => {  
    const lang = getRequestLang(req);
    redirect(res, 301, `/${lang}-ar/radio/${req.params.slug}`);
  })

  app.get("/radios-de-:region", (req, res) => {
    redirect(res, 301, "/");
  })

  app.get("/genero/:genre", (req, res) => {
    redirect(res, 301, "/");
  })


  // static pages i18n
  const add2 = (from: string, map?: (lang: string, params: Request["params"]) => string) => {
    app.get(from, (req, res, next) => {
      const lang = getRequestLang(req);
      res.setHeader("Vary", "Accept-Language");
      redirect(res, 301, map ? map(lang, req.params) : `/${lang}${from}`);
    })
  }

  // "/" is already added;
  add2("/languages");
  add2("/recents");
  add2("/radio-am")
  add2("/radio-fm")
  add2("/radio-am/:signalFrec", (lang, params) => `/${lang}/radio-am/${params.signalFrec}`)
  add2("/radio-fm/:signalFrec", (lang, params) => `/${lang}/radio-fm/${params.signalFrec}`)
}