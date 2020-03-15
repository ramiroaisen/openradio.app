"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const langs_json_1 = __importDefault(require("../data/langs.json"));
const fs_1 = __importDefault(require("fs"));
const dest = path_1.default.resolve(__dirname, "../locales.ts");
const lines = [];
for (const lang of Object.values(langs_json_1.default)) {
    const src = `import {Module} from "../Locale";

export const locale: Partial<Module> = {
};`;
    fs_1.default.writeFileSync(path_1.default.resolve(__dirname, "../src/", lang.code + ".ts"), src);
    lines.push(`export {locale as ${lang.code}} from "./src/${lang.code}";`);
}
fs_1.default.writeFileSync(dest, lines.join("\n"));
//# sourceMappingURL=localesModule.js.map