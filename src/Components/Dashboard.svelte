<style>
  .dashboard{
    padding-top: var(--topbar-height);
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .or-adbar {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: var(--adbar-height);
    max-height: var(--adbar-height);
    min-height: var(--adbar-height);
    box-sizing: border-box;
    background: #ddd;
    border-top: #999 1px solid;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  ins {
    width: 100%;
    height: 100%;
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
  <div class="or-adbar">
    <ins class="adsbygoogle"
         style="display:block"
         data-ad-client="ca-pub-6229656373494263"
         data-ad-slot="7901569070"
         data-ad-format="auto"
         data-adtest="on"
         data-full-width-responsive="true">
    </ins>
  </div>
</div>