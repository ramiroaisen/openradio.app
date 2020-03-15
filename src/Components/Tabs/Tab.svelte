<style>
	.tab {
    flex: none;
    padding: 0.5em 0.25em 0.4em 0.25em;
    display: flex;
    transition: color 200ms ease;
    user-select: none;
    cursor: pointer;
    margin: 0 0.4em;
    border-bottom: 2px solid transparent;
  }

  .selected{
    color: var(--primary-color);
  }
	
  .tab > span{
    margin: 0.25em;
  }
</style>

<script>
	import { getContext } from 'svelte';
	import { TABS } from './Tabs.svelte';
  
  export let selected = false;

	const tab = {};
	const { registerTab, selectTab, selectedTab } = getContext(TABS);

  registerTab(tab);
  
  if(selected)
    selectTab(tab);
</script>

<div class="tab" class:selected={$selectedTab === tab} on:click={() => selectTab(tab)}>
	<span>
    <slot></slot>
  </span>
</div>