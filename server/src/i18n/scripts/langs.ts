import path from "path";
import iso from "i18n-iso-countries";
import langInfo from "iso-639-1";
import fs from "fs";

export type Lang = {
  code: string
  native: string
  en: string
}

export type LangMap = {[code: string]: Lang}

const dest = path.resolve(__dirname, "../data/langs.json");

const codes = iso.langs().sort();

const langs: LangMap = {};

for(const code of codes){
  langs[code] = {
    code,
    native: langInfo.getNativeName(code),
    en: langInfo.getName(code)
  }
}

fs.writeFileSync(dest, JSON.stringify(langs, null, 2));



