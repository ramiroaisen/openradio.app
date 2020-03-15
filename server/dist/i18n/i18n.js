"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const accept_language_parser_1 = __importDefault(require("accept-language-parser"));
const i18n_iso_countries_1 = __importDefault(require("i18n-iso-countries"));
const locales = __importStar(require("./locales"));
const countryMap_1 = require("./data/countryMap");
const langs_json_1 = __importDefault(require("./data/langs.json"));
const deep_extend_1 = __importDefault(require("deep-extend"));
const i18n_week_days_1 = __importDefault(require("i18n-week-days"));
const utils_1 = require("../utils");
const Country_1 = require("../db/Country");
exports.defaultLang = "en";
exports.langCodes = i18n_iso_countries_1.default.langs().sort();
exports.isLangCode = (code) => {
    return exports.langCodes.includes(code);
};
const make = (def, ...args) => {
    return deep_extend_1.default({}, def, ...args);
};
exports.getRequestLang = (req) => {
    const langString = req.headers["accept-language"];
    if (langString == null) {
        return exports.defaultLang;
    }
    const langs = accept_language_parser_1.default.parse(langString);
    for (const lang of langs) {
        if (exports.isLangCode(lang.code)) {
            return lang.code;
        }
    }
    return exports.defaultLang;
};
var i18n;
(function (i18n) {
    i18n.makeLocale = (code) => {
        const locale = code === exports.defaultLang ?
            locales[exports.defaultLang] :
            make(locales[exports.defaultLang], locales[code]);
        return {
            ...locale,
            countries: countryMap_1.countryMap[code],
            week: i18n_week_days_1.default[code],
            lang: langs_json_1.default[code],
        };
    };
    const cache = new Map();
    for (const langCode of Object.keys(langs_json_1.default)) {
        cache.set(langCode, i18n.makeLocale(langCode));
    }
    i18n.attach = async (app) => {
        const countries = await Country_1.getCollection();
        const lang = (req, res, next) => {
            const { lang, countryCode } = req.params;
            if (!exports.isLangCode(lang))
                return res.status(404).send("404 Not Found");
            res.lang = lang + (countryCode ? `-${countryCode.toUpperCase()}` : "");
            res.locale = cache.get(lang);
            res.setHeader("Content-Language", res.lang);
            next();
        };
        const country = async (req, res, next) => {
            req.country = await countries.findOne({ code: req.params.countryCode });
            next();
        };
        app.use("/:lang([a-z]{2})", lang);
        app.use("/:lang([a-z]{2})-:countryCode([a-z]{2})", lang, country);
        app.get("/", (req, res) => {
            res.setHeader("Vary", "Accept-Language");
            const toURL = "/" + exports.getRequestLang(req);
            // redirect with push (nginx)
            utils_1.redirect(res, 302, toURL);
        });
        app.get("/i18n/locales/:code([a-z]{2}).json", (req, res) => {
            if (!exports.isLangCode(req.params.code)) {
                return res.status(404).send("404 Not Found");
            }
            return res.json(cache.get(req.params.code));
        });
    };
    i18n.sapperSession = (req, res) => {
        var _a;
        return {
            lang: (_a = res.lang) === null || _a === void 0 ? void 0 : _a.split("-")[0],
            locale: res.locale,
            //country: req.country && {...req.country, _id: req.country._id.toHexString()}
            country: req.country
        };
    };
})(i18n = exports.i18n || (exports.i18n = {}));
//# sourceMappingURL=i18n.js.map