<script context="module">
	export const TABS = {};
</script>

<style>
  .tabs{
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
</style>

<script>
	import { setContext, onDestroy } from 'svelte';
	import { get, writable } from 'svelte/store';

	const tabs = writable([]);
	const panels = writable([]);
	const selectedTab = writable(null);
	const selectedPanel = writable(null);

	setContext(TABS, {
		registerTab: tab => {
			tabs.update($tabs => [...$tabs, tab]);
			selectedTab.update(current => current || tab);
			
			onDestroy(() => {
				tabs.update($tabs => {
          const i = $tabs.indexOf(tab);
				  const helper = $tabs.slice();
          helper.splice(i, 1);
  				selectedTab.update(current => current === tab ? (tabs[i] || tabs[tabs.length - 1]) : current);
          return helper;
        });
			});
		},

		registerPanel: panel => {
			panels.update($panels => [...$panels, panel]);
			selectedPanel.update(current => current || $panels[$tabs.indexOf($selectedTab)]);
			
			onDestroy(() => {
				panels.update($panels => {
          const i = $panels.indexOf(panel);
          const helper = $panels.slice();
          helper.splice(i, 1);
				  selectedPanel.update(current => current === panel ? (panels[i] || panels[panels.length - 1]) : current);
          return helper;
        });
			});
		},

		selectTab: tab => {
			const i = get(tabs).indexOf(tab);
			selectedTab.set(tab);
			selectedPanel.set(get(panels)[i]);
    },
  
    selectedTab,
    selectedPanel,
    tabs,
    panels
	});
</script>

<div class="tabs">
	<slot></slot>
</div>