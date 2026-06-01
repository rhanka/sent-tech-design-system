<script lang="ts">
  import { Badge, Slider } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  const copy = {
    fr: {
      intro:
        "Curseur horizontal continu basé sur `<input type=\"range\">` avec libellé optionnel, valeur affichée et formatage personnalisable.",
      usageTitle: "Notes d’usage",
      usageNote1:
        "`safeValue` est calculé entre `min` et `max` ; la valeur affichée et l’UI ne sortent pas de ce périmètre.",
      usageNote2:
        "Quand `showValue` est faux, seul le slider est visible ; vous pouvez piloter un affichage externe via le binding ou `onchange`.",
      qualityLabel: "Qualité"
    },
    en: {
      intro:
        "Continuous horizontal range control based on `<input type=\"range\">` with optional label, live value and custom formatting.",
      usageTitle: "Usage notes",
      usageNote1:
        "`safeValue` is clamped between `min` and `max`; the visual value and fill never leave that range.",
      usageNote2:
        "When `showValue` is false, only the slider is rendered and you can render value externally via binding or `onchange`.",
      qualityLabel: "Quality"
    }
  } as const;

  const text = () => copy[locale.value];

  let smValue = $state(15);
  let mdValue = $state(50);
  let lgValue = $state(82);
  let volumeValue = $state(34);
  let compactValue = $state(2);
  let lastChange = $state(34);

  function formatPercent(value: number) {
    return `${value}%`;
  }

  function formatQuality(value: number) {
    return `${value}/10`;
  }

  function handleQualityChange(value: number) {
    lastChange = value;
  }
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Formulaire</p>
    <div class="docs-hero-title">
      <h1>Slider</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>

    <div class="docs-example" aria-label={t(locale.value, "sizes")}>
      <Slider
        label={locale.value === "fr" ? "Budget (sm)" : "Budget (sm)"}
        size="sm"
        bind:value={smValue}
        min={0}
        max={100}
      />
      <Slider
        label={locale.value === "fr" ? "Budget (md)" : "Budget (md)"}
        size="md"
        bind:value={mdValue}
        min={0}
        max={100}
      />
      <Slider
        label={locale.value === "fr" ? "Budget (lg)" : "Budget (lg)"}
        size="lg"
        bind:value={lgValue}
        min={0}
        max={100}
      />
    </div>

    <div class="docs-example" aria-label={t(locale.value, "validation")}>
      <Slider
        label={text().qualityLabel}
        bind:value={volumeValue}
        min={0}
        max={100}
        step={5}
        valueFormatter={formatPercent}
        onchange={handleQualityChange}
      />
      <Slider
        label={locale.value === "fr" ? "Compact (sans libellé de valeur)" : "Compact (no value badge)"}
        bind:value={compactValue}
        min={1}
        max={10}
        step={1}
        showValue={false}
      />
      <p class="docs-demo-note">
        {locale.value === "fr" ? "Valeur reçue via `onchange`" : "`onchange` payload"}
        : <code>{lastChange}</code>
      </p>
    </div>

    <div class="docs-example" aria-label={locale.value === "fr" ? "État désactivé" : "Disabled state"}>
      <Slider
        label={locale.value === "fr" ? "Cible figée" : "Locked target"}
        bind:value={mdValue}
        min={0}
        max={100}
        disabled
      />
    </div>

    <div class="docs-demo-inline" aria-label={locale.value === "fr" ? "Affichage formaté" : "Formatted display"}>
      <Slider
        label={locale.value === "fr" ? "Niveau qualité" : "Quality level"}
        bind:value={volumeValue}
        min={0}
        max={10}
        step={1}
        valueFormatter={formatQuality}
      />
    </div>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>value</code></td><td><code>number</code> (<code>$bindable</code>)</td><td><code>0</code></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>helperText</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>errorText</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>invalid</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>size</code></td><td><code>"sm" | "md" | "lg"</code></td><td><code>"md"</code></td></tr>
        <tr><td><code>min</code></td><td><code>number</code></td><td><code>0</code></td></tr>
        <tr><td><code>max</code></td><td><code>number</code></td><td><code>100</code></td></tr>
        <tr><td><code>step</code></td><td><code>number</code></td><td><code>1</code></td></tr>
        <tr><td><code>showValue</code></td><td><code>boolean</code></td><td><code>true</code></td></tr>
        <tr><td><code>valueFormatter</code></td><td><code>(value: number) =&gt; string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>onchange</code></td><td><code>(value: number) =&gt; void</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{text().usageTitle}</h2>
    <p class="docs-demo-note">{text().usageNote1}</p>
    <p class="docs-demo-note">{text().usageNote2}</p>
    <p class="docs-demo-note">
      {locale.value === "fr"
        ? "Le tooltip flottant s’affiche au survol/focus du slider."
        : "Tooltip is shown on hover/focus."}
    </p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-field-labelText</code></li>
      <li><code>--st-component-field-gap</code></li>
      <li><code>--st-component-field-helpText</code></li>
      <li><code>--st-component-field-errorText</code></li>
      <li><code>--st-component-field-maxWidth</code></li>
      <li><code>--st-component-control-border</code></li>
      <li><code>--st-component-control-focusRing</code></li>
      <li><code>--st-component-control-radius</code></li>
      <li><code>--st-semantic-border-subtle</code></li>
      <li><code>--st-semantic-text-muted</code></li>
      <li><code>--st-semantic-text-secondary</code></li>
      <li><code>--st-semantic-text-primary</code></li>
      <li><code>--st-semantic-surface-default</code></li>
      <li><code>--st-semantic-feedback-error</code></li>
      <li><code>--st-semantic-action-primary</code></li>
      <li><code>--st-motion-fast</code></li>
      <li><code>--st-motion-easing</code></li>
      <li><code>--st-slider-fill</code></li>
    </ul>
  </section>
</div>
