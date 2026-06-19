<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

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

  // Démos en arbre NodeSpec neutre -> rendues dans le framework actif.
  // État statique : valeur figée. Noms de prop par moteur (Svelte `value`,
  // React/Vue `value`/`defaultValue`/`modelValue`) tous passés pour afficher la
  // même valeur partout. `valueFormatter`/`showValue` ne sont honorés qu'en
  // Svelte (fonction non sérialisable côté îles). Pas de binding live (note prose).
  const sizesDemo: NodeSpec[] = $derived([
    {
      el: "div",
      props: { class: "docs-demo-stack" },
      children: [
        { comp: "Slider", props: { label: "Budget (sm)", size: "sm", value: 15, defaultValue: 15, modelValue: 15, min: 0, max: 100 } },
        { comp: "Slider", props: { label: "Budget (md)", size: "md", value: 50, defaultValue: 50, modelValue: 50, min: 0, max: 100 } },
        { comp: "Slider", props: { label: "Budget (lg)", size: "lg", value: 82, defaultValue: 82, modelValue: 82, min: 0, max: 100 } }
      ]
    }
  ]);

  const validationDemo: NodeSpec[] = $derived([
    {
      el: "div",
      props: { class: "docs-demo-stack" },
      children: [
        { comp: "Slider", props: { label: text().qualityLabel, value: 35, defaultValue: 35, modelValue: 35, min: 0, max: 100, step: 5 } },
        {
          comp: "Slider",
          props: {
            label: locale.value === "fr" ? "Compact (sans libellé de valeur)" : "Compact (no value badge)",
            value: 2,
            defaultValue: 2,
            modelValue: 2,
            min: 1,
            max: 10,
            step: 1,
            showValue: false
          }
        }
      ]
    }
  ]);

  const disabledDemo: NodeSpec[] = $derived([
    {
      comp: "Slider",
      props: {
        label: locale.value === "fr" ? "Cible figée" : "Locked target",
        value: 50,
        defaultValue: 50,
        modelValue: 50,
        min: 0,
        max: 100,
        disabled: true
      }
    }
  ]);

  const formattedDemo: NodeSpec[] = $derived([
    {
      comp: "Slider",
      props: {
        label: locale.value === "fr" ? "Niveau qualité" : "Quality level",
        value: 7,
        defaultValue: 7,
        modelValue: 7,
        min: 0,
        max: 10,
        step: 1
      }
    }
  ]);
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

    <TabbedExample nodes={sizesDemo} title={t(locale.value, "sizes")} />

    <TabbedExample nodes={validationDemo} title={t(locale.value, "validation")} />
    <p class="docs-demo-note">
      {locale.value === "fr" ? "Valeur reçue via `onchange`" : "`onchange` payload"}
      : <code>35</code>
    </p>

    <TabbedExample nodes={disabledDemo} title={locale.value === "fr" ? "État désactivé" : "Disabled state"} />

    <TabbedExample nodes={formattedDemo} title={locale.value === "fr" ? "Plage personnalisée" : "Custom range"} />
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
