<script context="module">
  export async function preload($page, $session){
    const continents = await this.fetch("/api/continents").then(res => res.json());
    return {continents};
  }
</script>

<style>
  .contlist {
    display: flex;
    flex-direction: column;
    padding: 1.5em 10%;
    background: #f5f5f5;
  }

  .contbox {
    display: flex;
    flex-direction: column;
    margin: 1.5em 0;
    padding: 1.5em;
    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.14),
      0 2px 1px -1px rgba(0, 0, 0, 0.12), 0 1px 3px 0 rgba(0, 0, 0, 0.2);
    border-top: var(--primary-color) 6px solid;
    border-radius: 3px;
    background: #fff;
  }

  .contname {
    margin-bottom: 1em;
  }

  .countrylist {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(15em, 1fr));
    grid-column-gap: 1em;
  }

  .country > a {
    display: inline-flex;
    align-items: center;
    padding: 0.5em;
    color: var(--primary-color);
  }

  .country :global(picture){
    margin: 0 0.5em 0 0;
    width: 24px;
    height: 24px;
  }
</style>

<script>
  import Page from "/Components/Page.svelte";
  import CountryFlag from "/Components/CountryFlag.svelte";
  import { canonical, countryUrl, indexUrl } from "/Common/urls";

  import { stores } from "@sapper/app";
  const { page } = stores();

  import * as i18n from "/Common/i18n";
  const { lang, trans } = i18n.stores();

  export let continents;

  const sort = (a, b) => a.name.localeCompare(b.name);

  $: conts = continents.map(cont => {
    return {
      ...cont, 
      name: $trans(`continents.${cont.code}`),
      countries: cont.countries.map(country => {
        return {
          ...country,
          name: $trans(`countries.${country.code}`)
        }
      }).sort(sort)
    }
  }).sort(sort);

  const size = 24; // 16 24 32 48 64
  const style = "shiny"; // flat shiny

  $: meta = {
    title: $trans("globalIndex.head.title"),
    desc: $trans("globalIndex.head.desc"),
    canonical: canonical(indexUrl({lang: $lang}))
  };
</script>

<Page {meta}>
  <ul class="contlist">
    {#each conts as cont}
      <li class="contbox">
        <div class="contname">{cont.name}</div>
        <ul class="countrylist">
          {#each cont.countries as country}
            <li class="country">
              <a class="no-a underline-link" href={countryUrl({ lang: $lang, countryCode: country.code })}>
                <CountryFlag {size} {style} countryCode={country.code} />
                {country.name}
              </a>
            </li>
          {/each}
        </ul>
      </li>
    {/each}
  </ul>
</Page>
