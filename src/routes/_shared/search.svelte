<style>
  h1{
    margin-bottom: 0 !important;
  }

  .timing{
    font-size: 1em;
    font-weight: 400;
    margin-top: 0.5em;
    margin-bottom: 2em;
    text-align: center;
  }
</style>

<script context="module">
  export async function preload($page, $session){
    const page = ($page.query.page | 0) || 1;
    let apiUrl = `/api/search?q=${encodeURIComponent($page.query.q || "")}`;
    // is country-wise
    if($page.params.langCountry){
      const [$lang, $countryCode] = $page.params.langCountry.split("-");
      apiUrl += `&countryCode=${$countryCode}`;
    }

    const {items: stations, paging, time} = await this.fetch(`${apiUrl}&page=${page}`).then(res => res.json());
    return {stations, paging, apiUrl, time};
  }
</script>

<script>
  import Page from "/Components/Page.svelte";
  import RadioList from "/Components/RadioList.svelte";

  import {canonical, searchUrl} from "/Common/urls";

  import {stores} from "@sapper/app";
  const {page} = stores();

  import * as i18n from "/Common/i18n";
  const {trans, lang, countryCode} = i18n.stores();

  export let stations;
  export let paging;
  export let time;
  export let apiUrl;

  $: q = $page.query.q || "";

  $: url = searchUrl({lang: $lang, countryCode: $countryCode, q});

  //$: subtitleKey = $countryCode ? "search.country.subtitle" : "search.global.subtitle";
  $: countryName = $countryCode && $trans(`countries.${$countryCode}`);

  $: meta = $countryCode ? {
    title: $trans("search.head.country.title", {q, country: $trans(`countries.${$countryCode}`)}),
    desc: $trans("search.head.country.desc", {q, country: $trans(`countries.${$countryCode}`)}),
    canonical: canonical(url)
  } : {
    title: $trans("signal.head.global.title", {q}),
    desc: $trans("signal.head.global.title", {q}),
    canonical: canonical(url)
  };
</script>

<Page {meta}>
  <h1>{q}</h1>
  <div class="timing">{$trans("search.timing", {total: paging.total, s: (time/1000).toFixed(2)})}</div>
  <RadioList {stations} {paging} {url} {apiUrl} />
</Page>

