"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const i18n_iso_countries_1 = __importDefault(require("i18n-iso-countries"));
const iso_639_1_1 = __importDefault(require("iso-639-1"));
const fs_1 = __importDefault(require("fs"));
const dest = path_1.default.resolve(__dirname, "../data/langs.json");
const codes = i18n_iso_countries_1.default.langs().sort();
const langs = {};
for (const code of codes) {
    langs[code] = {
        code,
        native: iso_639_1_1.default.getNativeName(code),
        en: iso_639_1_1.default.getName(code)
    };
}
fs_1.default.writeFileSync(dest, JSON.stringify(langs, null, 2));
//# sourceMappingURL=langs.js.map