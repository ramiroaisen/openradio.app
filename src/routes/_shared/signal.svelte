<script context="module">
  export async function preload($page, $session){
    let apiUrl = `/api/signal/${$page.params.signalType}/${$page.params.signalFrec}`;
    if($page.params.langCountry){
      const [$lang, $countryCode] = $page.params.langCountry.split("-");
      apiUrl += `?countryCode=${$countryCode}`;
    }

    const {items: stations, paging} = await this.fetch(apiUrl).then(res => res.json());

    return {stations, paging, apiUrl};
  }
</script>

<script>
  import Page from "/Components/Page.svelte";
  import RadioList from "/Components/RadioList.svelte";

  import {stores} from "@sapper/app";
  const {page} = stores();

  import * as i18n from "/Common/i18n";
  const {lang, trans, countryCode} = i18n.stores();
  
  import {canonical, signalUrl} from "/Common/urls";

  export let stations;
  export let apiUrl;
  export let paging;

  $: type = $page.params.signalType;
  $: frec = $page.params.signalFrec;

  $: url = signalUrl({lang: $lang, type, frec, countryCode: $countryCode});

  $: title = $countryCode ? 
    $trans("signal.country.title", {type, frec, country: $trans(`countries.${$countryCode}`)}) : 
    $trans("signal.global.title", {type, frec});

  $: meta = $countryCode ? {
    title: $trans("signal.head.country.title", {type, frec, country: $trans(`countries.${$countryCode}`)}),
    desc: $trans("signal.head.country.desc", {type, frec, country: $trans(`countries.${$countryCode}`)}),
    canonical: canonical(url)
  } : {
    title: $trans("signal.head.global.title", {type, frec}),
    desc: $trans("signal.head.global.title", {type, frec}),
    canonical: canonical(url)
  };
</script>

<Page {meta}>
  <h1>{title}</h1>
  <RadioList {stations} {paging} {apiUrl} {url} />
</Page>