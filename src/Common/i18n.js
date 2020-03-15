import format from "string-format";
import get from "get-value";
import { readable, writable } from "svelte/store";
import { stores as sapperStores } from "@sapper/app";

import { get as getStoreValue } from "svelte/store";

import langs from "/db/data/langs.json";

const notFoundKeys = new Set();

const formatter = locale => (key, params = {}) => {
  //console.log(locale.lang, key);
  const o = get(locale, key);
  
  if(typeof o !== "string"){
    if(!notFoundKeys.has()){
      notFoundKeys.add(key);
      console.log("[$trans] key not found:" + JSON.stringify(key));
    }
    return key;
  }

  return format(o, params);
}

// return always the same stores for the same session
// instead of creating new stores every time
const memo = new WeakMap();

export const stores = () => {
  const { page, session } = sapperStores();
  
  if(memo.has(session))
    return memo.get(session);
  
  const $session = getStoreValue(session);
  const $page = getStoreValue(page);
  
  const $lang = $session.lang;
  const $trans = formatter($session.locale);

  const $countryCode = $page.params.langCountry && $page.params.langCountry.split("-")[1];
  const countryCode = writable($countryCode);

  const $country = $session.country;

  const cache = {
    trans: {[$lang]: $trans},
    countries: $countryCode && $country ? {[$countryCode]: $country} : {},
  }

  const lang = writable($lang);

  const trans = readable($trans, set => {
    lang.subscribe(async $lang => {
      if(cache.trans.hasOwnProperty($lang))
        set(cache.trans[$lang]);
      else if(process.browser) {
        // never run in server
        console.log("loading locale ", $lang);
        const res = await fetch(`/i18n/locales/${$lang}.json`)
        const locale = await res.json();
        const $trans = formatter(locale);
        cache[$lang] = $trans;
        set($trans);
        console.log("setted $trans", $lang);
      }
    })
  })
  
  page.subscribe($page => {
    if($page.params.lang){
      if(langs.hasOwnProperty($page.params.lang)){
        lang.set($page.params.lang);
        countryCode.set(null);
      }
    } else if($page.params.langCountry) {
      const [$lang, $countryCode] = $page.params.langCountry.split("-");
      if(langs.hasOwnProperty($lang)){
        lang.set($lang);
      }
      countryCode.set($countryCode);
    }
  })


  const country = writable($country);
  countryCode.subscribe(async $countryCode => {
    if(!$countryCode){
      country.set(null);
    } else if(cache.countries.hasOwnProperty($countryCode)){
      country.set(cache.countries[$countryCode]);
    } else if(process.browser){
      // client side only
      const $country = await fetch(`/api/countries/${$countryCode}`).then(res => res.json());
      cache.countries[$countryCode] = $country;
      country.set($country);
    }
  })


  const helper = {lang, trans, countryCode, country};

  memo.set(session, helper);

  return helper;
}