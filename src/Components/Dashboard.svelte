<style>
  .dashboard{
    padding-top: var(--topbar-height);
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
</style>

<script>
  import Topbar from "./Topbar.svelte";
  import Player from "./Player.svelte";
  //import FloatingList from "./FloatingList.svelte";
  import Nav from "./Nav.svelte";

  import { setContext } from "svelte";
  import { writable } from "svelte/store";
  import DASH from "./DASH"
  export const navOpen = writable(false);
  setContext(DASH, {
    navOpen,
    closeNav: () => navOpen.set(false),
    openNav: () => navOpen.set(true),
    toggleNav: () => navOpen.update(b => !b)
  });


	import {setPlayer} from "/Stores/player";
  let player;
  $: setPlayer(player);
</script>

<div class="dashboard">
  <Topbar/>
  <main class="main">
    <slot/>
  </main>
  <Nav/>
  <Player bind:this={player} />
</div>