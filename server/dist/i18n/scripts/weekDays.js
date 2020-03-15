"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const langs_json_1 = __importDefault(require("../data/langs.json"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const dest = path_1.default.resolve(__dirname, "../data/weekDays.ts");
const lines = [];
const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
];
lines.push(`export const weekDays = {`);
for (const lang of Object.values(langs_json_1.default)) {
    lines.push(`// ${lang.code} => ${lang.en} => ${lang.native}`);
    lines.push(`${lang.code}: ${JSON.stringify(days)},`);
    lines.push("");
}
lines.push("};");
fs_1.default.writeFileSync(dest, lines.join("\n"));
//# sourceMappingURL=weekDays.js.map