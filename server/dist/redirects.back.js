"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const i18n_1 = require("./i18n/i18n");
const Country_1 = require("./db/Country");
const utils_1 = require("./utils");
exports.attach = async (app) => {
    const countries = await Country_1.getCollection();
    const countryCodes = (await countries.find({}).project({ _id: 0, code: 1 }).toArray()).map(c => c.code);
    const add = (from, to) => {
        app.get(from, async (req, res, next) => {
            if (i18n_1.isLangCode(req.params.countryCode) ||
                !countryCodes.includes(req.params.countryCode)) {
                return next();
            }
            const lang = i18n_1.getRequestLang(req);
            res.setHeader("Vary", "Accept-Language");
            return utils_1.redirect(res, 301, to(lang, req.params));
        });
    };
    app.get("/:countryCode([a-z]{2})/radio/:slug", async (req, res) => {
        const lang = i18n_1.getRequestLang(req);
        res.setHeader("Vary", "Accept-Language");
        utils_1.redirect(res, 301, `/${lang}-${req.params.countryCode}/radio/${req.params.slug}`);
    });
    add("/:countryCode([a-z]{2})", (lang, params) => `/${lang}-${params.countryCode}`);
    add("/:countryCode([a-z]{2})/search", (lang, params) => `${lang}-${params.countryCode}/search`);
    add("/:countryCode([a-z]{2})/radio-:signalType(am|fm)", (lang, params) => `/${lang}-${params.countryCode}/radio-${params.signalType}`);
    add("/:countryCode([a-z]{2})/radio-:signalType(am|fm)/:signalFrec([0-9]+|[0-9+].[0-9]+)", (lang, params) => `/${lang}-${params.countryCode}/radio-${params.signalType}/${params.signalFrec}`);
    // OLDER ONES
    app.get("/escuchar-:slug-en-vivo", (req, res) => {
        const lang = i18n_1.getRequestLang(req);
        utils_1.redirect(res, 301, `/${lang}-ar/radio/${req.params.slug}`);
    });
    app.get("/radios-de-:region", (req, res) => {
        utils_1.redirect(res, 301, "/");
    });
    app.get("/genero/:genre", (req, res) => {
        utils_1.redirect(res, 301, "/");
    });
    // static pages i18n
    const add2 = (from, map) => {
        app.get(from, (req, res, next) => {
            const lang = i18n_1.getRequestLang(req);
            res.setHeader("Vary", "Accept-Language");
            utils_1.redirect(res, 301, map ? map(lang, req.params) : `/${lang}${from}`);
        });
    };
    // "/" is already added;
    add2("/languages");
    add2("/recents");
    add2("/radio-am");
    add2("/radio-fm");
    add2("/radio-am/:signalFrec", (lang, params) => `/${lang}/radio-am/${params.signalFrec}`);
    add2("/radio-fm/:signalFrec", (lang, params) => `/${lang}/radio-fm/${params.signalFrec}`);
};
//# sourceMappingURL=redirects.back.js.map