<style>
  .stateicon{
    display: flex;
  }
</style>

<script>
  //import Play from "svelte-material-icons/PlayCircleOutline.svelte";
  import Play from "svelte-material-icons/Play.svelte";
  //import Pause from "svelte-material-icons/PauseCircleOutline.svelte";
  import Pause from "svelte-material-icons/Pause.svelte";
  import Loading from "/Components/Loading.svelte";

  export let state;
</script>

<div class="stateicon">
  {#if state === "playing"}
    <Pause size="2.5em" />
  {:else if state === "paused"}
    <Play size="2.5em" />
  {:else if state === "loading"}
    <Loading size="2.25em"/>
  {/if}
</div>