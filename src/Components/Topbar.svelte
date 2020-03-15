<style>
  .topbar {
    position: fixed;
    z-index: 9999;
    top: 0;
    left: 0;
    width: 100%;
    height: var(--topbar-height);
    display: flex;
    flex-direction: column;
    background: var(--primary-color);
    color: var(--contrast-color);
    box-shadow: rgba(0, 0, 0, 0.25) 0 1px 2px 2px;
  }

  .phone,
  .desktop {
    height: var(--topobar-height);
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .desktop {
    display: none;
  }

  @media screen and (min-width: 600px) {
    .desktop {
      display: flex;
    }

    .phone {
      display: none;
    }
  }

  .touchsquare {
    flex: none;
    display: flex;
    width: var(--topbar-height);
    height: var(--topbar-height);
    cursor: pointer;
    transition: background-color 200ms ease;
  }

  .touchsquare:hover {
    background: rgba(0, 0, 0, 0.25);
  }

  .icon {
    flex: none;
    display: flex;
    margin: auto;
    font-size: 1.25rem;
  }

  .desktop :global(.topbar-title){
    flex: none;
    margin-right: 1.5em;
  }

  .search {
    flex: 1;
  }

  .desktop .search{
    padding-right: 1.5rem;
  }
</style>

<script>
  import TopbarTitle from "./TopbarTitle.svelte";
  import Player from "./Player.svelte";
  import Search from "./Search.svelte";

  import Menu from "svelte-material-icons-0/dist/Menu.svelte";
  import Close from "svelte-material-icons-0/dist/Close.svelte";
  import SearchIcon from "svelte-material-icons-0/dist/Search.svelte";

  import DASH from "./DASH";
  import { getContext } from "svelte";

  const {navOpen, toggleNav} = getContext(DASH);

  //export let menuOpen = false;
  export let mode = "normal"; // or "search";
  // export let value = void 0;
  let mobileSearch;
  let searchInput;
  let submit;

  export let toggleSearch = () => {
    if (mode === "normal") {
      mode = "search";
      setTimeout(() => searchInput.focus(), 10);
    } else if (mode === "search") {
      mode = "normal";
    }
  };  
</script>

<div class="topbar" class:mode>

  <div class="phone">
    {#if mode === 'normal'}
      <div class="touchsquare" on:click={toggleNav}>
        <div class="icon">
          {#if $navOpen}
            <Close />
          {:else}
            <Menu />
          {/if}
        </div>
      </div>

    <TopbarTitle/>

      <div class="touchsquare" on:click={toggleSearch}>
        <div class="icon">
          <SearchIcon />
        </div>
      </div>
    {:else if mode === 'search'}
      <div class="touchsquare" on:click={toggleSearch}>
        <div class="icon">
          <Close />
        </div>
      </div>

      <div class="search">
        <Search bind:input={searchInput} bind:this={mobileSearch}/>
      </div>

      <div class="touchsquare" on:click={() => mobileSearch.submit()}>
        <div class="icon">
          <SearchIcon />
        </div>
      </div>
    {/if}
  </div>

  <div class="desktop">
    <div class="touchsquare" on:click={toggleNav}>
      <div class="icon">
        {#if $navOpen}
          <Close />
        {:else}
          <Menu />
        {/if}
      </div>
    </div>

    <TopbarTitle />

    <div class="search">
      <Search/>
    </div>

  </div>
</div>
