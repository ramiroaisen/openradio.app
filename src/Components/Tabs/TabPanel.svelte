<style>
  .tab-panel{
    flex: none;
    align-self: flex-start;
    transition: opacity 500ms ease;
    opacity: 0;
  }

  .selected{
    opacity: 1;
  }
</style>

<script>
	import { getContext } from 'svelte';
	import { TABS } from './Tabs.svelte';

	const panel = {};
	const { registerPanel, selectedPanel, panels } = getContext(TABS);

	registerPanel(panel);
</script>

<div class="tab-panel" class:selected={$selectedPanel === panel}
  style="width: {100 / $panels.length}%"
>
  <slot/>
</div>