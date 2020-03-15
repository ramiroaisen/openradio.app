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
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const config = __importStar(require("./config"));
const url_1 = require("url");
exports.attach = (app) => {
    app.use("/proxy", (req, res) => {
        //only proxy from own domains
        if (!config.local) {
            const reject = () => {
                res.writeHead(401);
                res.end("401 Error Unauthorized");
            };
            const refererString = req.get("referer");
            if (!refererString) {
                return reject();
            }
            else {
                try {
                    const referer = new url_1.URL(refererString);
                    if (!["openradio.app", "openradio.ar", "openradio.local"].includes(referer.hostname)) {
                        return reject();
                    }
                }
                catch (e) {
                    return reject();
                }
            }
        }
        // removes "/proxy/"
        const url = req.originalUrl.slice(7);
        console.log(`Proxing request to => ${url}`);
        const get = url.startsWith("https") ? https_1.default.get : http_1.default.get;
        try {
            get(url, backend => {
                res.writeHead(backend.statusCode, backend.headers);
                //res.pipe(backend);
                backend.pipe(res);
            }).on("error", () => {
                console.log(`proxy: ${url} net error`);
                res.end();
            });
        }
        catch (e) {
            res.end();
        }
    });
};
//# sourceMappingURL=proxy.js.map