"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const i18n_1 = require("./i18n/v2/i18n");
const Country_1 = require("./db/Country");
const utils_1 = require("./utils");
exports.attach = async (app) => {
    const countries = await Country_1.getCollection();
    const countryCodes = (await countries.find({}).project({ _id: 0, code: 1 }).toArray()).map(c => c.code);
    const param = (name, validator) => {
        app.param(name, (req, res, next, value) => {
            if (validator(value))
                next();
            else
                next("route");
        });
    };
    param("ll", ll => i18n_1.isLangCode(ll));
    param("cc", cc => countryCodes.includes(cc));
    param("tt", tt => tt === "am" || tt === "fm");
    param("f", f => /^([0-9]+|[0-9]+.[0-9]+)$/.test(f));
    const mkdest = (src) => {
        return (ll, params, qs) => {
            return src
                .replace(":ll", ll)
                .replace(":cc", params.cc)
                .replace(":tt", params.tt)
                .replace(":f", params.f)
                .replace(":s", params.s)
                + qs;
        };
    };
    const add = (url, dest, checkIfCCisLangCode = false) => {
        const to = mkdest(dest);
        app.get(url, (req, res, next) => {
            if (checkIfCCisLangCode && i18n_1.isLangCode(req.params.cc))
                return next();
            const i = req.url.indexOf("?");
            const qs = i == -1 ? "" : req.url.substring(i);
            const ll = i18n_1.getRequestLang(req);
            res.setHeader("Vary", "Accept-Language");
            utils_1.redirect(res, 301, to(ll, req.params, qs));
        });
    };
    // Index
    add("/", "/:ll");
    add("/xx", "/:ll");
    // Global
    add("/recents", "/:ll/recents");
    add("/languages", "/:ll/languages");
    add("/search", "/:ll/search");
    add("/radio-:tt", "/:ll/radio-:tt");
    add("/radio-:tt/:f", "/:ll/radio-:tt/:f");
    add("/xx/recents", "/:ll/recents");
    add("/xx/languages", "/:ll/languages");
    add("/xx/search", "/:ll/search");
    add("/xx/radio-:tt", "/:ll/radio-:tt");
    add("/xx/radio-:tt/:f", "/:ll/radio-:tt/:f");
    // Country
    add("/xx-:cc", "/:ll-:cc");
    add("/xx-:cc/search", "/:ll-:cc/search");
    add("/xx-:cc/radio/:s", "/:ll-:cc/radio/:s");
    add("/xx-:cc/radio-:tt", "/:ll-:cc/radio-:tt");
    add("/xx-:cc/radio-:tt/:f", "/:ll-:cc/radio-:tt/:f");
    add("/:cc", "/:ll-:cc", true);
    add("/:cc/search", "/:ll-:cc/search", true);
    add("/:cc/radio/:s", "/:ll-:cc/radio/:s", true);
    add("/:cc/radio-:tt", "/:ll-:cc/radio-:tt", true);
    add("/:cc/radio-:tt/:f", "/:ll-:cc/radio-:tt/:f", true);
    // Older Older
    add("/escuchar-:s-en-vivo", "/:ll-ar/radio/:s");
    add("/radios-de-:s", "/:ll");
    add("/genero/:s", "/:ll");
};
//# sourceMappingURL=redirects.js.map