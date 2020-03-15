<script>
  import Page from "/Components/Page.svelte";
  import UnderlineLink from "/Components/UnderlineLink.svelte";
  import LinkListBox from "/Components/LinkListBox.svelte";

  import { stores } from "@sapper/app";
  const { page } = stores();

  import * as i18n from "/Common/i18n";
  const { lang, trans } = i18n.stores();

  import { canonical, langsUrl, indexUrl } from "/Common/urls";

  import map from "/db/data/langs.json";

  const langs = Object.values(map).sort((a, b) => {
    a.native.localeCompare(b.native);
  });

  $: meta = {
    title: $trans("langs.head.title"),
    desc: $trans("langs.head.desc"),
    canonical: canonical(langsUrl({lang: $lang}))
  };

</script>

<Page {meta}>
  <h1>{$trans('langs.title')}</h1>
  <LinkListBox>
    {#each langs as lang}
      <UnderlineLink
        href={indexUrl({ lang: lang.code })}
        text={lang.native}
        desc={lang.en} />
    {/each}
  </LinkListBox>
</Page>
