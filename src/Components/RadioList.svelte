<style>
  .list{
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }

  .loadmore{
    display: flex;
    padding: 1rem 0;
    height: 5rem;
  }
  
  .loadmore > span{
    display: flex;
    margin: 0 auto;
    color: var(--primary-color);
  }

  a{
    display: flex;
  }

  @media screen and (max-width: 400px){
    .list > div{
      width: 100%;
      display: flex;
    }

    .list :global(.radioitem){
      flex-direction: row;
      flex: 1;
      margin: 0.25em 0.5em;
      align-items: center;
    }

    .list :global(.image){
      flex: none;
      margin-right: 1em;
    }

    .list :global(.title){
      margin: 0;
      flex: 1;
    }

    .list :global(.title > span){
      margin: auto 0;
      text-align: start;
    }
  }
</style>

<script>
  import {flip} from "svelte/animate";
  import {fade} from "svelte/transition";

  import RadioItem from "./RadioItem.svelte";
  import Loading from "./Loading.svelte";
  import More from "svelte-material-icons-0/dist/AddCircle.svelte";

  export let stations;
  export let paging = null;
  export let url = null;
  export let apiUrl = null;

  export let loading = false;

  export const loadMore = async () => {
    
    if(loading || paging == null || !paging.nextPage)
      return;

    loading = true;
  
    const nextUrl = apiUrl.indexOf("?") == -1 ? `${apiUrl}?page=${paging.nextPage}` : `${apiUrl}&page=${paging.nextPage}`;
    const res = await fetch(nextUrl);
    const json = await res.json();
    stations = [...stations, ...json.items];
    paging = json.paging;
    loading = false;
  }

</script>

<div class="radiolist">
  <div class="list">
    {#each stations as station (station._id)}
      <div animate:flip={{duration: 500}} transition:fade|intro|local={{duration: 300}}>
        <RadioItem {station} />
      </div>
    {/each}
  </div>
  {#if paging != null && paging.nextPage}
    <div class="loadmore">
      <span>
        {#if !loading}
          <a class="no-a" href="{url}{url.indexOf("?") == -1 ? "?" : "&"}page={paging.nextPage}" on:click|preventDefault={loadMore}>
            <More size="3em"/>
          </a>
        {:else}
          <Loading size="2.5em"/>
        {/if}
      </span>
    </div>
  {/if}
</div>