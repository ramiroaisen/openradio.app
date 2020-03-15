<script>
  import { fade } from "svelte/transition";
  import Close from "svelte-material-icons-0/dist/ChevronLeft.svelte";
  import Langs from "svelte-material-icons/Translate.svelte";
  import Countries from "svelte-material-icons/Earth.svelte";
  import Recents from "svelte-material-icons/Timelapse.svelte";
  import Genres from "svelte-material-icons/GooglePages.svelte";
  import Fms from "svelte-material-icons/AlphaFBox.svelte";
  import Ams from "svelte-material-icons/AlphaACircle.svelte";

  import { stores } from "@sapper/app";
  const { page } = stores();

  import { getContext } from "svelte";
  import DASH from "./DASH";
  const { navOpen, closeNav, openNav } = getContext(DASH);

  import {
    indexUrl,
    langsUrl,
    recentsUrl,
    genreListUrl,
    signalListUrl
  } from "/Common/urls";

  import * as i18n from "/Common/i18n";
  const { lang, trans, countryCode, country } = i18n.stores();

  const handleClick = event => {
    let target = event.target;
    do {
      if (target.tagName.toLowerCase() === "a") {
        navOpen.set(false);
        break;
      }
    } while ((target = target.parentElement));
  };
</script>

<style>
  .cover {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.75);
    z-index: 15000;
  }
  .menu {
    background: #fff;
    position: fixed;
    top: 0;
    left: 0;
    width: 300px;
    max-width: 80%;
    height: 100%;
    z-index: 15100;
    transform: translateX(-105%);
    transition: transform 150ms ease-in-out;
    display: flex;
    flex-direction: column;
  }
  .open > .menu {
    transform: none;
  }
  .title {
    font-size: 1.5rem;
    transition: opacity 150ms ease;
    color: var(--primary-color);
    border-bottom: rgba(0, 0, 0, 0.15) 1px solid;
    flex: none;
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .title span {
    opacity: 0.4;
  }
  .close {
    flex: none;
    display: flex;
    font-size: 0.75em;
    cursor: pointer;
    padding: 1rem;
    transition: background-color 200ms ease;
  }
  .close:hover {
    background: rgba(61, 90, 254, 0.25);
  }
  .content {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    font-size: 1.25em;
  }

  .group {
    padding: 0.5em 0;
    flex: none;
  }

  .group + .group {
    border-top: rgba(0, 0, 0, 0.15) 1px solid;
  }

  .content a {
    display: inline-flex;
    align-items: center;
    color: var(--primary-color);
    padding: 0.5em 1em;
  }

  .content a > span {
    margin-left: 0.75em;
  }

  .langs {
    margin-top: auto;
  }
</style>

<nav class="nav" class:open={$navOpen}>
  {#if $navOpen}
    <div
      transition:fade={{ duration: 200 }}
      class="cover"
      on:click={closeNav} />
  {/if}
  <div class="menu" on:click={handleClick}>
    <div class="title">
      <div class="close" on:click={closeNav}>
        <Close />
      </div>
      <a class="no-a" href={indexUrl({ lang: $lang })}>
        openradio
        <span>.app</span>
      </a>
    </div>

    <div class="content scrollbar">

      <div class="group">
        <div>
          <a class="no-a" href={recentsUrl({ lang: $lang })}>
            <Recents />
            <span>{$trans('nav.recents')}</span>
          </a>
        </div>
      </div>
      <div class="group">
        <div>
          <a class="no-a" href={indexUrl({ lang: $lang })}>
            <Countries />
            <span>{$trans('nav.countries')}</span>
          </a>
        </div>
      </div>
      <!--
      <div>
        <a class="no-a" href={genreListUrl({lang: $lang, countryCode: $countryCode})}>
          <Genres />
          <span>{$trans("nav.genres")}</span>
        </a>
      </div>
      -->

      <div class="group">
        {#if !$country || ($country && $country.fmCount)}
          <div>
            <a
              class="no-a"
              href={signalListUrl({
                lang: $lang,
                type: 'fm',
                countryCode: $countryCode
              })}>
              <Fms />
              <span>{$trans('nav.fms')}</span>
            </a>
          </div>
        {/if}

        {#if !$country || ($country && $country.amCount)}
          <div>
            <a
              class="no-a"
              href={signalListUrl({
                lang: $lang,
                type: 'am',
                countryCode: $countryCode
              })}>
              <Ams />
              <span>{$trans('nav.ams')}</span>
            </a>
          </div>
        {/if}
      </div>

      <!-- TODO: MOVE TO FOOTER -->
      <div class="group langs">
        <div class="langs">
          <a class="no-a" href={langsUrl({ lang: $lang })}>
            <Langs />
            <span>{$trans('nav.langs')}</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</nav>
