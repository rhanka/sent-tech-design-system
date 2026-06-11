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
        "TileMapChart (carte en tuiles / cartogramme « tilemap ») pose une grille de cellules carrées à des coordonnées (col, row) explicites, chacune colorée selon sa valeur sur une échelle séquentielle min→max. Idéal pour un cartogramme où chaque région occupe une case de taille égale, indépendamment de sa surface géographique réelle.",
      examplesTitle: "Exemples",
      basicTitle: "Cartogramme régional",
      basicDesc:
        "Chaque province occupe une tuile de même taille, positionnée pour rappeler sa place géographique ; la couleur encode la métrique (ici un indice).",
      denseTitle: "Grille dense",
      denseDesc:
        "La taille des tuiles s'adapte automatiquement au nombre de colonnes et de lignes pour ne jamais déborder du cadre.",
      apiTitle: "API du composant",
      defaultLabel: "Par défaut",
      required: "requis",
      optional: "optionnel",
      a11yTitle: "Accessibilité",
      a11yNote:
        "`label` nomme le graphique (role=img). Les libellés et valeurs sont rendus dans une liste accessible hors SVG. Le libellé court est posé au centre de chaque tuile assez grande.",
      usageTitle: "Notes d'usage",
      usageNote:
        "Idéal pour un cartogramme à cases égales (régions, états) ou toute grille où la position porte un sens. Les tuiles dont col, row ou value est non finie sont ignorées.",
      tokensTitle: "Tokens"
    },
    en: {
      kicker: "Component · Data",
      badge: "Documented",
      intro:
        "TileMapChart (tile map / “tilemap” cartogram) lays out a grid of square cells at explicit (col, row) coordinates, each colored by its value on a sequential min→max scale. Ideal for a cartogram where every region occupies an equal-size cell, regardless of its real geographic area.",
      examplesTitle: "Examples",
      basicTitle: "Regional cartogram",
      basicDesc:
        "Each province occupies a same-size tile, positioned to echo its geographic place; color encodes the metric (an index here).",
      denseTitle: "Dense grid",
      denseDesc:
        "Tile size adapts automatically to the number of columns and rows so the grid never overflows the frame.",
      apiTitle: "Component API",
      defaultLabel: "Default",
      required: "required",
      optional: "optional",
      a11yTitle: "Accessibility",
      a11yNote:
        "`label` names the chart (role=img). Labels and values are rendered in an accessible list outside the SVG. A short label is placed at the center of each large-enough tile.",
      usageTitle: "Usage notes",
      usageNote:
        "Great for an equal-cell cartogram (regions, states) or any grid where position carries meaning. Tiles with non-finite col, row or value are ignored.",
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
          comp: "TileMapChart",
          props: {
            label: locale.value === "fr" ? "Indice par province" : "Index by province",
            data: [
              { label: "BC", col: 0, row: 1, value: 42 },
              { label: "AB", col: 1, row: 1, value: 58 },
              { label: "SK", col: 2, row: 1, value: 35 },
              { label: "MB", col: 3, row: 1, value: 49 },
              { label: "ON", col: 4, row: 1, value: 88 },
              { label: "QC", col: 5, row: 1, value: 76 },
              { label: "NB", col: 6, row: 1, value: 31 },
              { label: "NS", col: 6, row: 2, value: 40 }
            ]
          }
        }
      ]
    }
  ]);

  const denseDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "TileMapChart",
          props: {
            label: locale.value === "fr" ? "Grille 4×3" : "4×3 grid",
            data: [
              { label: "A1", col: 0, row: 0, value: 12 },
              { label: "B1", col: 1, row: 0, value: 30 },
              { label: "C1", col: 2, row: 0, value: 48 },
              { label: "D1", col: 3, row: 0, value: 64 },
              { label: "A2", col: 0, row: 1, value: 22 },
              { label: "B2", col: 1, row: 1, value: 55 },
              { label: "C2", col: 2, row: 1, value: 71 },
              { label: "D2", col: 3, row: 1, value: 90 },
              { label: "A3", col: 0, row: 2, value: 8 },
              { label: "B3", col: 1, row: 2, value: 40 },
              { label: "C3", col: 2, row: 2, value: 60 },
              { label: "D3", col: 3, row: 2, value: 84 }
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
      <h1>TileMapChart</h1>
      <Badge tone="neutral">{text().badge}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>

  <section class="docs-section">
    <h2>{text().examplesTitle}</h2>

    <h3 class="docs-demo-title">{text().basicTitle}</h3>
    <p class="docs-demo-note">{text().basicDesc}</p>
    <TabbedExample nodes={basicDemo} title={text().basicTitle} />

    <h3 class="docs-demo-title">{text().denseTitle}</h3>
    <p class="docs-demo-note">{text().denseDesc}</p>
    <TabbedExample nodes={denseDemo} title={text().denseTitle} />
  </section>

  <section class="docs-section">
    <h2>{text().apiTitle}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>{text().defaultLabel}</th></tr>
      </thead>
      <tbody>
        <tr><td><code>data</code></td><td><code>TileMapChartTile[]</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>width</code></td><td><code>number</code></td><td><code>480</code></td></tr>
        <tr><td><code>height</code></td><td><code>number</code></td><td><code>360</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{text().optional}</em></td></tr>
      </tbody>
    </table>

    <p class="docs-demo-note">
      <code>TileMapChartTile</code> = <code>{`{ label: string; col: number; row: number; value: number }`}</code>.
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
      <li><code>--st-semantic-surface-default</code></li>
      <li><code>--st-semantic-text-secondary</code></li>
      <li><code>--st-semantic-text-inverse</code></li>
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
