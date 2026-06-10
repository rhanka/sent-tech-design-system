<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const copy = {
    fr: {
      kicker: "Composant · Données",
      badge: "Documenté",
      intro:
        "ErrorBarChart affiche, par catégorie, un marqueur au point central (moyenne ou mesure) et une moustache horizontale allant de la borne basse à la borne haute, terminée par un capuchon perpendiculaire à chaque extrémité. Idéal pour visualiser une estimation et son intervalle d'incertitude (écart-type, intervalle de confiance).",
      examplesTitle: "Exemples",
      basicTitle: "Intervalle de base",
      basicDesc: "Une moustache par catégorie de low à high, capuchons aux extrémités et marqueur au point central.",
      tonesTitle: "Teinte personnalisée",
      tonesDesc: "Passez `tone` pour changer la couleur de la moustache, des capuchons et du marqueur.",
      apiTitle: "API du composant",
      defaultLabel: "Par défaut",
      required: "requis",
      optional: "optionnel",
      a11yTitle: "Accessibilité",
      a11yNote:
        "`label` nomme le graphique. Chaque catégorie est résumée dans une liste accessible avec sa valeur centrale et ses bornes basse → haute.",
      usageTitle: "Notes d'usage",
      usageNote:
        "Fournissez `value` (point central), `low` et `high` par catégorie ; l'ordre des bornes est normalisé et la valeur centrale est contrainte entre low et high. Les catégories occupent l'axe vertical, les valeurs l'axe horizontal gradué.",
      tokensTitle: "Tokens"
    },
    en: {
      kicker: "Component · Data",
      badge: "Documented",
      intro:
        "ErrorBarChart shows, per category, a marker at the central value (mean or measure) and a horizontal whisker running from the low to the high bound, capped with a perpendicular tick at each end. Ideal for visualising an estimate and its uncertainty interval (standard deviation, confidence interval).",
      examplesTitle: "Examples",
      basicTitle: "Basic interval",
      basicDesc: "One whisker per category from low to high, capped at each end with a marker at the central value.",
      tonesTitle: "Custom tone",
      tonesDesc: "Pass `tone` to change the colour of the whisker, caps and marker.",
      apiTitle: "Component API",
      defaultLabel: "Default",
      required: "required",
      optional: "optional",
      a11yTitle: "Accessibility",
      a11yNote:
        "`label` names the chart. Each category is summarized in an accessible list with its central value and low → high bounds.",
      usageTitle: "Usage notes",
      usageNote:
        "Provide `value` (central point), `low` and `high` per category; bound order is normalized and the central value is clamped between low and high. Categories sit on the vertical axis, values on the graduated horizontal axis.",
      tokensTitle: "Tokens"
    }
  } as const;

  const text = () => copy[locale.value];

  const latencyData = [
    { category: "Amérique N.", value: 142, low: 118, high: 171 },
    { category: "Europe", value: 96, low: 81, high: 118 },
    { category: "Asie", value: 188, low: 152, high: 224 },
    { category: "Océanie", value: 210, low: 174, high: 251 },
    { category: "Afrique", value: 165, low: 130, high: 205 }
  ];

  const yieldData = [
    { category: "Lot A", value: 92, low: 88, high: 95 },
    { category: "Lot B", value: 84, low: 76, high: 90 },
    { category: "Lot C", value: 88, low: 82, high: 93 },
    { category: "Lot D", value: 79, low: 68, high: 86 }
  ];

  const basicDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "ErrorBarChart",
          props: {
            label:
              locale.value === "fr"
                ? "Temps de réponse moyen par région (± écart-type)"
                : "Mean response time by region (± std. dev.)",
            tone: "category2",
            data: latencyData
          }
        }
      ]
    }
  ]);

  const tonesDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "ErrorBarChart",
          props: {
            label:
              locale.value === "fr"
                ? "Rendement moyen par lot (intervalle de confiance)"
                : "Mean yield by batch (confidence interval)",
            tone: "category5",
            data: yieldData
          }
        }
      ]
    }
  ]);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{text().kicker}</p>
    <div class="docs-hero-title">
      <h1>ErrorBarChart</h1>
      <Badge tone="neutral">{text().badge}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>

  <section class="docs-section">
    <h2>{text().examplesTitle}</h2>

    <h3 class="docs-demo-title">{text().basicTitle}</h3>
    <p class="docs-demo-note">{text().basicDesc}</p>
    <TabbedExample nodes={basicDemo} title={text().basicTitle} />

    <h3 class="docs-demo-title">{text().tonesTitle}</h3>
    <p class="docs-demo-note">{text().tonesDesc}</p>
    <TabbedExample nodes={tonesDemo} title={text().tonesTitle} />
  </section>

  <section class="docs-section">
    <h2>{text().apiTitle}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>{text().defaultLabel}</th></tr>
      </thead>
      <tbody>
        <tr><td><code>data</code></td><td><code>ErrorBarChartDatum[]</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>tone</code></td><td><code>"category1" | ... | "category8"</code></td><td><code>"category1"</code></td></tr>
        <tr><td><code>width</code></td><td><code>number</code></td><td><code>480</code></td></tr>
        <tr><td><code>height</code></td><td><code>number</code></td><td><code>240</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{text().optional}</em></td></tr>
      </tbody>
    </table>

    <p class="docs-demo-note">
      <code>ErrorBarChartDatum</code> = <code>{`{ category: string; value: number; low: number; high: number }`}</code>
      ·
      <code>ErrorBarChartTone</code> = <code>"category1" | ... | "category8"</code>.
    </p>
  </section>

  <section class="docs-section">
    <h2>{text().a11yTitle}</h2>
    <p class="docs-demo-note">{text().a11yNote}</p>
  </section>

  <section class="docs-section">
    <h2>{text().usageTitle}</h2>
    <p class="docs-demo-note">{text().usageNote}</p>
  </section>

  <section class="docs-section">
    <h2>{text().tokensTitle}</h2>
    <ul class="docs-token-list">
      <li><code>--st-semantic-data-category1</code> ... <code>--st-semantic-data-category8</code></li>
      <li><code>--st-semantic-border-subtle</code></li>
      <li><code>--st-semantic-text-secondary</code></li>
      <li><code>--st-semantic-surface-default</code></li>
      <li><code>--st-semantic-surface-inverse</code></li>
      <li><code>--st-semantic-text-inverse</code></li>
    </ul>
  </section>
</div>

<style>
  .docs-demo-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.25rem 0;
    color: var(--st-semantic-text-primary);
  }

  :global(.chart-wrapper) {
    width: 100%;
    max-width: 560px;
    margin-top: 0.75rem;
  }
</style>
