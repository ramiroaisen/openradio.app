import {locale} from "./src/en";
import {countryNames, langs, weekDays} from "./data";

export type Module = typeof locale;

export type Locale = typeof locale & {
  countries: typeof countryNames["en"],
  week: typeof weekDays["en"],
  lang: typeof langs["en"]
};

export type LangCode = keyof typeof langs;
export const defaultLang = "en";
export const langCodes = Object.keys(langs).sort();
