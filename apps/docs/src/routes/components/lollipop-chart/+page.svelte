<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const copy = {
    fr: {
      kicker: "Composant · Données",
      badge: "Documenté",
      previewTitle: "Aperçu live",
      intro:
        "LollipopChart représente une valeur par catégorie avec une tige fine surmontée d'une pastille. Plus léger qu'un histogramme à barres pleines, il met l'accent sur la valeur sans surcharger l'encre.",
      examplesTitle: "Exemples",
      verticalTitle: "Orientation verticale",
      verticalDesc: "Catégories en abscisse, tiges montantes vers la valeur.",
      horizontalTitle: "Orientation horizontale",
      horizontalDesc: "Pratique pour des libellés longs ou de nombreuses catégories.",
      apiTitle: "API du composant",
      defaultLabel: "Par défaut",
      required: "requis",
      optional: "optionnel",
      a11yTitle: "Accessibilité",
      a11yNote:
        "`label` nomme le graphique. Chaque point est résumé dans une liste accessible avec son libellé et sa valeur.",
      usageTitle: "Notes d'usage",
      usageNote:
        "Fournissez `domain` pour partager une même échelle entre plusieurs graphiques d'une grille. Sans domaine, l'échelle s'adapte aux données.",
      tokensTitle: "Tokens"
    },
    en: {
      kicker: "Component · Data",
      badge: "Documented",
      previewTitle: "Live preview",
      intro:
        "LollipopChart shows one value per category with a thin stem topped by a dot. Lighter than solid bars, it emphasizes the value while reducing chart ink.",
      examplesTitle: "Examples",
      verticalTitle: "Vertical orientation",
      verticalDesc: "Categories on the x-axis, stems rising to the value.",
      horizontalTitle: "Horizontal orientation",
      horizontalDesc: "Handy for long labels or many categories.",
      apiTitle: "Component API",
      defaultLabel: "Default",
      required: "required",
      optional: "optional",
      a11yTitle: "Accessibility",
      a11yNote:
        "`label` names the chart. Each point is summarized in an accessible list with its label and value.",
      usageTitle: "Usage notes",
      usageNote:
        "Pass `domain` to share one scale across a grid of charts. Without a domain, the scale adapts to the data.",
      tokensTitle: "Tokens"
    }
  } as const;

  const text = () => copy[locale.value];

  const teamData = [
    { label: "Design", value: 82, tone: "category1" },
    { label: "Ingénierie", value: 74, tone: "category2" },
    { label: "Produit", value: 61, tone: "category3" },
    { label: "Ventes", value: 48, tone: "category4" }
  ];

  const regionData = [
    { label: "Amérique du Nord", value: 64, tone: "category5" },
    { label: "Europe", value: 52, tone: "category6" },
    { label: "Asie-Pacifique", value: 38, tone: "category7" },
    { label: "Amérique latine", value: 21, tone: "category8" }
  ];

  const verticalDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "LollipopChart",
          props: {
            label: locale.value === "fr" ? "Score par équipe" : "Score by team",
            orientation: "vertical",
            data: teamData
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
          comp: "LollipopChart",
          props: {
            label: locale.value === "fr" ? "Adoption par région" : "Adoption by region",
            orientation: "horizontal",
            data: regionData
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
      <h1>LollipopChart</h1>
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
        <tr><td><code>data</code></td><td><code>LollipopChartDatum[]</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>orientation</code></td><td><code>"vertical" | "horizontal"</code></td><td><code>"vertical"</code></td></tr>
        <tr><td><code>domain</code></td><td><code>[number, number]</code></td><td><em>{text().optional}</em></td></tr>
        <tr><td><code>width</code></td><td><code>number</code></td><td><code>480</code></td></tr>
        <tr><td><code>height</code></td><td><code>number</code></td><td><code>240</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{text().optional}</em></td></tr>
      </tbody>
    </table>

    <p class="docs-demo-note">
      <code>LollipopChartDatum</code> = <code>{`{ label: string; value: number; tone?: LollipopChartTone }`}</code>
      ·
      <code>LollipopChartTone</code> = <code>"category1" | ... | "category8"</code>.
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
      <li><code>--st-semantic-text-primary</code></li>
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
