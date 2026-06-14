<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const demoNodes = $derived<NodeSpec[]>([
    {
      comp: "RibbonChart",
      props: {
        label: locale.value === "fr" ? "Rang des produits" : "Product ranking",
        width: 560,
        height: 280,
        data: [
          { category: locale.value === "fr" ? "Carte" : "Card", period: "T1", value: 42 },
          { category: locale.value === "fr" ? "Virement" : "Transfer", period: "T1", value: 30 },
          { category: locale.value === "fr" ? "Portefeuille" : "Wallet", period: "T1", value: 18 },
          { category: locale.value === "fr" ? "Carte" : "Card", period: "T2", value: 35 },
          { category: locale.value === "fr" ? "Virement" : "Transfer", period: "T2", value: 41 },
          { category: locale.value === "fr" ? "Portefeuille" : "Wallet", period: "T2", value: 24 },
          { category: locale.value === "fr" ? "Carte" : "Card", period: "T3", value: 28 },
          { category: locale.value === "fr" ? "Virement" : "Transfer", period: "T3", value: 33 },
          { category: locale.value === "fr" ? "Portefeuille" : "Wallet", period: "T3", value: 45 }
        ]
      }
    }
  ]);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">
      {locale.value === "fr" ? "Composant · Données" : "Component · Data"}
    </p>
    <div class="docs-hero-title">
      <h1>RibbonChart</h1>
      <Badge tone="success">{locale.value === "fr" ? "Stable" : "Stable"}</Badge>
    </div>
    <p>
      {#if locale.value === "fr"}
        Rang empilé à rubans dans le temps (façon Power BI « ribbon chart »). Par période, les
        catégories sont empilées (hauteur = <code>value</code>) et TRIÉES par valeur (la plus grande
        au pied) ; des RUBANS lissés relient la même <code>category</code> d'une période à la
        suivante, matérialisant le flux de rang. Couleur stable par catégorie (<code>tone</code>
        explicite, sinon category1…8). Légende des catégories sous le graphe.
      {:else}
        Stacked ribbon ranking over time (Power BI ribbon-chart style). Per period, categories are
        stacked (height = <code>value</code>) and SORTED by value (largest at the foot); smoothed
        RIBBONS link the same <code>category</code> from one period to the next, materializing the
        rank flow. Stable color per category (explicit <code>tone</code>, otherwise category1…8). A
        category legend sits below the chart.
      {/if}
    </p>
  </section>


  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Exemples" : "Examples"}</h2>
    <p class="section-desc">
      {#if locale.value === "fr"}
        Trois moyens de paiement sur trois trimestres : l'empilement reclasse à chaque période et les
        rubans suivent la montée du portefeuille.
      {:else}
        Three payment methods across three quarters: the stack re-ranks each period and ribbons
        track the wallet's rise.
      {/if}
    </p>
    <TabbedExample
      nodes={demoNodes}
      title={locale.value === "fr" ? "Rang des produits" : "Product ranking"}
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
          <td><code>RibbonChartDatum[]</code></td>
          <td><code>[]</code></td>
          <td>{locale.value === "fr" ? "Points : { category, period, value, tone? }." : "Points: { category, period, value, tone? }."}</td>
        </tr>
        <tr>
          <td><code>label</code></td>
          <td><code>string</code></td>
          <td>–</td>
          <td>{locale.value === "fr" ? "Libellé accessible du graphe." : "Accessible chart label."}</td>
        </tr>
        <tr>
          <td><code>width</code></td>
          <td><code>number</code></td>
          <td><code>520</code></td>
          <td>{locale.value === "fr" ? "Largeur du viewBox SVG." : "SVG viewBox width."}</td>
        </tr>
        <tr>
          <td><code>height</code></td>
          <td><code>number</code></td>
          <td><code>300</code></td>
          <td>{locale.value === "fr" ? "Hauteur du viewBox SVG." : "SVG viewBox height."}</td>
        </tr>
        <tr>
          <td><code>size</code></td>
          <td><code>number</code></td>
          <td>–</td>
          <td>{locale.value === "fr" ? "Alias de width (largeur du viewBox)." : "Alias of width (viewBox width)."}</td>
        </tr>
        <tr>
          <td><code>class</code></td>
          <td><code>string</code></td>
          <td>–</td>
          <td>{locale.value === "fr" ? "Classe CSS supplémentaire sur la racine." : "Extra CSS class on the root."}</td>
        </tr>
      </tbody>
    </table>
    <p class="docs-demo-note">
      {locale.value === "fr"
        ? "RibbonChartDatum = { category: string; period: string | number; value: number; tone?: RibbonChartTone } : tone ∈ category1…8"
        : "RibbonChartDatum = { category: string; period: string | number; value: number; tone?: RibbonChartTone } : tone ∈ category1…8"}
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
          <td>{locale.value === "fr" ? "Couleurs des catégories (segments + rubans)." : "Category colors (segments + ribbons)."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-surface-default</code></td>
          <td>{locale.value === "fr" ? "Trait de séparation des segments empilés." : "Stacked-segment separator stroke."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-surface-inverse</code></td>
          <td>{locale.value === "fr" ? "Fond de l'infobulle au survol." : "Hover tooltip background."}</td>
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
</style>
