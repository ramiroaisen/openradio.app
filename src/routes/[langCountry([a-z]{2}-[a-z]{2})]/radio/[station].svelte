<script context="module">
  export async function preload($page, $session){

    const countryCode = $page.params.langCountry.split("-")[1];

    let station;

    try{
      station = await this.fetch(`/api/stations/${countryCode}/${$page.params.station}`).then(res => res.json());
    } catch(e){
      return this.error(500, e.message);
    }

    if(station.error){
      return this.error(station.error.code, station.error.message)
    }

    return {station};
  }
</script>

<style>
  .title-image{
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 3rem 2.5rem;
  }

  .image{
    --width: 96px;
    width: var(--width);
    border-radius: 4px;
    margin-right: 1.5rem;
    flex: none;
    box-shadow: 0 0 5px rgba(0,0,0,0.2);
  }

  .title{
    margin: 0;
  }

  .playline{
    border-bottom: rgba(0,0,0,0.15) 1px solid;
    margin-top: 2.5rem;
  }

  .play{
    background: var(--primary-color);
    color: #fff;
    height: 5rem;
    width: 5rem;
    margin: -2.5rem auto 2.5rem auto;
    border-radius: 2.5rem;
    cursor: pointer;
    box-shadow: #000 0 0 2px 0;
    display: flex;
  }

  .playicon{
    display: flex;
    margin: auto;
    flex: none;
    filter: drop-shadow(#000 0 0 2px);
  }

  .content{
    padding: 0 2.5rem;
  }

  p{
    font-size: 1.125em;
    line-height: 2em;
    padding: 0 1em;
  }

  p:first-child{
    margin-top: 0;
  }

  .desc{
    margin-bottom: 2em;
  }

  .desc > :global(b){
    display: block;
    margin-top: 2em;
  }


  .label{
    opacity: 0.5;
    margin-right: 0.5em;
  }

  .data-wrap{
    margin-top: 2em;
  }

  .data a{
    text-decoration: none;
    color: var(--primary-color);
  }
</style>

<script>
  // ONLY DEBUG
  //import copy from "copy-to-clipboard";

  import {stores} from "@sapper/app";
  const {page} = stores();

  import {onMount} from "svelte";
  
  import {playerState} from "/Stores/playerState";
  import {getPlayer} from "/Stores/player";
  
  //import {sleep} from "/utils";
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  import Page from "/Components/Page.svelte";
  import StationImage from "/Components/StationImage.svelte";
  import Programming from "/Components/Programming.svelte";
  import Signals from "/Components/Signals.svelte";
  import StateIcon from "/Components/StateIcon.svelte";
  import Tag from "/Components/Tag.svelte";
  import Play from "svelte-material-icons/Play.svelte";
  
  import * as i18n from "/Common/i18n";
  const {lang, trans} = i18n.stores();

  import {canonical, stationUrl, signalUrl, stationImgUrl} from "/Common/urls";

  export let station;

  onMount(async () => {
    await sleep(100);
    const player = getPlayer();
    if(player.state !== "playing"){
       player.play(station);
    }
  })

  const formatWebText = str => str.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
  const formatFacebookText = str => str.replace(/^https:\/\/www.facebook.com/, "").replace(/\/$/, "");
  const formatTwitterText = str => str.replace(/^https:\/\/twitter.com\/(.+)\/?/, "@$1");

  const handlePlay = async () => {
    const player = getPlayer();
    if($playerState.station && $playerState.station._id === station._id){
      player.toggle();
    } else {
      player.play(station);
    }
  }

  $: meta = {
    title: $trans("station.head.title", {station}),
    desc: $trans("station.head.desc", {station}),
    canonical: canonical(stationUrl({lang: $lang, station}))
  }
</script>

<Page {meta}>
  <main class="main">
    <div class="title-image">
      <div class="image">
        <StationImage {station} size="w96"/>
      </div>
      <h1 class="title">{station.name}</h1>
    </div>

    <div class="playline"></div>
    
    <div class="play" on:click={handlePlay}>
        <div class="playicon">
        {#if $playerState.station && $playerState.station.name === station.name}
          <StateIcon state={$playerState.state}/>
        {:else}
          <Play size="2.5em"/>
        {/if}
      </div>
    </div>

    <div class="content">
      {#if station.mt && station.mt.desc}
        <p class="desc">
          {@html station.mt.desc}
        </p>
      {:else if station.desc}
        <p class="desc">
          {station.desc}
        </p>
      {/if}
      
      <div class="info">

        {#if station.slogan != null}
            <div class="data-wrap slogan">
              <p>
                <span class="label">{$trans("station.labels.slogan")}</span>
                <span class="data">{station.slogan}</span>
              </p>
            </div>
        {/if}

        <!--
        {#if station.signal != null}
          <div class="data-wrap signal">
            <p>
              <span class="label">{$trans("station.labels.signal")}</span> 
              <span class="data">
                <a href={signalUrl({...station.signal, lang: $lang, countryCode: station.countryCode})}>
                  {station.signal.type.toUpperCase()} {station.signal.frec}
                </a>
              </span>
            </p>
          </div>
        {/if}
        -->
        <!--
        {#if station.signals.length}
          <div class="data-wrap signals">
            <p class="signals-title label">{$trans("station.labels.signals")}</p>
            {#each station.signals as signal}
              <div class="signals-list">
                <div class="signal-city">{signal.cityId}</div>
                <div class="signal-frec">{((signal) => {
                  switch(signal.type){
                    case "am":
                    case "fm":
                      return signal.frecuency + " " + signal.type.toUpperCase()
                    case "web":
                      return "Web";
                    case "other":
                      return "";
                  }
                })(signal)}</div>
              </div>
            {/each}
          </div>
        {/if}
        -->

        {#if station.web != null}
          <div class="data-wrap web">
            <p><span class="label">{$trans("station.labels.web")}</span> <span class="data"><a href="{station.web}" rel="nofollow noopener" target="_blank">{formatWebText(station.web)}</a></span></p>
          </div>
        {/if}

        {#if station.address != null}
          <div class="data-wrap address">
            <p><span class="label">{$trans("station.labels.location")}</span> <span class="data">{station.address}</span></p>
          </div>
        {/if}

        {#if station.mail != null}
          <div class="data-wrap mail">
            <p><span class="label">{$trans("station.labels.mail")}</span> <span class="data"><a href="mailto:{station.mail}">{station.mail}</a></span></p>
          </div>
        {/if}

        {#if station.tel != null}
          <div class="data-wrap tel">
            <p><span class="label">{$trans("station.labels.phone")}</span> <span class="data"><a href="tel:{station.tel.url}">{station.tel.text}</a></span></p>
          </div>
        {/if}

        {#if station.facebook != null}
          <div class="data-wrap facebook">
            <p><span class="label">{$trans("station.labels.facebook")}</span> <span class="data"><a href={station.facebook} rel="noopener nofollow" target="_blank">{formatFacebookText(station.facebook)}</a></span></p>
          </div>
        {/if}

        {#if station.twitter != null}
          <div class="data-wrap twitter">
            <p><span class="label">{$trans("station.labels.twitter")}</span> <span class="data"><a href={station.twitter} rel="noopener nofollow" target="_blank">{formatTwitterText(station.twitter)}</a></span></p>
          </div>
        {/if}

        {#if station.signal != null || station.mt && station.mt.signals.length !== 0}
          <div class="data-wrap signals">
            <Signals {station}/>
          </div>
        {/if}

        {#if station.programming}
          <div class="data-wrap programming">
            <Programming programming={station.programming}/>
          </div>
        {/if}

        <div class="data-wrap tags">
          <p>
            <span class="label">{$trans("station.labels.tags")}</span>
            <span class="data">
              <Tag label={$trans("station.tags.live", {station})} countryCode={station.countryCode}/>
              <Tag label={$trans("station.tags.listen", {station})} countryCode={station.countryCode}/>
              <Tag label={$trans("station.tags.listenLive", {station})} countryCode={station.countryCode}/>
              {#if station.signal != null}
                <Tag label={$trans("station.tags.signal", {station})} countryCode={station.countryCode} />
                <Tag label={$trans("station.tags.signalLive", {station})} countryCode={station.countryCode} />
                <Tag label={$trans("station.tags.signalListenLive", {station})} countryCode={station.countryCode} />
              {/if}
            </span>
          </p>
        </div>
      
      </div>
    </div>

  </main>
</Page>



