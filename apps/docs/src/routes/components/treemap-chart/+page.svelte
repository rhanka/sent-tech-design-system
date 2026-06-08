<script lang="ts">
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import FrameworkPreview from "$lib/framework/FrameworkPreview.svelte";
  import FrameworkDemo from "$lib/framework/FrameworkDemo.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "TreemapChart",
          props: {
            label:
              locale.value === "fr"
                ? "Répartition du budget par département"
                : "Budget distribution by department",
            data: [
              {
                label: locale.value === "fr" ? "Ingénierie" : "Engineering",
                value: 0,
                tone: "category1",
                children: [
                  { label: "Frontend", value: 42000 },
                  { label: "Backend", value: 58000 },
                  { label: locale.value === "fr" ? "Infra" : "Infra", value: 31000 }
                ]
              },
              {
                label: locale.value === "fr" ? "Produit" : "Product",
                value: 0,
                tone: "category2",
                children: [
                  { label: "Design", value: 27000 },
                  { label: "PM", value: 22000 }
                ]
              },
              {
                label: locale.value === "fr" ? "Marketing" : "Marketing",
                value: 0,
                tone: "category3",
                children: [
                  { label: "Growth", value: 18000 },
                  { label: locale.value === "fr" ? "Contenu" : "Content", value: 12000 }
                ]
              }
            ],
            showLabels: true,
            width: 520,
            height: 320
          }
        }
      ]
    }
  ]);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">
      {locale.value === "fr" ? "Composant · Données" : "Component · Data"}
    </p>
    <div class="docs-hero-title">
      <h1>TreemapChart</h1>
      <Badge tone="success">{locale.value === "fr" ? "Stable" : "Stable"}</Badge>
    </div>
    <p>
      {#if locale.value === "fr"}
        Carte proportionnelle hiérarchique (algorithme squarified de Bruls, Huizing et van Wijk)
        prenant en charge 1 ou 2 niveaux. Les rectangles sont dimensionnés proportionnellement
        à leur valeur, colorés par la palette catégorielle du thème. Labels dans les rectangles
        suffisamment grands, tooltip au survol et liste de valeurs accessible.
      {:else}
        Hierarchical proportional map (Bruls, Huizing &amp; van Wijk squarified algorithm)
        supporting 1 or 2 levels. Rectangles are sized proportionally to their value and colored
        by the theme's categorical palette. Labels appear in sufficiently large rectangles, with
        a hover tooltip and accessible value list.
      {/if}
    </p>
  </section>

  <FrameworkPreview example="treemapchart" title={locale.value === "fr" ? "Aperçu live" : "Live preview"} />

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Exemples" : "Examples"}</h2>
    <p class="section-desc">
      {#if locale.value === "fr"}
        Budget à 2 niveaux : 3 départements (Ingénierie, Produit, Marketing) subdivisés en
        équipes. La couleur de ton par département facilite la lecture de la hiérarchie.
      {:else}
        2-level budget: 3 departments (Engineering, Product, Marketing) subdivided into teams.
        Per-department tone colors make the hierarchy easy to read.
      {/if}
    </p>
    <FrameworkDemo
      nodes={demoNodes}
      label={locale.value === "fr"
        ? "Répartition du budget par département"
        : "Budget distribution by department"}
    />
  </section>

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "API du composant" : "Component API"}</h2>
    <table class="docs-table">
      <thead>
        <tr>
          <th>Prop</th>
          <th>Type</th>
          <th>{locale.value === "fr" ? "Défaut" : "Default"}</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>data</code></td>
          <td><code>TreemapChartDatum[]</code></td>
          <td><em>{locale.value === "fr" ? "requis" : "required"}</em></td>
          <td>{locale.value === "fr" ? "Données hiérarchiques (1 ou 2 niveaux)." : "Hierarchical data (1 or 2 levels)."}</td>
        </tr>
        <tr>
          <td><code>label</code></td>
          <td><code>string</code></td>
          <td><em>{locale.value === "fr" ? "requis" : "required"}</em></td>
          <td>{locale.value === "fr" ? "Label aria-label du graphique (a11y)." : "Chart aria-label (a11y)."}</td>
        </tr>
        <tr>
          <td><code>tiling</code></td>
          <td><code>"squarified"</code></td>
          <td><code>"squarified"</code></td>
          <td>{locale.value === "fr" ? "Algorithme de pavage (squarified uniquement)." : "Tiling algorithm (squarified only)."}</td>
        </tr>
        <tr>
          <td><code>showLabels</code></td>
          <td><code>boolean</code></td>
          <td><code>true</code></td>
          <td>{locale.value === "fr" ? "Affiche les labels dans les rectangles suffisamment grands." : "Show labels in sufficiently large rectangles."}</td>
        </tr>
        <tr>
          <td><code>legend</code></td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
          <td>{locale.value === "fr" ? "Affiche une légende sous le graphique." : "Show a legend below the chart."}</td>
        </tr>
        <tr>
          <td><code>width</code></td>
          <td><code>number</code></td>
          <td><code>480</code></td>
          <td>{locale.value === "fr" ? "Largeur du viewBox SVG." : "SVG viewBox width."}</td>
        </tr>
        <tr>
          <td><code>height</code></td>
          <td><code>number</code></td>
          <td><code>300</code></td>
          <td>{locale.value === "fr" ? "Hauteur du viewBox SVG." : "SVG viewBox height."}</td>
        </tr>
      </tbody>
    </table>
    <p class="docs-demo-note">
      {locale.value === "fr"
        ? "TreemapChartDatum = { label: string; value: number; tone?: TreemapChartTone; children?: TreemapChartDatum[] }"
        : "TreemapChartDatum = { label: string; value: number; tone?: TreemapChartTone; children?: TreemapChartDatum[] }"}
    </p>
  </section>

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Tokens CSS" : "CSS Tokens"}</h2>
    <table class="docs-table">
      <thead>
        <tr>
          <th>{locale.value === "fr" ? "Variable CSS" : "CSS Variable"}</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>--st-semantic-data-category1…8</code></td>
          <td>{locale.value === "fr" ? "Palette catégorielle pour les rectangles." : "Categorical palette for treemap rectangles."}</td>
        </tr>
        <tr>
          <td><code>--st-component-treemapChart-labelColor</code></td>
          <td>{locale.value === "fr" ? "Couleur de repli des labels (remplacée par contraste calculé)." : "Fallback label color (overridden by computed contrast)."}</td>
        </tr>
        <tr>
          <td><code>--st-component-treemapChart-tooltipBackground</code></td>
          <td>{locale.value === "fr" ? "Fond du tooltip de survol." : "Hover tooltip background."}</td>
        </tr>
        <tr>
          <td><code>--st-component-treemapChart-tooltipText</code></td>
          <td>{locale.value === "fr" ? "Texte du tooltip." : "Tooltip text color."}</td>
        </tr>
      </tbody>
    </table>
  </section>
</div>

<style>
  .section-desc {
    color: var(--st-semantic-text-secondary);
    font-size: 1rem;
    line-height: 1.5;
    margin-bottom: 1.5rem;
    max-width: 800px;
  }

  .docs-demo-note {
    color: var(--st-semantic-text-secondary);
    font-size: 0.875rem;
    margin-top: 0.75rem;
  }

  :global(.chart-wrapper) {
    width: 100%;
    max-width: 560px;
    margin-top: 0.75rem;
  }
</style>
