<script context="module">
  //const keymap = {lt: "lt", gt: "gt", w96: "lt"}
</script>

<style>
  img{
    width: var(--width);
    height: calc(var(--width) * 0.6875);
    object-fit: cover;
    object-position: center;
    border-radius: 3px;
  }
</style>

<script>
  import {stationImgUrl} from "/Common/urls";

  export let station;
  export let size; // "lt" | "gt" | "w96"
  
  //const [webp, legacy] = stationImgUrl(size, station.img[keymap[size]]);
  $: [webp, legacy] = stationImgUrl(size, station);
  $: legacyType = station.origin != "mt" ? "image/png" : "image/jpg";
</script>

<picture>
  <source srcset={webp} type="image/webp">
  <img src={legacy} alt={station.name} >
</picture>