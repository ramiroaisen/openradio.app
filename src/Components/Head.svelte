<script>
  export let title;
  export let description;
  export let canonical;
</script>

<title>{title}</title>
<meta property="og:title" content={title}>
<meta name="description" content={description}>
<meta property="og:description" content={description}>
<link rel="canonical" href={canonical}>