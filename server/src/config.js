"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var commander_1 = __importDefault(require("commander"));
var process_1 = __importDefault(require("process"));
var os_1 = __importDefault(require("os"));
var path_1 = __importDefault(require("path"));
commander_1.default
    .version('2.0.0', '-v, --version')
    .option('-l --local []', 'Run as local')
    .option('-e --env [env]', 'enviroment: dev, prod, or test', /^(dev|prod|test)$/)
    .option('-p --port []', 'Port number')
    .option('--http []', 'run in http mode')
    .parse(process_1.default.argv);
exports.http = !!commander_1.default.http;
exports.local = (function () {
    if (commander_1.default.local == null) {
        return os_1.default.hostname() === "fedora";
    }
    else if (["0", "false"].indexOf(commander_1.default.local) !== -1) {
        return false;
    }
    else {
        return true;
    }
})();
//const env = cmd.env || (isLocal ? 'dev' : 'prod');
exports.env = commander_1.default.env != null ? commander_1.default.env : exports.local ? "dev" : "prod";
var _port = commander_1.default.port | 0;
if (!_port) {
    switch (exports.env) {
        case 'dev':
            _port = 7700;
            break;
        case 'test':
            _port = 7701;
            break;
        case 'prod':
            _port = 7702;
            break;
    }
}
exports.port = _port;
process_1.default.env.PORT = String(exports.port);
process_1.default.env.NODE_ENV = (exports.env === "dev" ? "development" : "production"); // "test" is production too
exports.basedir = path_1.default.resolve(__dirname, "../..");
/*
if(env === "dev"){
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}
*/ 
