import {locale} from "./src/en";
import countries from "./data/countries/en.json";
import langs from "./data/langs.json";
import weekDays from "i18n-week-days";

export type Module = typeof locale;

export type Locale = typeof locale & {
  countries: typeof countries,
  week: typeof weekDays[keyof typeof weekDays],
  lang: typeof langs["en"]
};