<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "kpi-demo-row" },
      children: [
        {
          comp: "KpiCard",
          props: {
            label: locale.value === "fr" ? "Revenu mensuel" : "Monthly Revenue",
            value: 48200,
            delta: 0.083,
            deltaFormat: "percent",
            tone: "category1",
            sparkline: [32000, 35000, 38000, 42000, 45000, 48200]
          }
        },
        {
          comp: "KpiCard",
          props: {
            label: locale.value === "fr" ? "Taux de conversion" : "Conversion Rate",
            value: 0.072,
            format: "percent",
            delta: -0.005,
            deltaFormat: "percent",
            tone: "category3"
          }
        },
        {
          comp: "KpiCard",
          props: {
            label: locale.value === "fr" ? "Transactions" : "Transactions",
            value: 1240,
            delta: 94,
            deltaFormat: "absolute",
            tone: "category5",
            sparkline: [900, 980, 1050, 1100, 1180, 1240]
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
      <h1>KpiCard</h1>
      <Badge tone="success">{locale.value === "fr" ? "Stable" : "Stable"}</Badge>
    </div>
    <p>
      {#if locale.value === "fr"}
        Carte indicateur clé (KPI) : affiche une valeur principale, un delta de tendance
        (hausse / baisse / stable) avec flèche colorée, une unité optionnelle et un mini-graphique
        sparkline. La couleur de la bordure gauche suit la palette catégorielle du thème.
      {:else}
        Key Performance Indicator card: displays a main value, a trend delta (up / down / flat)
        with a colored arrow, an optional unit, and an inline sparkline. The left-border accent
        follows the theme's categorical palette.
      {/if}
    </p>
  </section>


  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Exemples" : "Examples"}</h2>
    <p class="section-desc">
      {#if locale.value === "fr"}
        Trois variantes : revenu avec sparkline et delta positif, taux en pourcentage avec delta
        négatif, et compteur de transactions avec sparkline.
      {:else}
        Three variants: revenue with sparkline and positive delta, percentage rate with negative
        delta, and transaction counter with sparkline.
      {/if}
    </p>
    <TabbedExample
      nodes={demoNodes}
      title={locale.value === "fr" ? "Indicateurs de performance" : "Performance indicators"}
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
          <td><code>value</code></td>
          <td><code>number | string</code></td>
          <td><em>{locale.value === "fr" ? "requis" : "required"}</em></td>
          <td>{locale.value === "fr" ? "Valeur principale affichée en grand." : "Main value displayed prominently."}</td>
        </tr>
        <tr>
          <td><code>label</code></td>
          <td><code>string</code></td>
          <td><em>{locale.value === "fr" ? "requis" : "required"}</em></td>
          <td>{locale.value === "fr" ? "Étiquette de l'indicateur." : "Indicator label."}</td>
        </tr>
        <tr>
          <td><code>delta</code></td>
          <td><code>number</code></td>
          <td>—</td>
          <td>{locale.value === "fr" ? "Variation par rapport à la période précédente." : "Variation vs previous period."}</td>
        </tr>
        <tr>
          <td><code>deltaFormat</code></td>
          <td><code>"percent" | "absolute"</code></td>
          <td><code>"percent"</code></td>
          <td>{locale.value === "fr" ? "Format d'affichage du delta." : "Delta display format."}</td>
        </tr>
        <tr>
          <td><code>trend</code></td>
          <td><code>"up" | "down" | "flat"</code></td>
          <td>—</td>
          <td>{locale.value === "fr" ? "Tendance explicite (déduite du signe delta si absente)." : "Explicit trend (inferred from delta sign if absent)."}</td>
        </tr>
        <tr>
          <td><code>format</code></td>
          <td><code>"number" | "currency" | "percent"</code></td>
          <td><code>"number"</code></td>
          <td>{locale.value === "fr" ? "Format de la valeur principale (Intl.NumberFormat)." : "Main value format (Intl.NumberFormat)."}</td>
        </tr>
        <tr>
          <td><code>unit</code></td>
          <td><code>string</code></td>
          <td>—</td>
          <td>{locale.value === "fr" ? "Suffixe d'unité (ex. ms, €/mois)." : "Unit suffix (e.g. ms, €/month)."}</td>
        </tr>
        <tr>
          <td><code>currency</code></td>
          <td><code>string</code></td>
          <td><code>"EUR"</code></td>
          <td>{locale.value === "fr" ? "Code devise ISO 4217 pour format currency." : "ISO 4217 currency code for format currency."}</td>
        </tr>
        <tr>
          <td><code>sparkline</code></td>
          <td><code>number[]</code></td>
          <td>—</td>
          <td>{locale.value === "fr" ? "Série de valeurs pour le mini-graphique." : "Data series for the inline sparkline."}</td>
        </tr>
        <tr>
          <td><code>size</code></td>
          <td><code>"sm" | "md" | "lg"</code></td>
          <td><code>"md"</code></td>
          <td>{locale.value === "fr" ? "Taille de la carte." : "Card size."}</td>
        </tr>
        <tr>
          <td><code>tone</code></td>
          <td><code>KpiCardTone</code></td>
          <td>—</td>
          <td>{locale.value === "fr" ? "Couleur catégorielle pour l'accent de bordure gauche (category1…8)." : "Categorical color for the left-border accent (category1…8)."}</td>
        </tr>
      </tbody>
    </table>
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
          <td><code>--st-component-card-background</code></td>
          <td>{locale.value === "fr" ? "Fond de la carte (défaut : surface-raised)." : "Card background (default: surface-raised)."}</td>
        </tr>
        <tr>
          <td><code>--st-component-card-border</code></td>
          <td>{locale.value === "fr" ? "Couleur de la bordure (défaut : border-subtle)." : "Border color (default: border-subtle)."}</td>
        </tr>
        <tr>
          <td><code>--st-component-card-shadow</code></td>
          <td>{locale.value === "fr" ? "Ombre portée de la carte." : "Card drop shadow."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-data-category1…8</code></td>
          <td>{locale.value === "fr" ? "Palette catégorielle pour l'accent de bordure." : "Categorical palette for the border accent."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-feedback-success</code></td>
          <td>{locale.value === "fr" ? "Couleur du delta positif (tendance up)." : "Positive delta color (trend up)."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-feedback-error</code></td>
          <td>{locale.value === "fr" ? "Couleur du delta négatif (tendance down)." : "Negative delta color (trend down)."}</td>
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

  :global(.kpi-demo-row) {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-4, 1rem);
    width: 100%;
  }

  :global(.kpi-demo-row > *) {
    flex: 1 1 220px;
    min-width: 200px;
    max-width: 320px;
  }
</style>
