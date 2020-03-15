<style>
	.tab-panel-list{
		display: flex;
		overflow: hidden;
		transition: height 200ms ease;
	}

	.scroll{
		flex: none;
		display: flex;
		flex-direction: row;
		flex-wrap: nowrap; 
		transition: transform 200ms ease;
	}
</style>

<script>
	import {onMount, getContext} from "svelte";
	import {TABS} from "./Tabs.svelte";

	const {panels, selectedPanel} = getContext(TABS);

	let scroll;
	let mounted = false;
	let scrollX, h = 0; // in percentaje
	onMount(() => mounted = true);

	$: if(mounted){
		const selectedIndex = $panels.indexOf($selectedPanel);
		scrollX = (-1 / $panels.length) * selectedIndex;
		h = scroll.children[selectedIndex].clientHeight;
	}

</script>

<div class="tab-panel-list" style={mounted && `height: ${h}px`}>
	<div bind:this={scroll} class="scroll" style="width: {$panels.length * 100}%; transform: translateX({scrollX * 100}%);">
		<slot></slot>
	</div>
</div>