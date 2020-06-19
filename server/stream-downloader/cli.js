"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import commander from "commander";
var mongodb_1 = require("mongodb");
var Station_1 = require("../src/db/Station");
var conn_1 = require("../src/db/conn");
var fs_1 = require("fs");
var path_1 = __importDefault(require("path"));
var node_fetch_1 = __importDefault(require("node-fetch"));
var Stream;
(function (Stream) {
    var State;
    (function (State) {
        State["Created"] = "created";
        State["Downloading"] = "downloading";
        State["Closed"] = "closed";
        State["Error"] = "error";
    })(State = Stream.State || (Stream.State = {}));
})(Stream = exports.Stream || (exports.Stream = {}));
var dir = "/run/media/ramiro/C4F2A987F2A97DF4/Ramiro/openradio/stream-downloads";
var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    var conn, coll, htmls, total, _i, htmls_1, doc;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, conn_1.getConnection()];
            case 1:
                conn = _a.sent();
                coll = conn.collection("stream-downloads");
                return [4 /*yield*/, coll.find({ headers: { $elemMatch: { key: "content-type", value: /text\/html/ } } }).toArray()];
            case 2:
                htmls = _a.sent();
                total = htmls.length;
                console.log("Clearing ", total, "files");
                _i = 0, htmls_1 = htmls;
                _a.label = 3;
            case 3:
                if (!(_i < htmls_1.length)) return [3 /*break*/, 7];
                doc = htmls_1[_i];
                return [4 /*yield*/, fs_1.promises.unlink(path_1.default.join(dir, doc.filename)).catch(function () { })];
            case 4:
                _a.sent();
                return [4 /*yield*/, fs_1.promises.unlink(path_1.default.join(dir, doc.filename) + ".json").catch(function () { })];
            case 5:
                _a.sent();
                _a.label = 6;
            case 6:
                _i++;
                return [3 /*break*/, 3];
            case 7:
                console.log("> Done!");
                return [2 /*return*/];
        }
    });
}); };
var main1 = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!true) return [3 /*break*/, 2];
                return [4 /*yield*/, new Promise(function (resolve) { return __awaiter(void 0, void 0, void 0, function () {
                        var countryCode, slug, streamIndex, conn, coll, station, _id, createdAt, createdAtMs, filename, stationStream, filepath, res, headers, stream, writeStream, interval;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    console.log("=".repeat(100));
                                    countryCode = "ar";
                                    slug = "metro";
                                    streamIndex = 0;
                                    return [4 /*yield*/, conn_1.getConnection()];
                                case 1:
                                    conn = _a.sent();
                                    coll = conn.collection("stream-downloads");
                                    return [4 /*yield*/, Station_1.getStation(countryCode, slug)];
                                case 2:
                                    station = (_a.sent());
                                    _id = new mongodb_1.ObjectId();
                                    createdAt = new Date();
                                    createdAtMs = +createdAt;
                                    filename = _id.toString() + ".mp4";
                                    stationStream = station.streams[streamIndex];
                                    filepath = path_1.default.join(dir, filename);
                                    console.log("> Downloading " + station.name);
                                    console.log("> Writing to " + filepath);
                                    return [4 /*yield*/, node_fetch_1.default(stationStream.url)];
                                case 3:
                                    res = _a.sent();
                                    headers = [];
                                    res.headers.forEach(function (value, key) {
                                        headers.push({ key: key, value: value });
                                    });
                                    if (!res.ok || !/audio|video/.test(res.headers.get("content-type") || "")) {
                                        console.log("> Request error");
                                        console.log(res.status, res.statusText);
                                        res.headers.forEach(function (value, key) {
                                            console.log(key + ": " + value);
                                        });
                                        return [2 /*return*/, setTimeout(resolve, 1000)];
                                    }
                                    stream = {
                                        _id: _id,
                                        filename: filename,
                                        stream: stationStream,
                                        createdAt: createdAt,
                                        createdAtMs: createdAtMs,
                                        updatedAt: createdAt,
                                        updatedAtMs: createdAtMs,
                                        state: Stream.State.Downloading,
                                        stationId: station._id,
                                        headers: headers
                                    };
                                    console.log("> Writing metadata");
                                    return [4 /*yield*/, fs_1.promises.writeFile(filepath + ".json", JSON.stringify(stream, null, 2))];
                                case 4:
                                    _a.sent();
                                    return [4 /*yield*/, coll.insertOne(stream)];
                                case 5:
                                    _a.sent();
                                    writeStream = fs_1.createWriteStream(filepath);
                                    res.body.pipe(writeStream);
                                    interval = setInterval(function () {
                                        var now = new Date();
                                        coll.updateOne({ _id: stream._id }, { $set: {
                                                updatedAt: now,
                                                updatedAtMs: +now
                                            } });
                                    }, 1000);
                                    res.body.on("end", function () { return __awaiter(void 0, void 0, void 0, function () {
                                        var now;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    clearInterval(interval);
                                                    now = new Date();
                                                    return [4 /*yield*/, coll.updateOne({ _id: stream._id }, { $set: {
                                                                state: Stream.State.Closed,
                                                                updatedAt: now,
                                                                updatedAtMs: +now
                                                            } })];
                                                case 1:
                                                    _a.sent();
                                                    console.log("> Request ended, reconnecting...");
                                                    resolve();
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); });
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            case 1:
                _a.sent();
                return [3 /*break*/, 0];
            case 2: return [2 /*return*/];
        }
    });
}); };
main1();
