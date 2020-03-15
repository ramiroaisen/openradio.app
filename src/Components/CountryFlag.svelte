<style>
  img{
    width: 24px;
    height: 24px;
    margin-right: 12px;
  }
</style>

<script>
  export let size;
  export let style = "shiny"; // or flat
  export let countryCode;

  const legacy = `/static/img/countryflags/legacy/${style}.${countryCode}.${size}.png`;
  //const webp = `/static/img/countryflags/webp/${style}.${countryCode}.${size}.png.webp`;
</script>

<img src={legacy} alt={countryCode}>

<!--
<picture>
  <source srcset={webp} type="image/webp">
  <source srcset={legacy} type="image/png">
  <img src={legacy} alt={countryCode}>
</picture>
-->