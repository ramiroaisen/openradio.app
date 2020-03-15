<style>
  .volume{
    display: flex;
    flex-direction: row;
    align-items: center;
    overflow: hidden;
    padding: 0.5em;
    /*
    background: var(--primary-color);
    border-radius: 100px;
    box-shadow: rgba(0,0,0,0.4) 0 0 4px 2px;
    */
  }

  .icon{
    flex: none;
    cursor: pointer;
    display: flex;
  }

  .slider{
    width: 2.5em;
    height: 0.25em;
    margin-left: 0.5em;
    margin-right: -3em;
    opacity: 0;
    transition: opacity 200ms ease, margin-right 200ms ease;
  }

  .volume:hover .slider, .volume:active .slider{
    margin-right: 0.5em;
    opacity: 1;
  }
</style>

<script>
  import Slider from "/Components/Slider.svelte";

  import VolumeOff from "svelte-material-icons/VolumeOff.svelte";
  import VolumeMute from "svelte-material-icons/VolumeMute.svelte";
  import VolumeDown from "svelte-material-icons-0/dist/VolumeDown.svelte";
  import VolumeUp from "svelte-material-icons-0/dist/VolumeUp.svelte";

  export let volume = 1;
  export let size = "1em";
  let toggleVolume = 0;

  export function toggle(){
    if(volume === 0){
      if(toggleVolume === 0) volume = 1;
      else volume = toggleVolume;
    } else {
      toggleVolume = volume;
      volume = 0;
    }
  }
</script>

<div class="volume">

  <div class="slider">
    <Slider bind:value={volume} />
  </div>

  <div class="spacer"></div>

  <div class="icon" on:click={toggle}>
    {#if volume === 0}
      <VolumeOff {size}/>
    {:else}
      <VolumeUp {size}/>
    {/if}
  </div>

</div>