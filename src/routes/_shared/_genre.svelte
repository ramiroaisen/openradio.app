<script context="module">
  export async function preload($page, $session){

    const _page = ($page.query.page | 0) || 1;

    let pageStr = `?page=${_page}`;

    let apiUrl = `/api/by-genre/${$page.params.genre}`;
    if($page.params.langCountry){
      const [$lang, $countryCode] = $page.params.langCountry.split("-");
      apiUrl += "?countryCode=" + $countryCode; 
      pageStr = `&page=${_page}`;
    }

    const {genre, items: stations, paging} = await this.fetch(apiUrl + pageStr).then(res => res.json());

    return {genre, stations, paging, apiUrl};
  }
</script>

<script>
  import Page from "/Components/Page.svelte";
  import RadioList from "/Components/RadioList.svelte";

  import * as i18n from "/Common/i18n";
  const {lang, trans, countryCode} = i18n.stores();
  
  import {genreUrl} from "/Common/urls";

  export let genre;
  export let stations;
  export let paging;
  export let apiUrl;

  $: url = genreUrl({lang: $lang, countryCode: $countryCode, genre: genre.slug});

  $: title = $countryCode ? 
    $trans("genreTitles.country", {title: $trans(`genreTitles.long.${genre.slug}`), country: $trans(`countries.${$countryCode}`)}) :
    $trans("genreTitles.global", {title: $trans(`genreTitles.long.${genre.slug}`)});
</script>



<Page>
  <h1>{title}</h1>
  <RadioList {stations} {paging} {apiUrl} {url} />
</Page>