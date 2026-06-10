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
        "DumbbellChart relie deux valeurs par catégorie : une ligne horizontale va de la valeur basse à la valeur haute, avec un cercle teinté à chaque extrémité. Idéal pour comparer deux mesures par catégorie : avant/après, objectif/réalisé, min/max.",
      examplesTitle: "Exemples",
      basicTitle: "Comparaison de base",
      basicDesc: "Une ligne par catégorie reliant low et high, cercle bas et cercle haut de teintes distinctes.",
      tonesTitle: "Teintes personnalisées",
      tonesDesc: "Passez `lowTone` / `highTone` pour changer les couleurs des cercles, et `lowLabel` / `highLabel` pour la légende.",
      apiTitle: "API du composant",
      defaultLabel: "Par défaut",
      required: "requis",
      optional: "optionnel",
      a11yTitle: "Accessibilité",
      a11yNote:
        "`label` nomme le graphique. Chaque catégorie est résumée dans une liste accessible avec son libellé et ses bornes basse → haute.",
      usageTitle: "Notes d'usage",
      usageNote:
        "Fournissez `low` et `high` par catégorie ; l'ordre est normalisé automatiquement. Les catégories occupent l'axe vertical, les valeurs l'axe horizontal gradué.",
      tokensTitle: "Tokens"
    },
    en: {
      kicker: "Component · Data",
      badge: "Documented",
      intro:
        "DumbbellChart links two values per category: a horizontal line runs from the low to the high value, with a coloured dot at each end. Ideal for comparing two measures per category: before/after, target/actual, min/max.",
      examplesTitle: "Examples",
      basicTitle: "Basic comparison",
      basicDesc: "One line per category linking low and high, with distinctly toned low and high dots.",
      tonesTitle: "Custom tones",
      tonesDesc: "Pass `lowTone` / `highTone` to change the dot colours, and `lowLabel` / `highLabel` for the legend.",
      apiTitle: "Component API",
      defaultLabel: "Default",
      required: "required",
      optional: "optional",
      a11yTitle: "Accessibility",
      a11yNote:
        "`label` names the chart. Each category is summarized in an accessible list with its label and low → high bounds.",
      usageTitle: "Usage notes",
      usageNote:
        "Provide `low` and `high` per category; order is normalized automatically. Categories sit on the vertical axis, values on the graduated horizontal axis.",
      tokensTitle: "Tokens"
    }
  } as const;

  const text = () => copy[locale.value];

  const salaryData = [
    { category: "Ingénierie", low: 62, high: 78 },
    { category: "Design", low: 54, high: 69 },
    { category: "Marketing", low: 48, high: 58 },
    { category: "Support", low: 41, high: 49 },
    { category: "Ventes", low: 50, high: 72 }
  ];

  const satisfactionData = [
    { category: "Produit A", low: 58, high: 81 },
    { category: "Produit B", low: 64, high: 73 },
    { category: "Produit C", low: 49, high: 88 },
    { category: "Produit D", low: 71, high: 79 }
  ];

  const basicDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "DumbbellChart",
          props: {
            label:
              locale.value === "fr"
                ? "Écart de salaire médian par service"
                : "Median salary gap by department",
            lowLabel: "2019",
            highLabel: "2024",
            data: salaryData
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
          comp: "DumbbellChart",
          props: {
            label:
              locale.value === "fr"
                ? "Satisfaction avant/après par produit"
                : "Before/after satisfaction by product",
            lowTone: "category3",
            highTone: "category5",
            lowLabel: locale.value === "fr" ? "Avant" : "Before",
            highLabel: locale.value === "fr" ? "Après" : "After",
            data: satisfactionData
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
      <h1>DumbbellChart</h1>
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
        <tr><td><code>data</code></td><td><code>DumbbellChartDatum[]</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>lowTone</code></td><td><code>"category1" | ... | "category8"</code></td><td><code>"category1"</code></td></tr>
        <tr><td><code>highTone</code></td><td><code>"category1" | ... | "category8"</code></td><td><code>"category2"</code></td></tr>
        <tr><td><code>lowLabel</code></td><td><code>string</code></td><td><code>"Bas"</code></td></tr>
        <tr><td><code>highLabel</code></td><td><code>string</code></td><td><code>"Haut"</code></td></tr>
        <tr><td><code>width</code></td><td><code>number</code></td><td><code>480</code></td></tr>
        <tr><td><code>height</code></td><td><code>number</code></td><td><code>240</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{text().optional}</em></td></tr>
      </tbody>
    </table>

    <p class="docs-demo-note">
      <code>DumbbellChartDatum</code> = <code>{`{ category: string; low: number; high: number }`}</code>
      ·
      <code>DumbbellChartTone</code> = <code>"category1" | ... | "category8"</code>.
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
      <li><code>--st-semantic-border-strong</code></li>
      <li><code>--st-semantic-text-secondary</code></li>
      <li><code>--st-semantic-surface-default</code></li>
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
