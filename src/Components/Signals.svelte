<style>
  a{
    color: var(--primary-color);
  }

  .signals{
    box-shadow: rgba(0, 0, 0, 0.14) 0px 1px 1px 0px, rgba(0, 0, 0, 0.12) 0px 2px 1px -1px, rgba(0, 0, 0, 0.2) 0px 1px 3px 0px;
    background: #fff;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
  }

  .title{
    flex: none;
    font-size: 1.1em;
    padding: 1em 1.25em;
    border-bottom: rgba(231,231,231) 1px solid;
  }

  .list{
    display: flex;
    flex-direction: column;
  }

  .item{
    display: flex;
    flex-direction: row;
    padding: 1em 1.5em;
  }

  .item:nth-child(odd):not(:only-child){
    background: rgb(61, 90, 254, 0.1);
  }

  .region{
    flex: 1;
  }
</style>

<script>
  import {stores} from "/Common/i18n";
  const {lang, trans} = stores();

  import {signalUrl} from "/Common/urls";

  export let station;
</script>

<div class="signals">
  <div class="title">
    {$trans("station.signals.title")}
  </div>
  <div class="list">
    {#if station.origin == "mt"}
      {#each station.mt.signals as signal}
        <div class="item">
          <div class="region">{signal.regionName} - {$trans(`countries.${station.countryCode}`)}</div>
          <div class="frec">
            {#if signal.type == "am" || signal.type == "fm"}
              <a class="no-a" href={signalUrl({lang: $lang, countryCode: station.countryCode, type: signal.type, frec: signal.frec})}>
                {$trans("station.signals.type.amfm", {type: signal.type, frec: signal.frec})}
              </a>
            {:else if signal.type == "web"}
              {$trans("station.signals.type.web")}
            {:else}
              {signal.str}
            {/if}
          </div>
        </div>
      {/each}
    {:else}
      <div class="item">
        <div class="region">{$trans(`countries.${station.countryCode}`)}</div>
        <div class="frec">
          <a class="no-a" href={signalUrl({lang: $lang, countryCode: station.countryCode, type: station.signal.type, frec: station.signal.frec})}>
            {$trans("station.signals.type.amfm", {type: station.signal.type, frec: station.signal.frec})}
          </a>
        </div>
      </div>
    {/if}
  </div>
</div>