"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const accept_language_parser_1 = __importDefault(require("accept-language-parser"));
const utils_1 = require("../../utils");
const Locale_1 = require("./Locale");
const Country_1 = require("../../db/Country");
const locales_json_1 = __importDefault(require("./locales.json"));
//const locales: Record<LangCode, Locale> = helper;
exports.isLangCode = (code) => {
    return Locale_1.langCodes.includes(code);
};
exports.getRequestLang = (req) => {
    const langString = req.headers["accept-language"];
    if (langString == null) {
        return Locale_1.defaultLang;
    }
    const langs = accept_language_parser_1.default.parse(langString);
    for (const lang of langs) {
        if (exports.isLangCode(lang.code)) {
            return lang.code;
        }
    }
    return Locale_1.defaultLang;
};
var i18n;
(function (i18n) {
    i18n.attach = async (app) => {
        const countries = await Country_1.getCollection();
        const lang = (req, res, next) => {
            const { lang, countryCode } = req.params;
            if (!exports.isLangCode(lang))
                return res.status(404).send("404 Not Found");
            res.lang = lang + (countryCode ? `-${countryCode.toUpperCase()}` : "");
            res.locale = locales_json_1.default[lang];
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
            return res.json(locales_json_1.default[req.params.code]);
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