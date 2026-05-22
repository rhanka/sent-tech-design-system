<script lang="ts">
  import { Badge, Button } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Action</p>
    <h1>
      {t(locale.value, "buttonTitle")}
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </h1>
    <p>{t(locale.value, "buttonIntro")}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>
    <div class="docs-example" aria-label={t(locale.value, "variants")}>
      <Button>Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </div>
    <div class="docs-example" aria-label={t(locale.value, "sizes")}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
    <div class="docs-example" aria-label={t(locale.value, "states")}>
      <Button disabled>Disabled</Button>
      <Button variant="secondary" disabled>Disabled secondary</Button>
      <Button variant="ghost" disabled>Disabled ghost</Button>
      <Button variant="danger" disabled>Disabled danger</Button>
    </div>
    <div class="docs-example" aria-label="Form types">
      <Button type="submit">Submit</Button>
      <Button type="reset" variant="secondary">Reset</Button>
      <Button type="button" variant="ghost">Button</Button>
    </div>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>variant</code></td><td><code>"primary" | "secondary" | "ghost" | "danger"</code></td><td><code>"primary"</code></td></tr>
        <tr><td><code>size</code></td><td><code>"sm" | "md" | "lg"</code></td><td><code>"md"</code></td></tr>
        <tr><td><code>type</code></td><td><code>"button" | "submit" | "reset"</code></td><td><code>"button"</code></td></tr>
        <tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-button-primaryBackground</code></li>
      <li><code>--st-component-button-primaryText</code></li>
      <li><code>--st-component-button-radius</code></li>
      <li><code>--st-component-input-focusRing</code></li>
    </ul>
  </section>
</div>
