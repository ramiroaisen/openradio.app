<style>
  .loading{
    margin-top: 1.5em;
    color: var(--primary-color);
  }
</style>

<script>
  import Page from "/Components/Page.svelte";
  import Loading from "/Components/Loading.svelte";
  import RadioList from "/Components/RadioList.svelte";

  import {stores} from "/Common/i18n"
  const {lang, trans} = stores();

  import {canonical, recentsUrl} from "/Common/urls";

  import {recentList} from "/Stores/recentList";

  import {fade} from "svelte/transition";

  import {onMount} from "svelte";
  
  $: meta = {
    title: $trans("recents.head.title"),
    desc: $trans("recents.head.desc"),
    canonical: canonical(recentsUrl({lang: $lang}))
  }

  let mounted = false;
  onMount(() => {
    mounted = true;
  })
  
</script>

<Page {meta}>
  <h1>{$trans("recents.title")}</h1>
  {#if mounted}
    <div in:fade>
      <RadioList stations={$recentList} />
    </div>
  {:else}
    <div class="loading">
      <Loading size="2.5em" />
    </div>
  {/if}
</Page>