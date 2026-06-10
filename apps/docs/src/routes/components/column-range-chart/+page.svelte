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
        "ColumnRangeChart trace une barre allant d'une valeur basse à une valeur haute par catégorie. Idéal pour visualiser des intervalles : températures min/max, fourchettes de prix, plages de mesures.",
      examplesTitle: "Exemples",
      verticalTitle: "Orientation verticale",
      verticalDesc: "Catégories en abscisse, barres d'intervalle bas→haut sur l'axe des valeurs.",
      horizontalTitle: "Orientation horizontale",
      horizontalDesc: "Pratique pour des libellés longs ou de nombreuses catégories.",
      apiTitle: "API du composant",
      defaultLabel: "Par défaut",
      required: "requis",
      optional: "optionnel",
      a11yTitle: "Accessibilité",
      a11yNote:
        "`label` nomme le graphique. Chaque intervalle est résumé dans une liste accessible avec son libellé et ses bornes basse → haute.",
      usageTitle: "Notes d'usage",
      usageNote:
        "Fournissez `low` et `high` par catégorie ; l'ordre est normalisé automatiquement. Passez `domain` pour partager une même échelle entre plusieurs graphiques d'une grille.",
      tokensTitle: "Tokens"
    },
    en: {
      kicker: "Component · Data",
      badge: "Documented",
      intro:
        "ColumnRangeChart draws a bar spanning from a low to a high value per category. Ideal for intervals: min/max temperatures, price ranges, measurement spreads.",
      examplesTitle: "Examples",
      verticalTitle: "Vertical orientation",
      verticalDesc: "Categories on the x-axis, low→high range bars on the value axis.",
      horizontalTitle: "Horizontal orientation",
      horizontalDesc: "Handy for long labels or many categories.",
      apiTitle: "Component API",
      defaultLabel: "Default",
      required: "required",
      optional: "optional",
      a11yTitle: "Accessibility",
      a11yNote:
        "`label` names the chart. Each range is summarized in an accessible list with its label and low → high bounds.",
      usageTitle: "Usage notes",
      usageNote:
        "Provide `low` and `high` per category; order is normalized automatically. Pass `domain` to share one scale across a grid of charts.",
      tokensTitle: "Tokens"
    }
  } as const;

  const text = () => copy[locale.value];

  const monthData = [
    { category: "Jan", low: -4, high: 3, tone: "category1" },
    { category: "Avr", low: 5, high: 16, tone: "category2" },
    { category: "Juil", low: 15, high: 28, tone: "category3" },
    { category: "Oct", low: 7, high: 18, tone: "category4" }
  ];

  const priceData = [
    { category: "Studio", low: 720, high: 980, tone: "category5" },
    { category: "T2", low: 950, high: 1340, tone: "category6" },
    { category: "T3", low: 1180, high: 1720, tone: "category7" },
    { category: "T4", low: 1450, high: 2100, tone: "category8" }
  ];

  const verticalDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "ColumnRangeChart",
          props: {
            label:
              locale.value === "fr"
                ? "Températures min/max par mois"
                : "Min/max temperatures by month",
            orientation: "vertical",
            data: monthData
          }
        }
      ]
    }
  ]);

  const horizontalDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "ColumnRangeChart",
          props: {
            label:
              locale.value === "fr"
                ? "Fourchettes de loyer par type"
                : "Rent ranges by unit type",
            orientation: "horizontal",
            data: priceData
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
      <h1>ColumnRangeChart</h1>
      <Badge tone="neutral">{text().badge}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>

  <section class="docs-section">
    <h2>{text().examplesTitle}</h2>

    <h3 class="docs-demo-title">{text().verticalTitle}</h3>
    <p class="docs-demo-note">{text().verticalDesc}</p>
    <TabbedExample nodes={verticalDemo} title={text().verticalTitle} />

    <h3 class="docs-demo-title">{text().horizontalTitle}</h3>
    <p class="docs-demo-note">{text().horizontalDesc}</p>
    <TabbedExample nodes={horizontalDemo} title={text().horizontalTitle} />
  </section>

  <section class="docs-section">
    <h2>{text().apiTitle}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>{text().defaultLabel}</th></tr>
      </thead>
      <tbody>
        <tr><td><code>data</code></td><td><code>ColumnRangeChartDatum[]</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>orientation</code></td><td><code>"vertical" | "horizontal"</code></td><td><code>"vertical"</code></td></tr>
        <tr><td><code>domain</code></td><td><code>[number, number]</code></td><td><em>{text().optional}</em></td></tr>
        <tr><td><code>width</code></td><td><code>number</code></td><td><code>480</code></td></tr>
        <tr><td><code>height</code></td><td><code>number</code></td><td><code>240</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{text().optional}</em></td></tr>
      </tbody>
    </table>

    <p class="docs-demo-note">
      <code>ColumnRangeChartDatum</code> = <code>{`{ category: string; low: number; high: number; tone?: ColumnRangeChartTone }`}</code>
      ·
      <code>ColumnRangeChartTone</code> = <code>"category1" | ... | "category8"</code>.
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
