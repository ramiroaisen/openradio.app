<script>
  import {stores} from "@sapper/app";
  const {page} = stores(); 

  import * as i18n from "/Common/i18n";
  const {countryCode} = i18n.stores();
  
  import {canonical} from "/Common/urls";

  import map from "/db/data/langs.json";
  $: langs = Object.values(map).map(lang => {
    return {
      url: canonical("/" + lang.code + $page.path.slice(3)),
      lang: lang.code + ($countryCode ? ("-" + $countryCode.toUpperCase()) : "") 
    }
  });
</script>

<svelte:head>
  {#each langs as lang}
    <link rel="alternate" hreflang={lang.lang} href={lang.url}>
  {/each}
</svelte:head>