import path from "path";
import langs from "../data/langs.json";
import fs from "fs";

const dest = path.resolve(__dirname, "../locales.ts");

const lines: string[] = [];
for(const lang of Object.values(langs)){
  const src = 
`import {Module} from "../Locale";

export const locale: Partial<Module> = {
};`;

  fs.writeFileSync(path.resolve(__dirname, "../src/", lang.code + ".ts"), src);

  lines.push(`export {locale as ${lang.code}} from "./src/${lang.code}";`);
}

fs.writeFileSync(dest, lines.join("\n"));