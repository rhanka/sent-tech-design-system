<script lang="ts">
  import { t, type Locale } from "$lib/i18n";

  let locale = $state<Locale>("fr");
</script>

<div class="docs-page">
  <div class="docs-language" role="group" aria-label="Language">
    <button type="button" aria-pressed={locale === "fr"} onclick={() => (locale = "fr")}>FR</button>
    <button type="button" aria-pressed={locale === "en"} onclick={() => (locale = "en")}>EN</button>
  </div>

  <section class="docs-hero">
    <h1>{t(locale, "title")}</h1>
    <p>{t(locale, "subtitle")}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale, "overview")}</h2>
    <p>{t(locale, "overviewBody")}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale, "components")}</h2>
    <ul class="docs-list">
      <li><a href="/components/button">{t(locale, "buttonTitle")}</a></li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{t(locale, "tokenPolicyTitle")}</h2>
    <p>{t(locale, "tokenPolicyBody")}</p>
  </section>
</div>
