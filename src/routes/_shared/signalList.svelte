<script context="module">
  export async function preload($page, $session){
    let url = `/api/signal/${$page.params.signalType}`;
    if($page.params.langCountry){
      const [_, $countryCode] = $page.params.langCountry.split("-");
      url += `?countryCode=${$countryCode}`;
    }

    const signals = await this.fetch(url).then(res => res.json());

    return {signals};
  }
</script>

<script>
  import Page from "/Components/Page.svelte";
  import UnderlineLink from "/Components/UnderlineLink.svelte";
  import LinkListBox from "/Components/LinkListBox.svelte";

  import {signalUrl} from "/Common/urls";

  import {stores} from "@sapper/app";
  const {page} = stores();

  import * as i18n from "/Common/i18n";
  const {trans, lang, countryCode} = i18n.stores();

  $: type = $page.params.signalType;

  $: title = $countryCode ? 
    $trans("signalList.country.title", {type, country: $trans(`countries.${$countryCode}`)}) :
    $trans("signalList.global.title", {type});

  export let signals;

  import {canonical, signalListUrl} from "/Common/urls";

  $: meta =  $countryCode ? {
    title: $trans("signalList.head.country.title", {type, country: $trans(`countries.${$countryCode}`)}),
    desc: $trans("signalList.head.country.desc", {type, country: $trans(`countries.${$countryCode}`)}),
    canonical: canonical(signalListUrl({lang: $lang, countryCode: $countryCode, type}))
  } : {
    title: $trans("signalList.head.global.title", {type}),
    desc: $trans("signalList.head.global.title", {type}),
    canonical: canonical(signalListUrl({lang: $lang, type}))
  };

</script>

<Page {meta}>
  <h1>{title}</h1>
  <LinkListBox>
    {#each signals.filter(f => f != null) as frec}
      <UnderlineLink 
        href={signalUrl({lang: $lang, countryCode: $countryCode, type, frec})}
        text={$trans("signal.link.text", {type, frec})}
      />
      <!--  desc={$trans("radioCount", {count})} -->
    {/each}
  </LinkListBox>
</Page>