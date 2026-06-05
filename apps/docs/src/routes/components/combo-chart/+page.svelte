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
          comp: "ComboChart",
          props: {
            label: locale.value === "fr" ? "Ventes et marge par trimestre" : "Sales and margin by quarter",
            categories: ["T1", "T2", "T3", "T4"],
            bars: [
              { label: locale.value === "fr" ? "Ventes (k$)" : "Sales (k$)", data: [120, 145, 160, 190], tone: "category1" },
              { label: locale.value === "fr" ? "Coûts (k$)" : "Costs (k$)", data: [80, 95, 105, 120], tone: "category3" }
            ],
            lines: [
              { label: locale.value === "fr" ? "Marge (%)" : "Margin (%)", data: [33, 34, 34, 37], tone: "category5", smooth: true }
            ],
            leftAxisLabel: "k$",
            rightAxisLabel: "%",
            legend: true,
            width: 520,
            height: 280
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
      <h1>ComboChart</h1>
      <Badge tone="success">{locale.value === "fr" ? "Stable" : "Stable"}</Badge>
    </div>
    <p>
      {#if locale.value === "fr"}
        Graphique combiné barres + courbes avec double axe Y indépendant. Les barres sont
        regroupées par catégorie (axe gauche) ; les courbes superposées utilisent l'axe droit.
        Légende, tooltip au survol et liste de valeurs accessible inclus.
      {:else}
        Combined bar and line chart with independent dual Y axes. Bars are grouped by category
        (left axis); overlaid lines use the right axis. Legend, hover tooltip, and accessible
        value list included.
      {/if}
    </p>
  </section>

  <FrameworkPreview example="combochart" title={locale.value === "fr" ? "Aperçu live" : "Live preview"} />

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Exemples" : "Examples"}</h2>
    <p class="section-desc">
      {#if locale.value === "fr"}
        Ventes et coûts trimestriels en barres groupées (axe gauche k$) superposés à la courbe
        de marge en pourcentage (axe droit). Lissage Bézier activé sur la courbe.
      {:else}
        Quarterly sales and costs as grouped bars (left axis, k$) overlaid with a smooth margin
        percentage line (right axis). Bezier smoothing enabled on the line.
      {/if}
    </p>
    <FrameworkDemo
      nodes={demoNodes}
      label={locale.value === "fr" ? "Ventes et marge par trimestre" : "Sales and margin by quarter"}
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
          <td><code>categories</code></td>
          <td><code>string[]</code></td>
          <td><em>{locale.value === "fr" ? "requis" : "required"}</em></td>
          <td>{locale.value === "fr" ? "Labels des catégories (axe X ordinale)." : "Category labels (ordinal X axis)."}</td>
        </tr>
        <tr>
          <td><code>label</code></td>
          <td><code>string</code></td>
          <td><em>{locale.value === "fr" ? "requis" : "required"}</em></td>
          <td>{locale.value === "fr" ? "Label aria-label du graphique (a11y)." : "Chart aria-label (a11y)."}</td>
        </tr>
        <tr>
          <td><code>bars</code></td>
          <td><code>ComboChartBarSeries[]</code></td>
          <td><code>[]</code></td>
          <td>{locale.value === "fr" ? "Séries de barres groupées (axe gauche)." : "Grouped bar series (left axis)."}</td>
        </tr>
        <tr>
          <td><code>lines</code></td>
          <td><code>ComboChartLineSeries[]</code></td>
          <td><code>[]</code></td>
          <td>{locale.value === "fr" ? "Séries de courbes superposées (axe droit)." : "Overlaid line series (right axis)."}</td>
        </tr>
        <tr>
          <td><code>leftAxisLabel</code></td>
          <td><code>string</code></td>
          <td>—</td>
          <td>{locale.value === "fr" ? "Label de l'axe Y gauche (barres)." : "Left Y axis label (bars)."}</td>
        </tr>
        <tr>
          <td><code>rightAxisLabel</code></td>
          <td><code>string</code></td>
          <td>—</td>
          <td>{locale.value === "fr" ? "Label de l'axe Y droit (courbes)." : "Right Y axis label (lines)."}</td>
        </tr>
        <tr>
          <td><code>legend</code></td>
          <td><code>boolean</code></td>
          <td><code>true</code></td>
          <td>{locale.value === "fr" ? "Affiche la légende des séries." : "Show the series legend."}</td>
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
          <td><code>240</code></td>
          <td>{locale.value === "fr" ? "Hauteur du viewBox SVG." : "SVG viewBox height."}</td>
        </tr>
      </tbody>
    </table>
    <p class="docs-demo-note">
      {#if locale.value === "fr"}
        <code>ComboChartBarSeries</code> = <code>{`{ label, data: number[], tone? }`}</code> ·
        <code>ComboChartLineSeries</code> = <code>{`{ label, data: number[], tone?, smooth? }`}</code>
      {:else}
        <code>ComboChartBarSeries</code> = <code>{`{ label, data: number[], tone? }`}</code> ·
        <code>ComboChartLineSeries</code> = <code>{`{ label, data: number[], tone?, smooth? }`}</code>
      {/if}
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
          <td><code>--st-component-comboChart-gridStroke</code></td>
          <td>{locale.value === "fr" ? "Couleur des lignes de grille (défaut : border-subtle)." : "Grid line color (default: border-subtle)."}</td>
        </tr>
        <tr>
          <td><code>--st-component-comboChart-axisStroke</code></td>
          <td>{locale.value === "fr" ? "Couleur des axes." : "Axis line color."}</td>
        </tr>
        <tr>
          <td><code>--st-component-comboChart-labelColor</code></td>
          <td>{locale.value === "fr" ? "Couleur des étiquettes d'axe." : "Axis label color."}</td>
        </tr>
        <tr>
          <td><code>--st-component-comboChart-tooltipBackground</code></td>
          <td>{locale.value === "fr" ? "Fond du tooltip." : "Tooltip background."}</td>
        </tr>
        <tr>
          <td><code>--st-component-comboChart-tooltipText</code></td>
          <td>{locale.value === "fr" ? "Texte du tooltip." : "Tooltip text color."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-data-category1…8</code></td>
          <td>{locale.value === "fr" ? "Palette catégorielle pour barres et courbes." : "Categorical palette for bars and lines."}</td>
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
