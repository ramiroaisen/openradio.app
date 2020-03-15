<style>
  .page{
    padding-bottom: 8rem;
  }

  .page > :global(h1) {
    font-size: 2em;
    margin: 1.5em 1em 1em 1em;
    text-align: center;

  }
</style>

<script>
  import {fly} from "svelte/transition";
  export let radiolist = false;
  export let meta;
</script>

<svelte:head>
  <title>{meta.title}</title>
	<meta name="description" content={meta.desc}>
	<meta property="og:title" content={meta.title}>
	<meta property="og:description" content={meta.desc}>
	<link href={meta.canonical} rel="canonical" />
</svelte:head>

<div class="page" class:radiolist in:fly|intro={{x: -25, duration: 300}}>
  <slot/>
</div>