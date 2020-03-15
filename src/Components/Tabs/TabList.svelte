<style>
	.tab-list {
    overflow: hidden;
    display: flex;
    overflow: hidden;
  }

  .scroll {
    flex: none;
    display: flex;
    flex-direction: row;
    align-items: center;
    transition: transform 200ms ease;
  }

  .underline{
    position: absolute;
    bottom: 0;
    transition: transform 200ms ease, width 200ms ease;
    height: 2px;
    background-color: var(--primary-color);
  }
</style>

<script>
  import {onMount, getContext} from "svelte";
  import {TABS} from "./Tabs.svelte";
  
  const {selectedTab, tabs, currentIndex, size} = getContext(TABS);
  
  let out, scroll, outW, scrollW;
  let mounted = false;

  onMount(() => mounted = true)

  let scrollX, underW, underX = 0;

  $: if(mounted){
    const selectedIndex = $tabs.indexOf($selectedTab);
    const selectedEl = scroll.children[selectedIndex];
    
    if(scrollW <= outW){
      scrollX = 0;
    } else {
      const min = -(scrollW - outW);
      const max = 0;

      const center = selectedEl.offsetLeft + (selectedEl.clientWidth / 2);
      
      scrollX = Math.min(max, Math.max(min, (out.clientWidth / 2) - center));
    }

    underW = selectedEl.clientWidth;
    underX = scrollX + selectedEl.offsetLeft;
  }
</script>

<div bind:this={out} bind:clientWidth={outW} class="tab-list">
  <div 
    bind:this={scroll}
    bind:clientWidth={scrollW}
    class="scroll"
    style="transform: translateX({scrollX}px)"
  >
    <slot></slot>
  </div>
    <div class="underline" style="width: {underW}px; transform: translateX({underX}px)">
  </div>
</div>