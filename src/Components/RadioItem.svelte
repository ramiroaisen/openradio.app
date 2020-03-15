<style>
  .radioitem{
    flex: none;
    display: flex;
    flex-direction: column;
    margin: 0.5em;
    width: 96px;
    padding: 0.5em;
    box-sizing: content-box;
    box-shadow: 0 1px 1px 0 rgba(0,0,0,0.14), 0 2px 1px -1px rgba(0,0,0,0.12), 0 1px 3px 0 rgba(0,0,0,0.2);
    color: #616161;
    background: #fff;
    border-radius: 2px;
  }

  .image{
    position: relative;
    --width: 96px;
    width: var(--width);
    border-radius: 3px;
    overflow: hidden;
    cursor: pointer;
  }
  
  .title{
    display: flex;
    font-size: 0.8em;
    line-height: 1.5em;
    height: 3em;
    max-height: 3em;
    overflow: hidden;
    margin-top: 0.75em;
    text-align: center;
  }

  .title > span{
    margin: auto;
  }

  /*
  .flag{
    position: absolute;
    right: 0;
    bottom: 0;
    width: 16px;
    height: 16px;
  }
  */
</style>

<script>
  import StationImage from "/Components/StationImage.svelte";
  import CountryFlag from "/Components/StationImage.svelte";
      
  import Loading from "/Components/Loading.svelte";

  import {stores} from "@sapper/app";
  const {page} = stores();

  import * as i18n from "/Common/i18n";
  const {lang, countryCode} = i18n.stores();

  import {stationUrl} from "/Common/urls";

  export let station;
</script>

<a class="no-a radioitem" href={stationUrl({lang: $lang, station})}>
  <div class="image">
    <StationImage {station} size="w96" />
    <!--
    {#if !$countryCode}
      <div class="flag">
        <CountryFlag size={16} countryCode={station.countryCode} />
      </div>
    {/if}
    -->
  </div>  
  <div class="title" title={station.name}>
    <span>{station.name}</span>
  </div>
</a>