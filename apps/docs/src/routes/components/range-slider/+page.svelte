<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const copy = {
    fr: {
      intro:
        "Curseur à deux poignées pour sélectionner une plage `[min, max]`. Plage colorée entre les poignées, qui ne se croisent jamais, et clavier complet sur chaque poignée.",
      usageTitle: "Notes d’usage",
      usageNote1:
        "Contrôlé via `value: [number, number]` (Svelte/React) ou `v-model` (Vue). Sans `value`, le composant gère un état interne à partir de `defaultValue`.",
      usageNote2:
        "Chaque poignée est un `role=\"slider\"` indépendant avec ses propres `aria-valuemin/now/max` ; la poignée basse ne dépasse jamais la haute (et inversement).",
      a11yTitle: "Accessibilité",
      a11yNote:
        "Flèches = ±step, PagePréc/Suiv = ±10×step, Début/Fin = min/max. Chaque poignée a un `aria-label` distinct (`ariaLabelMin` / `ariaLabelMax`)."
    },
    en: {
      intro:
        "Two-handle slider to select a `[min, max]` range. Colored band between the handles, which never cross, and full keyboard support on each handle.",
      usageTitle: "Usage notes",
      usageNote1:
        "Controlled via `value: [number, number]` (Svelte/React) or `v-model` (Vue). Without `value`, the component keeps internal state seeded from `defaultValue`.",
      usageNote2:
        "Each handle is an independent `role=\"slider\"` with its own `aria-valuemin/now/max`; the low handle never exceeds the high one (and vice versa).",
      a11yTitle: "Accessibility",
      a11yNote:
        "Arrows = ±step, PageUp/Down = ±10×step, Home/End = min/max. Each handle has a distinct `aria-label` (`ariaLabelMin` / `ariaLabelMax`)."
    }
  } as const;

  const text = () => copy[locale.value];

  // Démos en arbre NodeSpec neutre. Les valeurs sont figées (snapshot) ; le nom
  // de prop est commun aux trois moteurs (`value`/`defaultValue`/`modelValue`).
  const sizesDemo: NodeSpec[] = $derived([
    {
      el: "div",
      props: { class: "docs-demo-stack" },
      children: [
        {
          comp: "RangeSlider",
          props: {
            label: locale.value === "fr" ? "Plage (sm)" : "Range (sm)",
            size: "sm",
            value: [15, 60],
            defaultValue: [15, 60],
            modelValue: [15, 60],
            min: 0,
            max: 100
          }
        },
        {
          comp: "RangeSlider",
          props: {
            label: locale.value === "fr" ? "Plage (md)" : "Range (md)",
            size: "md",
            value: [25, 75],
            defaultValue: [25, 75],
            modelValue: [25, 75],
            min: 0,
            max: 100
          }
        },
        {
          comp: "RangeSlider",
          props: {
            label: locale.value === "fr" ? "Plage (lg)" : "Range (lg)",
            size: "lg",
            value: [40, 90],
            defaultValue: [40, 90],
            modelValue: [40, 90],
            min: 0,
            max: 100
          }
        }
      ]
    }
  ]);

  const steppedDemo: NodeSpec[] = $derived([
    {
      comp: "RangeSlider",
      props: {
        label: locale.value === "fr" ? "Latence (ms, pas de 50)" : "Latency (ms, step 50)",
        value: [100, 400],
        defaultValue: [100, 400],
        modelValue: [100, 400],
        min: 0,
        max: 1000,
        step: 50
      }
    }
  ]);

  const disabledDemo: NodeSpec[] = $derived([
    {
      comp: "RangeSlider",
      props: {
        label: locale.value === "fr" ? "Plage figée" : "Locked range",
        value: [30, 70],
        defaultValue: [30, 70],
        modelValue: [30, 70],
        min: 0,
        max: 100,
        disabled: true
      }
    }
  ]);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Formulaire</p>
    <div class="docs-hero-title">
      <h1>RangeSlider</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>

    <TabbedExample nodes={sizesDemo} title={t(locale.value, "sizes")} />

    <TabbedExample nodes={steppedDemo} title={locale.value === "fr" ? "Pas personnalisé" : "Custom step"} />

    <TabbedExample nodes={disabledDemo} title={locale.value === "fr" ? "État désactivé" : "Disabled state"} />
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>value</code></td><td><code>[number, number]</code></td><td><em>{locale.value === "fr" ? "optionnel (contrôlé)" : "optional (controlled)"}</em></td></tr>
        <tr><td><code>defaultValue</code></td><td><code>[number, number]</code></td><td><code>[min, max]</code></td></tr>
        <tr><td><code>min</code></td><td><code>number</code></td><td><code>0</code></td></tr>
        <tr><td><code>max</code></td><td><code>number</code></td><td><code>100</code></td></tr>
        <tr><td><code>step</code></td><td><code>number</code></td><td><code>1</code></td></tr>
        <tr><td><code>size</code></td><td><code>"sm" | "md" | "lg"</code></td><td><code>"md"</code></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>helperText</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>errorText</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>invalid</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>showValue</code></td><td><code>boolean</code></td><td><code>true</code></td></tr>
        <tr><td><code>valueFormatter</code></td><td><code>(value: number) =&gt; string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>ariaLabelMin</code></td><td><code>string</code></td><td><code>"Valeur minimale"</code></td></tr>
        <tr><td><code>ariaLabelMax</code></td><td><code>string</code></td><td><code>"Valeur maximale"</code></td></tr>
        <tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>onChange</code> / <code>v-model</code></td><td><code>(value: [number, number]) =&gt; void</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{text().a11yTitle}</h2>
    <p class="docs-demo-note">{text().a11yNote}</p>
  </section>

  <section class="docs-section">
    <h2>{text().usageTitle}</h2>
    <p class="docs-demo-note">{text().usageNote1}</p>
    <p class="docs-demo-note">{text().usageNote2}</p>
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
    </ul>
  </section>
</div>
