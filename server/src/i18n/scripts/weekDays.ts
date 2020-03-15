import langs from "../data/langs.json";
import path from "path";
import fs from "fs";

const dest = path.resolve(__dirname, "../data/weekDays.ts");

const lines: string[] = [];

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
]

lines.push(`export const weekDays = {`)

for(const lang of Object.values(langs)){
  lines.push(`// ${lang.code} => ${lang.en} => ${lang.native}`)
  lines.push(`${lang.code}: ${JSON.stringify(days)},`);
  lines.push("");
}

lines.push("};")

fs.writeFileSync(dest, lines.join("\n"));

