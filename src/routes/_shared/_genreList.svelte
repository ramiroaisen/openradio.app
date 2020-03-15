<script context="module">
  export async function preload($page, $session){
    let url = "/api/genres";
    if($page.params.langCountry){
      const [$lang, $countryCode] = $page.params.langCountry.split("-");
      url += "?countryCode=" + $countryCode;
    }
    const genres = await this.fetch(url).then(res => res.json());
    return {genres};
  }
</script>

<script>
  import Page from "/Components/Page.svelte";
  import Box from "/Components/LinkListBox.svelte";
  import Link from "/Components/UnderlineLink.svelte";

  import * as i18n from "/Common/i18n";
  const {lang, trans, countryCode} = i18n.stores();

  import {genreUrl} from "/Common/urls";

  export let genres;

  /*
  $: ordered = genres.map(({_id, slug, count}) => {
    return {_id, slug, count, name: $trans(`genres.${slug}`)}
  }).sort((a, b) => {
    return a.name.localeCompare(b.name);
  });
  */

  $: title = $countryCode ? 
    $trans("genreList.title.country", {country: $trans(`countries.${$countryCode}`)}) : 
    $trans("genreList.title.global");
</script>

<Page>
  <h1>{title}</h1>
  <Box>
    {#each genres as genre}
      <Link 
        href={genreUrl({lang: $lang, countryCode: $countryCode, genre: genre.slug})} 
        text={$trans(`genreTitles.short.${genre.slug}`)}
        desc={$trans("radioCount", {count: genre.count})}
      />
    {/each}
  </Box>
</Page>