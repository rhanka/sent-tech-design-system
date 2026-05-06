<script lang="ts">
  import { Badge, Button } from "@sent-tech/components-svelte";
  import { t, type Locale } from "$lib/i18n";

  let locale = $state<Locale>("fr");
</script>

<div class="docs-page">
  <div class="docs-language" role="group" aria-label="Language">
    <button type="button" aria-pressed={locale === "fr"} onclick={() => (locale = "fr")}>FR</button>
    <button type="button" aria-pressed={locale === "en"} onclick={() => (locale = "en")}>EN</button>
  </div>

  <section class="docs-hero">
    <h1>
      {t(locale, "buttonTitle")}
      <Badge tone="success">{t(locale, "statusStable")}</Badge>
    </h1>
    <p>{t(locale, "buttonIntro")}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale, "examplesTitle")}</h2>
    <div class="docs-example" aria-label={t(locale, "variants")}>
      <Button>Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </div>
    <div class="docs-example" aria-label={t(locale, "sizes")}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
    <div class="docs-example" aria-label={t(locale, "states")}>
      <Button disabled>Disabled</Button>
      <Button variant="secondary" disabled>Disabled secondary</Button>
    </div>
  </section>

  <section class="docs-section">
    <h2>{t(locale, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>variant</code></td><td><code>"primary" | "secondary" | "ghost" | "danger"</code></td><td><code>"primary"</code></td></tr>
        <tr><td><code>size</code></td><td><code>"sm" | "md" | "lg"</code></td><td><code>"md"</code></td></tr>
        <tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{t(locale, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-button-primaryBackground</code></li>
      <li><code>--st-component-button-primaryText</code></li>
      <li><code>--st-component-button-radius</code></li>
      <li><code>--st-component-input-focusRing</code></li>
    </ul>
  </section>
</div>
