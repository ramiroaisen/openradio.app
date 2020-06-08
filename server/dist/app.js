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
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const config = __importStar(require("./config"));
const express_1 = __importDefault(require("express"));
const serve_static_1 = __importDefault(require("serve-static"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const isbot_1 = __importDefault(require("isbot"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const request_ip_1 = require("request-ip");
const geoip_country_1 = require("./types/geoip-country");
const redirects = __importStar(require("./redirects"));
const api = __importStar(require("./api"));
const i18n_1 = require("./i18n/v2/i18n");
const proxy = __importStar(require("./proxy"));
const Country_1 = require("./db/Country");
exports.start = async (sapper) => {
    const { PORT, NODE_ENV } = process.env;
    const dev = NODE_ENV === 'development';
    const app = express_1.default();
    //if(!config.local){
    if (config.env === "prod") {
        app.use(morgan_1.default("dev"));
    }
    app.use(helmet_1.default());
    app.use((req, res, next) => {
        const ua = req.headers["user-agent"];
        if (typeof ua === "string") {
            if (!/node-fetch/.test(ua) && isbot_1.default(ua)) {
                console.log(`BOT: ${req.headers["user-agent"]}`);
                console.log(`BOT => ${req.url}`);
            }
        }
        next();
    });
    app.use(serve_static_1.default(path_1.default.resolve(__dirname, '../../static'), { etag: true, maxAge: 1000 * 60 * 60 * 24 * 365 }));
    console.log("Attaching redirects");
    await redirects.attach(app);
    console.log("Attaching /i18n");
    await i18n_1.i18n.attach(app);
    console.log("Attaching /proxy");
    proxy.attach(app);
    const countries = await Country_1.getCollection();
    app.use(async (req, res, next) => {
        const ip = request_ip_1.getClientIp(req);
        if (ip != null) {
            req.realIp = ip;
            const info = geoip_country_1.geoip.lookup(ip);
            if (info && info.country) {
                const code = info.country.toLowerCase();
                req.ipCountry = await countries.findOne({ code });
            }
        }
        next();
    });
    console.log("Attaching /api...");
    await api.attach(app);
    let link = ["/static/global.min.css", "/static/fonts/muli/muli.min.css"].map(css => `<${css}>;rel=preload;as=style`).join(",");
    //link += ",</static/fonts/muli/7Auwp_0qiz-afTLGLQ.woff2>;rel=preload;as=font";
    app.use((req, res, next) => {
        res.sapperLink = link;
        next();
    });
    app.use(cookie_parser_1.default());
    app.use((req, res, next) => {
        if ("openradio-adtest" in req.cookies) {
            res.locals.template_replace = {
                "openradio.adtest-attr": 'data-adtest="on"'
            };
        }
        else {
            res.locals.template_replace = {
                "openradio.adtest-attr": ""
            };
        }
        next();
    });
    app.use(sapper.middleware({
        session: (req, res) => {
            const { ipCountry } = req;
            return { ...i18n_1.i18n.sapperSession(req, res), ipCountry };
        }
    }));
    http_1.default.createServer({}, app).listen(config.port, () => {
        console.log(`> http server listening on port ${config.port}`);
    });
};
//# sourceMappingURL=app.js.map