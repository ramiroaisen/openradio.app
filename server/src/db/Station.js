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
Object.defineProperty(exports, "__esModule", { value: true });
var conn_1 = require("./conn");
exports.getCollection = conn_1.collectionGetter("stations");
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var coll;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, exports.getCollection()];
            case 1:
                coll = _a.sent();
                coll.createIndex({ countryCode: 1, slug: 1 });
                coll.createIndex({ order: 1 });
                coll.createIndex({ countryCode: 1 });
                //coll.createIndex({stateId: 1})
                //coll.createIndex({cityId: 1})
                //coll.createIndex({genresIds: 1})
                //coll.createIndex({"signals.type": 1, "signals.frecuency": 1});
                coll.createIndex({ "signal.type": 1 });
                coll.createIndex({ "signal.frec": 1 });
                coll.createIndex({ "signal.type": 1, "signal.frec": 1 });
                coll.createIndex({ "signalCache.am": 1 });
                coll.createIndex({ "signalCache.fm": 1 });
                coll.createIndex({ origin: 1 });
                return [2 /*return*/];
        }
    });
}); })();
exports.stationListProject = {
    _id: 1,
    name: 1,
    slug: 1,
    countryCode: 1,
    origin: 1,
    "mt.img": 1
};
exports.stationProject = {
    _id: 1,
    name: 1,
    slug: 1,
    //img: 1,
    countryCode: 1,
    //regionId: 1,
    //cityId: 1,
    desc: 1,
    web: 1,
    tel: 1,
    facebook: 1,
    twitter: 1,
    twitch: 1,
    discord: 1,
    instagram: 1,
    youtube: 1,
    whatsApp: 1,
    address: 1,
    slogan: 1,
    //genresIds: 1,
    streams: 1,
    //signals: 1,
    signal: 1,
    votes: 1,
    programming: 1,
    order: 1,
    origin: 1,
    mt: 1
};
exports.signal = function (type, frec, countryCode) { return __awaiter(void 0, void 0, void 0, function () {
    var coll, filter;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, exports.getCollection()];
            case 1:
                coll = _b.sent();
                filter = (_a = {}, _a["signalCache." + type] = frec, _a);
                if (countryCode != null)
                    filter.countryCode = countryCode;
                return [2 /*return*/, coll.find(filter).project(exports.stationListProject)];
        }
    });
}); };
exports.signalList = function (type, countryCode) { return __awaiter(void 0, void 0, void 0, function () {
    var coll, filter, list;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, exports.getCollection()];
            case 1:
                coll = _a.sent();
                filter = countryCode ? { countryCode: countryCode } : {};
                return [4 /*yield*/, coll.distinct("signalCache." + type, filter)];
            case 2:
                list = _a.sent();
                list.sort(function (a, b) { return a - b; });
                return [2 /*return*/, list];
        }
    });
}); };
exports.countryIndex = function (countryCode) { return __awaiter(void 0, void 0, void 0, function () {
    var coll;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, exports.getCollection()];
            case 1:
                coll = _a.sent();
                return [2 /*return*/, coll.find({ countryCode: countryCode }).project(exports.stationListProject)];
        }
    });
}); };
exports.getStation = function (countryCode, slug) { return __awaiter(void 0, void 0, void 0, function () {
    var coll, cursor;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, exports.getCollection()];
            case 1:
                coll = _a.sent();
                cursor = coll.find({ countryCode: countryCode, slug: slug }).project(exports.stationProject).limit(1);
                return [4 /*yield*/, cursor.next()];
            case 2: return [2 /*return*/, _a.sent()];
        }
    });
}); };
