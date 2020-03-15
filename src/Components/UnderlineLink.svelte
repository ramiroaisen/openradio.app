<style>
  a{
    flex: none;
    display: block;
    padding: 0.75em;
    margin: 0 auto;
    position: relative;
  }

  a:after{
    content: " ";
    display: block;
    position: absolute;
    width: 100%;
    height: 2px;
    background: var(--primary-color);
    opacity: 0.5;
    bottom: 0.3em;
    left: 0;
    transition: transform 150ms ease;
    transform: scaleX(0);
  }

  a:hover:after{
    transform: scaleX(1);
  }

  .text{
    color: var(--primary-color);
  }

  .desc{
    opacity: 0.9;
  }
</style>

<script>
  export let href;
  export let text;
  export let desc;
</script>

<a class="no-a" {href}>
  <span class="text">{text}</span>
  {#if desc}
    <span class="desc">({desc})</span>
  {/if}
</a>