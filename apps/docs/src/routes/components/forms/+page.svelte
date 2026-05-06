<script lang="ts">
  import {
    Badge,
    Checkbox,
    Input,
    Radio,
    Select,
    Switch,
    Textarea
  } from "@sent-tech/components-svelte";
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
      {t(locale, "formsTitle")}
      <Badge tone="success">{t(locale, "statusStable")}</Badge>
    </h1>
    <p>{t(locale, "formsIntro")}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale, "examplesTitle")}</h2>
    <div class="docs-example docs-example--stack">
      <Input label="Project" placeholder="Sent Tech Forge" helperText="Stable field label and helper copy." />
      <Select label="Product">
        <option value="forge">Forge</option>
        <option value="entropic">Entropic</option>
        <option value="graphify">Graphify</option>
      </Select>
      <Textarea label="Description" placeholder="Short operational context" />
    </div>
  </section>

  <section class="docs-section">
    <h2>{t(locale, "validation")}</h2>
    <div class="docs-example docs-example--stack">
      <Input label="Email" invalid errorText="Email requis" />
      <Select label="Tenant" invalid errorText="Tenant requis">
        <option value="">Select a tenant</option>
      </Select>
    </div>
  </section>

  <section class="docs-section">
    <h2>{t(locale, "selectionControls")}</h2>
    <div class="docs-example docs-example--stack">
      <Checkbox label="Enable workspace templates" checked helperText="Used by Forge workspaces." />
      <Radio label="Primary runtime" name="runtime" checked />
      <Radio label="Secondary runtime" name="runtime" />
      <Switch label="Notifications" checked helperText="Uses role=switch for assistive tech." />
    </div>
  </section>

  <section class="docs-section">
    <h2>{t(locale, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Component</th><th>Props</th><th>Native attributes</th></tr>
      </thead>
      <tbody>
        <tr><td><code>Input</code></td><td><code>label</code>, <code>helperText</code>, <code>errorText</code>, <code>invalid</code>, <code>size</code></td><td><code>HTMLInputAttributes</code></td></tr>
        <tr><td><code>Textarea</code></td><td><code>label</code>, <code>helperText</code>, <code>errorText</code>, <code>invalid</code></td><td><code>HTMLTextareaAttributes</code></td></tr>
        <tr><td><code>Select</code></td><td><code>label</code>, <code>helperText</code>, <code>errorText</code>, <code>invalid</code>, <code>size</code></td><td><code>HTMLSelectAttributes</code></td></tr>
        <tr><td><code>Checkbox</code></td><td><code>label</code>, <code>helperText</code>, <code>invalid</code></td><td><code>HTMLInputAttributes</code></td></tr>
        <tr><td><code>Radio</code></td><td><code>label</code>, <code>helperText</code>, <code>invalid</code></td><td><code>HTMLInputAttributes</code></td></tr>
        <tr><td><code>Switch</code></td><td><code>label</code>, <code>helperText</code></td><td><code>HTMLInputAttributes</code></td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{t(locale, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-field-labelText</code></li>
      <li><code>--st-component-field-helpText</code></li>
      <li><code>--st-component-control-background</code></li>
      <li><code>--st-component-control-border</code></li>
      <li><code>--st-component-control-focusRing</code></li>
      <li><code>--st-component-control-invalidBorder</code></li>
      <li><code>--st-component-selection-switchTrackChecked</code></li>
    </ul>
  </section>
</div>
