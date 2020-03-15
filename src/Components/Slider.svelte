<style>
.slider{
    width: 100%;
    height: 0.25em;
    border-radius: 2px;
    background: currentColor;
    cursor: pointer;
    position: relative;
  }

  .thumb{
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    height: 0.5em;
    width: 0.5em;
    border-radius: 0.5em;
    background: #fff;
    box-shadow: rgba(0,0,0,0.25) 0 0 2px 2px;
  }
</style>

<script>
  export let value = 0;
  let slider;

  const handleDown = (event) => {
    
    const handleEnd = (event) => {
      document.removeEventListener("pointercancel", handleEnd);
      document.removeEventListener("pointerup", handleEnd);
      document.removeEventListener("pointermove", handleMove);
    }

    const handleMove = (event) => {
      const rect = slider.getBoundingClientRect();
      value = Math.max(0, Math.min(1, (event.x - rect.x) / rect.width ));
    }

    document.addEventListener("pointermove", handleMove)
    document.addEventListener("pointercancel", handleEnd);
    document.addEventListener("pointerup", handleEnd);

    handleMove(event);
  }

</script>

<div bind:this={slider} class="slider" on:pointerdown|preventDefault={handleDown}>
  <div class="thumb" style="left: {value * 100}%"></div>
</div>