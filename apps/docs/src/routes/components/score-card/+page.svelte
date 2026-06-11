<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "card-demo-row" },
      children: [
        {
          comp: "ScoreCard",
          props: {
            title: locale.value === "fr" ? "Valeur métier" : "Business Value",
            score: 4.2,
            stars: 4,
            type: "value"
          }
        },
        {
          comp: "ScoreCard",
          props: {
            title: locale.value === "fr" ? "Complexité" : "Complexity",
            score: 2.5,
            stars: 3,
            type: "complexity"
          }
        },
        {
          comp: "ScoreCard",
          props: {
            title: locale.value === "fr" ? "Maturité" : "Maturity",
            score: 7,
            stars: 7,
            max: 10,
            unit: "pts",
            type: "value"
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
      <h1>ScoreCard</h1>
      <Badge tone="success">{locale.value === "fr" ? "Stable" : "Stable"}</Badge>
    </div>
    <p>
      {#if locale.value === "fr"}
        Carte de score : un titre, une notation symbolique (étoiles pour la valeur, croix pour la
        complexité) et un score chiffré. Le type <code>value</code> emploie un accent succès, le type
        <code>complexity</code> un accent avertissement.
      {:else}
        Score card: a title, a symbolic rating (stars for value, crosses for complexity) and a numeric
        score. The <code>value</code> type uses a success accent, the <code>complexity</code> type a
        warning accent.
      {/if}
    </p>
  </section>

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Exemples" : "Examples"}</h2>
    <p class="section-desc">
      {#if locale.value === "fr"}
        Une note de valeur (étoiles), une note de complexité (croix) et un score sur dix avec unité
        personnalisée.
      {:else}
        A value score (stars), a complexity score (crosses) and a score out of ten with a custom unit.
      {/if}
    </p>
    <TabbedExample
      nodes={demoNodes}
      title={locale.value === "fr" ? "Scores" : "Scores"}
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
          <td><code>title</code></td>
          <td><code>string</code></td>
          <td><em>{locale.value === "fr" ? "requis" : "required"}</em></td>
          <td>{locale.value === "fr" ? "Titre de la métrique notée." : "Scored metric title."}</td>
        </tr>
        <tr>
          <td><code>score</code></td>
          <td><code>number</code></td>
          <td><em>{locale.value === "fr" ? "requis" : "required"}</em></td>
          <td>{locale.value === "fr" ? "Score affiché (une décimale)." : "Displayed score (one decimal)."}</td>
        </tr>
        <tr>
          <td><code>stars</code></td>
          <td><code>number</code></td>
          <td><em>{locale.value === "fr" ? "requis" : "required"}</em></td>
          <td>{locale.value === "fr" ? "Nombre de symboles pleins (0..max)." : "Number of filled symbols (0..max)."}</td>
        </tr>
        <tr>
          <td><code>max</code></td>
          <td><code>number</code></td>
          <td><code>5</code></td>
          <td>{locale.value === "fr" ? "Nombre total de symboles." : "Total number of symbols."}</td>
        </tr>
        <tr>
          <td><code>type</code></td>
          <td><code>"value" | "complexity"</code></td>
          <td><code>"value"</code></td>
          <td>{locale.value === "fr" ? "Étoiles (value) ou croix (complexity)." : "Stars (value) or crosses (complexity)."}</td>
        </tr>
        <tr>
          <td><code>unit</code></td>
          <td><code>string</code></td>
          <td><code>"points"</code></td>
          <td>{locale.value === "fr" ? "Libellé d'unité du score." : "Score unit label."}</td>
        </tr>
        <tr>
          <td><code>size</code></td>
          <td><code>"sm" | "md" | "lg"</code></td>
          <td><code>"md"</code></td>
          <td>{locale.value === "fr" ? "Taille de la carte." : "Card size."}</td>
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
          <td><code>--st-semantic-feedback-success</code></td>
          <td>{locale.value === "fr" ? "Accent du score / étoiles (type value)." : "Score / stars accent (value type)."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-feedback-warning</code></td>
          <td>{locale.value === "fr" ? "Accent du score (type complexity)." : "Score accent (complexity type)."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-border-default</code></td>
          <td>{locale.value === "fr" ? "Symboles vides (non remplis)." : "Empty (unfilled) symbols."}</td>
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

  :global(.card-demo-row) {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-4, 1rem);
    width: 100%;
  }

  :global(.card-demo-row > *) {
    flex: 1 1 220px;
    max-width: 320px;
    min-width: 200px;
  }
</style>
