<script lang="ts">
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import FrameworkPreview from "$lib/framework/FrameworkPreview.svelte";
  import FrameworkDemo from "$lib/framework/FrameworkDemo.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const copy = {
    fr: {
      kicker: "Composant · Données",
      badge: "Documenté",
      previewTitle: "Aperçu live",
      intro:
        "MarimekkoChart (Mekko) est une matrice dont la largeur de chaque colonne est proportionnelle au poids de la catégorie, et dont la hauteur de chaque segment reflète sa part au sein de cette catégorie. Parfait pour combiner part de marché et mix produit.",
      examplesTitle: "Exemples",
      marketTitle: "Parts de marché par région",
      marketDesc: "Largeur = volume régional, hauteur = distribution des segments au sein de la région.",
      apiTitle: "API du composant",
      defaultLabel: "Par défaut",
      required: "requis",
      optional: "optionnel",
      a11yTitle: "Accessibilité",
      a11yNote:
        "`label` alimente le conteneur `role=\"img\"`. Chaque cellule expose sa catégorie, son segment, son pourcentage et la part de colonne dans une liste accessible hors SVG.",
      usageTitle: "Notes d'usage",
      usageNote:
        "Les valeurs de `segments[].value` sont normalisées en % de la colonne : vous pouvez fournir des valeurs brutes ou des pourcentages. Les `width` sont relatifs entre eux.",
      tokensTitle: "Tokens"
    },
    en: {
      kicker: "Component · Data",
      badge: "Documented",
      previewTitle: "Live preview",
      intro:
        "MarimekkoChart (Mekko) is a matrix where each column's width is proportional to the category's weight, and each segment's height reflects its share within that category. Perfect for combining market share and product mix.",
      examplesTitle: "Examples",
      marketTitle: "Market share by region",
      marketDesc: "Width = regional volume, height = segment distribution within the region.",
      apiTitle: "Component API",
      defaultLabel: "Default",
      required: "required",
      optional: "optional",
      a11yTitle: "Accessibility",
      a11yNote:
        "`label` feeds the `role=\"img\"` container. Each cell exposes its category, segment, percentage, and column share in an accessible list outside the SVG.",
      usageTitle: "Usage notes",
      usageNote:
        "`segments[].value` entries are normalised to a % of the column: you can supply raw values or percentages. `width` values are relative to each other.",
      tokensTitle: "Tokens"
    }
  } as const;

  const text = () => copy[locale.value];

  const marketData = [
    {
      label: "Europe",
      width: 45,
      segments: [
        { label: "PME", value: 55, tone: "category1" },
        { label: "Grands comptes", value: 30, tone: "category2" },
        { label: "Startups", value: 15, tone: "category3" }
      ]
    },
    {
      label: "Amérique",
      width: 35,
      segments: [
        { label: "PME", value: 40, tone: "category1" },
        { label: "Grands comptes", value: 50, tone: "category2" },
        { label: "Startups", value: 10, tone: "category3" }
      ]
    },
    {
      label: "Asie",
      width: 20,
      segments: [
        { label: "PME", value: 30, tone: "category1" },
        { label: "Grands comptes", value: 20, tone: "category2" },
        { label: "Startups", value: 50, tone: "category3" }
      ]
    }
  ];

  const marketDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "MarimekkoChart",
          props: {
            label: locale.value === "fr" ? "Parts de marché par segment" : "Market share by segment",
            data: marketData
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
      <h1>MarimekkoChart</h1>
      <Badge tone="neutral">{text().badge}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>

  <FrameworkPreview example="marimekkoChart" title={text().previewTitle} />

  <section class="docs-section">
    <h2>{text().examplesTitle}</h2>

    <h3 class="docs-demo-title">{text().marketTitle}</h3>
    <p class="docs-demo-note">{text().marketDesc}</p>
    <FrameworkDemo nodes={marketDemo} label={text().marketTitle} />
  </section>

  <section class="docs-section">
    <h2>{text().apiTitle}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>{text().defaultLabel}</th></tr>
      </thead>
      <tbody>
        <tr><td><code>data</code></td><td><code>MarimekkoChartDatum[]</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>width</code></td><td><code>number</code></td><td><code>480</code></td></tr>
        <tr><td><code>height</code></td><td><code>number</code></td><td><code>300</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{text().optional}</em></td></tr>
      </tbody>
    </table>

    <p class="docs-demo-note">
      <code>MarimekkoChartDatum</code> = <code>{`{ label: string; width: number; segments: MarimekkoChartSegment[] }`}</code>
      ·
      <code>MarimekkoChartSegment</code> = <code>{`{ label: string; value: number; tone?: MarimekkoChartTone }`}</code>
      ·
      <code>MarimekkoChartTone</code> = <code>"category1" | ... | "category8"</code>
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
      <li><code>--st-radius-sm</code></li>
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
