<script lang="ts">
  import { Badge, Button, Modal, Toast, Tooltip } from "@sent-tech/components-svelte";
  import { t, type Locale } from "$lib/i18n";

  let locale = $state<Locale>("fr");
  let open = $state(true);
</script>

<div class="docs-page">
  <div class="docs-language" role="group" aria-label="Language">
    <button type="button" aria-pressed={locale === "fr"} onclick={() => (locale = "fr")}>FR</button>
    <button type="button" aria-pressed={locale === "en"} onclick={() => (locale = "en")}>EN</button>
  </div>

  <section class="docs-hero">
    <h1>
      {t(locale, "overlaysTitle")}
      <Badge tone="success">{t(locale, "statusStable")}</Badge>
    </h1>
    <p>{t(locale, "overlaysIntro")}</p>
  </section>

  <section class="docs-section">
    <h2>Modal</h2>
    <div class="docs-example docs-example--stack">
      <Button onclick={() => (open = true)}>Open modal</Button>
      <Modal open={open} title="Confirm action" description="Modal surfaces use overlay tokens." onclose={() => (open = false)}>
        <p>Modal content remains product-neutral and is supplied by the host application.</p>
      </Modal>
    </div>
  </section>

  <section class="docs-section">
    <h2>Tooltip</h2>
    <div class="docs-example">
      <Tooltip content="Contextual information">
        <Button variant="secondary">Hover or focus</Button>
      </Tooltip>
    </div>
  </section>

  <section class="docs-section">
    <h2>{t(locale, "feedback")}</h2>
    <div class="docs-example docs-example--stack">
      <Toast tone="success" title="Saved" message="The tenant theme was compiled." />
      <Toast tone="error" title="Failed" message="The adapter mapping is incomplete." />
    </div>
  </section>

  <section class="docs-section">
    <h2>{t(locale, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Component</th><th>Props</th><th>Semantics</th></tr>
      </thead>
      <tbody>
        <tr><td><code>Modal</code></td><td><code>open</code>, <code>title</code>, <code>description</code>, <code>onclose</code></td><td><code>role="dialog"</code>, <code>aria-modal</code></td></tr>
        <tr><td><code>Tooltip</code></td><td><code>content</code>, <code>placement</code></td><td><code>role="tooltip"</code></td></tr>
        <tr><td><code>Toast</code></td><td><code>tone</code>, <code>title</code>, <code>message</code></td><td><code>role="status"</code> or <code>role="alert"</code></td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{t(locale, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-overlay-backdrop</code></li>
      <li><code>--st-component-overlay-surface</code></li>
      <li><code>--st-component-tooltip-background</code></li>
      <li><code>--st-component-tooltip-text</code></li>
      <li><code>--st-component-toast-background</code></li>
      <li><code>--st-component-toast-errorBorder</code></li>
    </ul>
  </section>
</div>
