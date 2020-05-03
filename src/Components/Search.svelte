<style>
  .search{
    display: flex;
    align-items: center;
    margin: 0;
    padding: 0 0 0 0.75em;
    background: rgba(255,255,255,0.25);
    border-radius: 100px;
  }

  .field{
    font: inherit;
    font-size: 1.1rem;
    border: none;
    padding: 0.5em;
    outline: none;
    width: 100%;
    border-radius: 2px;
    /*box-shadow: rgba(0,0,0,0.15) 0 1px 2px 2px;*/
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;


    background: transparent;
    color: #fff;
  }

  .field::placeholder{
    color: rgba(255,255,255,0.8);
  }
  
  .icon{
    display: flex;
  }

  /* clears the 'X' from Internet Explorer */
  input[type=search]::-ms-clear,
  input[type=search]::-ms-reveal {
    display: none;
    width: 0;
    height: 0; 
  }

  /* clears the 'X' from Chrome */
  input[type="search"]::-webkit-search-decoration,
  input[type="search"]::-webkit-search-cancel-button,
  input[type="search"]::-webkit-search-results-button,
  input[type="search"]::-webkit-search-results-decoration {
    display: none; 
}
</style>

<script>
  import {goto as go} from "@sapper/app";
  import {stores} from "@sapper/app";
  const {session, page} = stores();

  import Search from "svelte-material-icons-0/dist/Search.svelte";
  import {searchUrl, searchActionUrl} from "/Common/urls";

  import * as i18n from "/Common/i18n";
  const {trans, lang, countryCode} = i18n.stores();

  export let value = $page.query.q || ""; 
  export let input = void 0;

  export function submit(){
    // Remove Country limited search
    // value.trim() && go(searchUrl({lang: $lang, q: value.trim(), countryCode: $countryCode }));
    value.trim() && go(searchUrl({lang: $lang, q: value.trim() }));
  }

  // Remove country limited search
  // $: action = searchActionUrl({lang: $lang, countryCode: $countryCode});
  $: action = searchActionUrl({lang: $lang});

  // Remove country limited search
  // $: placeholder = $countryCode ? $trans("search.placeholder.country", {country: $trans(`countries.${$countryCode}`)}) : $trans("search.placeholder.global");
  $: placeholder = $trans("search.placeholder.global");
</script>

<form class="search" method="get" {action} on:submit|preventDefault={submit}>
  <div class="icon">
    <Search size="1.25em"/>
  </div>
  <input 
    bind:this={input} 
    class="field"
    type="search"
    name="q"
    autocomplete="off"
    bind:value
    {placeholder}
  >
</form>