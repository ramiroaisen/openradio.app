<style>
  .topbar-title {
    flex: 1;
    font-size: 1.25em;
    display: flex;
    flex-direction: row;
    direction: ltr;
  }

  a{
    display: flex;
    flex-direction: row;
  }

  a :global(picture){
    width: 24px;
    height: 24px;
    margin-right: 0.5em;
  }

  /*
  .flag{
    width: 24px;
    height: 24px;
    margin-right: 0.5em;
    //transform: translateY(-0.1em);
  }
  */

  .lite {
    color: rgba(255, 255, 255, 0.5);
  }

  /*
  .arrow{
    margin: 0 0.25em; 
  }
  */
</style>

<script>
  import CountryFlag from "/Components/CountryFlag.svelte";

  import * as i18n from "/Common/i18n";
  const {trans, lang, countryCode} = i18n.stores();
  
  import {flyRight} from "svelte-layout-aware-transitions";

  import {indexUrl, countryUrl} from "/Common/urls";
</script>

<div class="topbar-title">
  {#if $countryCode}
    <a transition:flyRight|local={{}} class="no-a" href={countryUrl({lang: $lang, countryCode: $countryCode})} title={$trans(`countries.${$countryCode}`)}>
      <CountryFlag size={24} countryCode={$countryCode} />
    </a>
  {/if}
  <a class="no-a" href={indexUrl({lang: $lang})}>openradio<span class="lite">.app</span></a>
</div>



