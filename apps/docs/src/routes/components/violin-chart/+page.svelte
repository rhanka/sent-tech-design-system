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
        "ViolinChart trace la densité de distribution de chaque catégorie sous forme de violon symétrique (miroir gauche/droite). L'échelle Y est commune à toutes les catégories pour permettre la comparaison.",
      examplesTitle: "Exemples",
      basicTitle: "Comparaison de distributions",
      basicDesc: "Un violon par catégorie ; la largeur reflète la densité de points à chaque hauteur.",
      quartilesTitle: "Sans quartiles",
      quartilesDesc: "`quartiles={false}` masque la boîte q1–q3 et le trait médian pour ne garder que la forme.",
      apiTitle: "API du composant",
      defaultLabel: "Par défaut",
      required: "requis",
      optional: "optionnel",
      a11yTitle: "Accessibilité",
      a11yNote:
        "`label` nomme le graphique (role=img). Chaque catégorie est résumée (n points, min/médiane/max) dans une liste accessible hors SVG.",
      usageTitle: "Notes d'usage",
      usageNote:
        "La densité utilise un histogramme (~20 bins) normalisé par violon : on compare des FORMES, pas des volumes. Les valeurs non finies sont exclues ; une catégorie vide est ignorée.",
      tokensTitle: "Tokens"
    },
    en: {
      kicker: "Component · Data",
      badge: "Documented",
      previewTitle: "Live preview",
      intro:
        "ViolinChart draws each category's distribution density as a symmetric (left/right mirrored) violin. The Y scale is shared across all categories for comparison.",
      examplesTitle: "Examples",
      basicTitle: "Comparing distributions",
      basicDesc: "One violin per category; width reflects the point density at each height.",
      quartilesTitle: "Without quartiles",
      quartilesDesc: "`quartiles={false}` hides the q1–q3 box and median line, keeping only the shape.",
      apiTitle: "Component API",
      defaultLabel: "Default",
      required: "required",
      optional: "optional",
      a11yTitle: "Accessibility",
      a11yNote:
        "`label` names the chart (role=img). Each category is summarized (n points, min/median/max) in an accessible list outside the SVG.",
      usageTitle: "Usage notes",
      usageNote:
        "Density uses a histogram (~20 bins) normalized per violin: you compare SHAPES, not volumes. Non-finite values are excluded; an empty category is skipped.",
      tokensTitle: "Tokens"
    }
  } as const;

  const text = () => copy[locale.value];

  const basicDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "ViolinChart",
          props: {
            label: locale.value === "fr" ? "Distribution de latence" : "Latency distribution",
            data: [
              { label: "API", values: [10, 12, 14, 18, 20, 22, 28, 30, 31, 33] },
              { label: "Jobs", values: [5, 8, 9, 11, 12, 15, 18, 40], tone: "category4" }
            ]
          }
        }
      ]
    }
  ]);

  const noQuartilesDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "ViolinChart",
          props: {
            label: locale.value === "fr" ? "Forme seule" : "Shape only",
            quartiles: false,
            data: [
              { label: "A", values: [1, 2, 2, 3, 3, 3, 4, 4, 5] },
              { label: "B", values: [2, 4, 6, 6, 6, 8, 10], tone: "category6" }
            ]
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
      <h1>ViolinChart</h1>
      <Badge tone="neutral">{text().badge}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>

  <FrameworkPreview example="violinchart" title={text().previewTitle} />

  <section class="docs-section">
    <h2>{text().examplesTitle}</h2>

    <h3 class="docs-demo-title">{text().basicTitle}</h3>
    <p class="docs-demo-note">{text().basicDesc}</p>
    <FrameworkDemo nodes={basicDemo} label={text().basicTitle} />

    <h3 class="docs-demo-title">{text().quartilesTitle}</h3>
    <p class="docs-demo-note">{text().quartilesDesc}</p>
    <FrameworkDemo nodes={noQuartilesDemo} label={text().quartilesTitle} />
  </section>

  <section class="docs-section">
    <h2>{text().apiTitle}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>{text().defaultLabel}</th></tr>
      </thead>
      <tbody>
        <tr><td><code>data</code></td><td><code>ViolinChartDatum[]</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>bins</code></td><td><code>number</code></td><td><code>20</code></td></tr>
        <tr><td><code>quartiles</code></td><td><code>boolean</code></td><td><code>true</code></td></tr>
        <tr><td><code>width</code></td><td><code>number</code></td><td><code>480</code></td></tr>
        <tr><td><code>height</code></td><td><code>number</code></td><td><code>280</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{text().optional}</em></td></tr>
      </tbody>
    </table>

    <p class="docs-demo-note">
      <code>ViolinChartDatum</code> = <code>{`{ label: string; values: number[]; tone?: ViolinChartTone }`}</code>
      ·
      <code>ViolinChartTone</code> = <code>"category1" | ... | "category8"</code>.
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
      <li><code>--st-semantic-surface-default</code></li>
      <li><code>--st-semantic-text-primary</code></li>
      <li><code>--st-semantic-text-secondary</code></li>
      <li><code>--st-semantic-surface-inverse</code></li>
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
