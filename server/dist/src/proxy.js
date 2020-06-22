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
const net_1 = __importDefault(require("net"));
const parse_headers = require("parse-headers");
exports.attach = (app) => {
    const socketProxy = (req, res, urlstr) => {
        try {
            const url = new url_1.URL(urlstr);
            const accept = (req.headers.accept || "audio/*");
            const port = Number(url.port) || (url.protocol === "https:" ? 443 : 80);
            const socket = net_1.default.connect(port, url.hostname);
            socket.on("ready", () => {
                const HEAD = [
                    `GET ${url.pathname + url.search} HTTP/1.0`,
                    `host: ${url.hostname}`,
                    `accept: ${accept}`
                ].join("\r\n") + "\r\n\r\n";
                socket.write(HEAD);
                let head_received = false;
                let head = "";
                socket.on("data", (chunk) => {
                    if (!head_received) {
                        const str = chunk.toString("utf8");
                        let parts = str.split("\r\n\r\n", 2);
                        head += parts[0];
                        if (parts.length !== 1) {
                            head_received = true;
                            const contentType = parse_headers(head)["content-type"];
                            const headers = contentType ? { "content-type": contentType } : {};
                            res.writeHead(200, headers);
                            socket.pipe(res);
                        }
                    }
                }).on("error", error => {
                    res.end();
                });
            });
        }
        catch (e) {
            res.end();
        }
    };
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
            }).on("error", error => {
                // ICY url
                // @ts-ignore
                if (error.code === "HPE_INVALID_CONSTANT") {
                    if (url.startsWith("https")) {
                        res.header("x-openradio-proxy-fail", "unimplemented icy-https proxy request");
                        res.end();
                        console.log(`proxy: ${url} error, unimplemented icy-https proxy request`);
                    }
                    else {
                        console.log(`proxy: ${url}, entering raw proxy mode (probably ICY server)`);
                        socketProxy(req, res, url);
                    }
                    return;
                }
                res.header("x-openradio-proxy-fail", "unknown");
                res.end();
                console.log(`proxy: ${url} error, unknown: ` + error.message);
            });
        }
        catch (e) {
            res.header("x-openradio-proxy-fail", "cannot connect to host");
            res.end();
            console.log(`proxy: ${url} error in connection: ` + e.message);
        }
    });
};
//# sourceMappingURL=proxy.js.map