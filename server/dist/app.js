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
//const polka = require("polka");
const express_1 = __importDefault(require("express"));
// TODO: Write definitions
//const sirv = require("sirv") as any;
const serve_static_1 = __importDefault(require("serve-static"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const request_ip_1 = require("request-ip");
const geoip_country_1 = require("./types/geoip-country");
const redirects = __importStar(require("./redirects"));
const api = __importStar(require("./api"));
//const i18n = require("./i18n/server");
const i18n_1 = require("./i18n/i18n");
const proxy = __importStar(require("./proxy"));
const Country_1 = require("./db/Country");
const isbot_1 = __importDefault(require("isbot"));
//const redirects = require("./redirects");
exports.start = async (sapper) => {
    const { PORT, NODE_ENV } = process.env;
    const dev = NODE_ENV === 'development';
    const app = express_1.default();
    //if(!config.local){
    if (config.env === "prod") {
        app.use(morgan_1.default("dev"));
    }
    app.use((req, res, next) => {
        const ua = req.headers["user-agent"];
        if (typeof ua === "string") {
            if (isbot_1.default(ua)) {
                console.log(`BOT: ${req.headers["user-agent"]}`);
            }
        }
        next();
    });
    app // You can also use Express
        .use(compression_1.default({ threshold: 0 }), helmet_1.default(), 
    //sirv('static/static/imm', { dev: false, maxAge: 31536000, immutable: true }),
    //sirv(path.resolve(__dirname, '../../static'), { dev: false, etag: true, maxAge: 1000 * 60 * 60 * 24 }),
    serve_static_1.default(path_1.default.resolve(__dirname, '../../static'), { etag: true, maxAge: 1000 * 60 * 60 * 24 * 365 }));
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
    app.use(sapper.middleware({
        //ignore: ["/api", "/i18n", "/proxy"],
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