<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper" },
      children: [
        {
          comp: "WaterfallChart",
          props: {
            label:
              locale.value === "fr" ? "Résultat d'exploitation T3" : "Q3 Operating Result",
            data: [
              {
                label: locale.value === "fr" ? "Début" : "Start",
                value: 50000,
                type: "total"
              },
              {
                label:
                  locale.value === "fr" ? "Revenus abonnements" : "Subscription revenue",
                value: 32000,
                type: "increase"
              },
              {
                label: locale.value === "fr" ? "Revenus services" : "Services revenue",
                value: 14500,
                type: "increase"
              },
              {
                label: locale.value === "fr" ? "Coûts infra" : "Infra costs",
                value: -18000,
                type: "decrease"
              },
              {
                label: locale.value === "fr" ? "Salaires" : "Salaries",
                value: -22000,
                type: "decrease"
              },
              {
                label: locale.value === "fr" ? "Marketing" : "Marketing",
                value: -8500,
                type: "decrease"
              },
              {
                label: locale.value === "fr" ? "Résultat net" : "Net result",
                value: 48000,
                type: "total"
              }
            ],
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
      <h1>WaterfallChart</h1>
      <Badge tone="success">{locale.value === "fr" ? "Stable" : "Stable"}</Badge>
    </div>
    <p>
      {#if locale.value === "fr"}
        Graphique en cascade (waterfall) pour visualiser les contributions positives et négatives
        à un total cumulatif. Les barres flottantes représentent des augmentations
        (<code>increase</code>), des diminutions (<code>decrease</code>) ou des totaux
        ancrés en bas (<code>total</code>). Des connecteurs optionnels relient les barres.
      {:else}
        Waterfall chart to visualize positive and negative contributions to a cumulative total.
        Floating bars represent increases (<code>increase</code>), decreases
        (<code>decrease</code>), or anchored totals (<code>total</code>). Optional connectors
        link consecutive bars.
      {/if}
    </p>
  </section>


  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Exemples" : "Examples"}</h2>
    <p class="section-desc">
      {#if locale.value === "fr"}
        Résultat d'exploitation T3 : solde initial, revenus positifs (abonnements + services)
        et charges négatives (infra, salaires, marketing) conduisant au résultat net final.
      {:else}
        Q3 operating result: opening balance, positive revenues (subscriptions + services),
        and negative charges (infra, salaries, marketing) leading to the final net result.
      {/if}
    </p>
    <TabbedExample
      nodes={demoNodes}
      title={locale.value === "fr" ? "Résultat d'exploitation T3" : "Q3 Operating Result"}
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
          <td><code>WaterfallChartDatum[]</code></td>
          <td><em>{locale.value === "fr" ? "requis" : "required"}</em></td>
          <td>{locale.value === "fr" ? "Tableau des éléments de la cascade." : "Array of waterfall items."}</td>
        </tr>
        <tr>
          <td><code>label</code></td>
          <td><code>string</code></td>
          <td><em>{locale.value === "fr" ? "requis" : "required"}</em></td>
          <td>{locale.value === "fr" ? "Label aria-label du graphique (a11y)." : "Chart aria-label (a11y)."}</td>
        </tr>
        <tr>
          <td><code>connectors</code></td>
          <td><code>boolean</code></td>
          <td><code>true</code></td>
          <td>{locale.value === "fr" ? "Affiche les lignes pointillées de connexion entre barres." : "Show dashed connector lines between bars."}</td>
        </tr>
        <tr>
          <td><code>format</code></td>
          <td><code>(value: number) =&gt; string</code></td>
          <td>–</td>
          <td>{locale.value === "fr" ? "Fonction de formatage personnalisée des valeurs." : "Custom value formatting function."}</td>
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
      {locale.value === "fr"
        ? "WaterfallChartDatum = { label: string; value: number; type?: 'increase' | 'decrease' | 'total' } : type déduit du signe si absent"
        : "WaterfallChartDatum = { label: string; value: number; type?: 'increase' | 'decrease' | 'total' } : type inferred from sign if absent"}
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
          <td><code>--st-component-waterfallChart-increaseColor</code></td>
          <td>{locale.value === "fr" ? "Couleur des barres d'augmentation (défaut : feedback-success)." : "Increase bar color (default: feedback-success)."}</td>
        </tr>
        <tr>
          <td><code>--st-component-waterfallChart-decreaseColor</code></td>
          <td>{locale.value === "fr" ? "Couleur des barres de diminution (défaut : feedback-error)." : "Decrease bar color (default: feedback-error)."}</td>
        </tr>
        <tr>
          <td><code>--st-component-waterfallChart-totalColor</code></td>
          <td>{locale.value === "fr" ? "Couleur des barres de total (défaut : data-category1)." : "Total bar color (default: data-category1)."}</td>
        </tr>
        <tr>
          <td><code>--st-component-waterfallChart-connectorStroke</code></td>
          <td>{locale.value === "fr" ? "Couleur des connecteurs pointillés." : "Dashed connector stroke color."}</td>
        </tr>
        <tr>
          <td><code>--st-component-waterfallChart-gridStroke</code></td>
          <td>{locale.value === "fr" ? "Couleur des lignes de grille." : "Grid line stroke color."}</td>
        </tr>
        <tr>
          <td><code>--st-component-waterfallChart-labelColor</code></td>
          <td>{locale.value === "fr" ? "Couleur des étiquettes d'axe." : "Axis label color."}</td>
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
