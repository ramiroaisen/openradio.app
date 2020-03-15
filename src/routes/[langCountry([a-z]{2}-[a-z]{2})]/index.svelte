<script context="module">
  import { countryUrl } from "/Common/urls";

  export async function preload($page, $session) {
    const [lang, countryCode] = $page.params.langCountry.split("-")

    const url = countryUrl({lang, countryCode});
    const apiUrl = `/api/stations/${countryCode}`;

    const json = await this.fetch(
      apiUrl + "?page=" + ($page.query.page || 1)
    ).then(res => res.json());

    return { url, apiUrl, stations: json.items, paging: json.paging };
  }
</script>

<script>
  import { stores } from "@sapper/app";
  const { page } = stores();

  import * as i18n from "/Common/i18n";
  const { trans, lang, countryCode } = i18n.stores();

  import Page from "/Components/Page.svelte";
  import RadioList from "/Components/RadioList.svelte";

  export let url;
  export let apiUrl;
  export let stations;
  export let paging;

  import {canonical} from "/Common/urls";

  $: meta = {
    title: $trans("countryIndex.head.title", {country: $trans(`countries.${$countryCode}`)}),
    desc: $trans("countryIndex.head.desc", {country: $trans(`countries.${$countryCode}`)}),
    canonical: canonical(countryUrl({lang: $lang, countryCode: $countryCode}))
  };
</script>

<Page {meta}>
  <h1>
    {$trans('countryIndex.title', {
      country: $trans(`countries.${$countryCode}`)
    })}
  </h1>
  <RadioList {url} {apiUrl} {stations} {paging} />
</Page>
