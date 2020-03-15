<svelte:options accessors={true}/>

<style>
  .floatingplayer{
    direction: ltr;
    display: flex;
    flex-direction: row;
    position: fixed;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 86px;
    
    box-shadow: 0 2px 8px rgba(0,0,0,0.25), 0 1px 5px rgba(0,0,0,0.22);
    color: #292929;
    background: #fff;
    
    border-top: rgba(0,0,0,0.15) 1px solid;
    align-items: center;

    --spacing: 0.5em;
    --button-size: 2.5em;
  }

  .player{
    display: flex;
    flex-direction: row;
  }

  .image{
    position: relative;
    cursor: pointer;
    margin-left: 0.5em;
    --width: 85px;
    width: var(--width);
    border-radius: 2px 0 0 2px;
    overflow: hidden; 
  }

  .text{
    font-size: 14px;
    display: flex;
    flex-direction: column;
    align-self: center;
    flex: 1;
  }

  .text > a{
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 1.25em;
  }

  .volume{
    font-size: 1.5rem;
    display: none;
    color: #666;
    margin-right: var(--spacing);
  }

  .toggle, .close{
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25em;
    color: #666;
    box-sizing: content-box;
    height: 100%;
    flex: none;
    cursor: pointer;
    align-self: center;
    height: var(--button-size);
    width: var(--button-size);
    margin-right: var(--spacing);
  }

  .cover{
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    display: flex;
    background-color: rgba(0,0,0,0.5);
  }

  .icon{
    display: flex;
    margin: auto;
    color: #fff;
    filter: drop-shadow(#000 0 0 2px);
  }

  .media-element{
    display: none;
  }

  @media screen and (min-width: 600px){
    .floatingplayer{
      --spacing: 1em;
    }

    .volume{
      display: flex;
    }
  }
</style>

<script>
  import {fly, fade} from "svelte/transition";

  import {playerState} from "/Stores/playerState";
  import {recentList} from "/Stores/recentList";

  //import StateIcon from "/Components/StateIcon.svelte"
  import Volume from "/Components/Volume.svelte"
  import StationImage from "/Components/StationImage.svelte"
  

  import Play from "svelte-material-icons/Play.svelte";
  import Pause from "svelte-material-icons/Pause.svelte";
  import Close from "svelte-material-icons/Close.svelte";
  import Loading from "/Components/Loading.svelte";

  import * as i18n from "/Common/i18n";
  const {lang} = i18n.stores();

  import {stationUrl, stationImgUrl} from "/Common/urls";

  export let mediaElement = null;
  export let station = null;
  export let state = "paused"; // playing, loading, unstarted
  //export let reallyPlaying = false;
  export let volume = 1;
  //export let showVolume = true;
  $: hidden = station == null;

  $: playerState.set({station, state, hidden});

  let hlsPromise;
  const getHls = async () => {
    if(typeof Hls !== "undefined")
      return Hls;
    
    if(hlsPromise != null)
      return hlsPromise;

    return hlsPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "/static/js/hls.js";
      script.onload = () => resolve(Hls);
      script.onerror = reject;
      document.head.appendChild(script);
    })
  }

  let hls = null;

  const handleStalled = event => state = "loading";
  const handlePlay = event => state = "loading";
  const handlePlaying = event => state = "playing";
  const handlePause = event => state = "paused";
  const handleError = console.log;

  export function close(){
    mediaElement.pause();
    mediaElement.removeAttribute("src");
    mediaElement.load();
    if(hls != null){
      hls.destroy();
      hls = null;
    }
    station = null;
  }

  const playHls = async url => {
    const Hls = await getHls();
    
    if(!Hls.isSupported()){
      return false;
    }

    try{
      //always proxy
      //url = url.startsWith("http://") ? "/proxy/" + url : url;
      url = `/proxy/${url}`;
      hls = new Hls();
      
      hls.on(Hls.Events.ERROR, (event, data) => {
        const {type, details, fatal} = data;
        for(const [key, value] of Object.entries(Hls.ErrorTypes)){
          if(type === value)
            console.log(key);
        }

        console.log(event, data);
      })
      
      state = "loading";
      await hls.loadSource(url);
      await hls.attachMedia(mediaElement);
      await new Promise(resolve => hls.on(Hls.Events.MANIFEST_PARSED, resolve))
      await mediaElement.play();
      return true;
    } catch(e){
      return false;
    }
  }

  const playFile = async url => {
    try {
      mediaElement.src = url;
      await mediaElement.load();
      await mediaElement.play();
      return true;
    } catch(e){
      return false;
    }
  }

  const playStream = stream => {
    console.log(Array.from(Object.values(stream)));
    if(stream.type === "hls"){
      return playHls(stream.url);
    } else {
      return playFile(stream.url);
    }
  }

  export async function play(st = null){
    if(st == null || (station && station._id === st._id)){
      try {
        await mediaElement.play();
        return true;
      } catch(e){
        return false;
      }
    }
    
    station = st;

    recentList.update(list => {
      let helper = list.filter(item => item._id !== station._id);
      const {_id, countryCode, name, slug, mt, origin} = station;
      const item = {_id, countryCode, name, slug, mt, origin};
      helper = [item, ...helper].slice(0, 60);
      return helper;
    })

    const streams = sortStreams(station);
    
    if(streams.length === 0){
      return false;
    }

    for(let i = 0; i < streams.length; i++){
      const stream = streams[i];
      if(await playStream(stream)){
        return true
      } else {
        continue;
      }
    }

    return false;
  }

  export function pause(){
    mediaElement.pause();
  }

  export function toggle(){
    switch(state){
      case "playing":
      case "loading":
        pause(); break;
      case "paused": 
        play(); break;
    }
  }

  export function sortStreams(station){
    const always = [];
    const probably = [];
    const maybe = [];
    const hlsDirect = [];
    const hlsProxy = [];
    
    station.streams.forEach(stream => {
      if(stream.type === "rtmp") return;
      if(stream.type === "hls"){
        if(stream.url.startsWith("http://")){
          hlsProxy.push(stream);
        } else {
          hlsDirect.push(stream);
        }
      } else {
        const can = mediaElement.canPlayType(stream.mime);
        if(can === "always") always.push(stream);
        else if(can === "maybe") maybe.push(stream);
        else if(can === "probably") probably.push(stream);
      }
    })
    
    return [...always, ...probably, ...maybe, ...hlsDirect, ...hlsProxy];
  }
</script>

{#if station != null}
  <div class="floatingplayer {state}" transition:fly={{x: 0, y: 50, duration: 350}}>
    
    <!---
    <div class="image" style={imageStyle}>
      <div class="cover" on:click={toggle}>
        <div class="icon">
          <StateIcon {state}/>
        </div>
      </div>
    </div>
    -->

    <a class="no-a image" href={stationUrl({lang: $lang, station})}>
      <StationImage {station} size="w96"/>
      {#if state === "loading"}
        <div class="cover" transition:fade={{duration: 100}}>
          <div class="icon">
            <Loading size="30px" />
          </div>
        </div>
      {/if}
    </a>

    <div class="text">
      <a class="no-a" href={stationUrl({lang: $lang, station})}>{station.name}</a>
    </div>

    
    <div class="volume">
      <Volume bind:volume />
    </div>
    
    <div class="toggle" on:click={toggle}>
      {#if state === "paused"}
        <Play size="1.5em"/>
      {:else}
        <Pause size="1.5em" />
      {/if}
    </div>

    <div class="close" on:click={close}>
      <Close size="1.5em"/>
    </div>
  </div>
{/if}

<audio
  bind:this={mediaElement}
  class="media-element"
  bind:volume
  on:stalled={handleStalled}
  on:play={handlePlay}
  on:playing={handlePlaying}
  on:pause={handlePause}
  on:error={handleError}
/>