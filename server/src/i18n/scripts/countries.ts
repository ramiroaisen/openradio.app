import iso from "i18n-iso-countries";
import { getCollection } from "../../db/Country";
import path from "path";
import fs from "fs";

export type LocaleMap = {
  [key: string]: CountryLocale
}

export type CountryLocale = {
  [key: string]: string
}

const dest =  path.resolve(__dirname, "../data/countries");

const main = async () => {
  const countries = await getCollection().then(coll => coll.find({}).sort({countryCode: 1}).toArray());
  console.log(countries.length, "countries");

  const langCodes = iso.langs().sort();

  const map: LocaleMap = {};

  for(const code of langCodes){
    const locale: CountryLocale  = {}
    for(const country of countries){
      locale[country.code] = iso.getName(country.code.toUpperCase(), code).replace(/\,.+/, "").replace(/\(.+\)/, "").trim();
    }
    map[code] = locale;
  }

  const lines: string[] = [];
  for(const [code, locale] of Object.entries(map)){
    fs.writeFileSync(dest + "/" + code + ".json", JSON.stringify(locale, null, 2));
    console.log(`${code} => ${dest}/${code}.json`);
    
    lines.push(`import ${code} from "./countries/${code}.json";`);
  }

  lines.push("");
  lines.push(`export const countryMap = {${Array.from(Object.keys(map)).join(", ")}};`);

  fs.writeFileSync(path.resolve(__dirname, "../data/countries.ts"), lines.join("\n"));
}

main();