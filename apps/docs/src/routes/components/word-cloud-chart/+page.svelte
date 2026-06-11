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
          comp: "WordCloudChart",
          props: {
            label:
              locale.value === "fr"
                ? "Thèmes les plus cités dans les retours"
                : "Most mentioned themes in feedback",
            data: [
              { text: "performance", weight: 96 },
              { text: "accessibilité", weight: 78 },
              { text: "design", weight: 64 },
              { text: "tokens", weight: 52 },
              { text: "thème", weight: 44 },
              { text: "svelte", weight: 38 },
              { text: "react", weight: 36 },
              { text: "vue", weight: 34 },
              { text: "docs", weight: 28 },
              { text: "charts", weight: 24 },
              { text: "a11y", weight: 18 },
              { text: "i18n", weight: 12 }
            ],
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
      <h1>WordCloudChart</h1>
      <Badge tone="success">{locale.value === "fr" ? "Stable" : "Stable"}</Badge>
    </div>
    <p>
      {#if locale.value === "fr"}
        Nuage de mots : la taille de police de chaque mot est proportionnelle à son poids.
        Le placement est entièrement déterministe — les mots sont triés par poids décroissant
        puis positionnés depuis le centre le long d'une spirale d'Archimède, en évitant tout
        chevauchement par boîtes englobantes. Couleurs issues de la palette catégorielle du
        thème, tooltip au survol et liste de valeurs accessible. Les mots qui ne rentrent pas
        sont omis et signalés dans la liste de valeurs.
      {:else}
        Word cloud: each word's font size is proportional to its weight. Placement is fully
        deterministic — words are sorted by descending weight then positioned from the center
        along an Archimedean spiral, avoiding overlap via bounding boxes. Colors come from the
        theme's categorical palette, with a hover tooltip and accessible value list. Words that
        do not fit are omitted and flagged in the value list.
      {/if}
    </p>
  </section>

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Exemples" : "Examples"}</h2>
    <p class="section-desc">
      {#if locale.value === "fr"}
        Thèmes les plus cités dans les retours utilisateurs. Le mot le plus fréquent
        (performance) domine visuellement ; les couleurs cyclent la palette catégorielle.
      {:else}
        Most mentioned themes in user feedback. The most frequent word (performance) visually
        dominates; colors cycle through the categorical palette.
      {/if}
    </p>
    <TabbedExample
      nodes={demoNodes}
      title={locale.value === "fr"
        ? "Thèmes les plus cités dans les retours"
        : "Most mentioned themes in feedback"}
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
          <td><code>WordCloudChartWord[]</code></td>
          <td><em>{locale.value === "fr" ? "requis" : "required"}</em></td>
          <td>{locale.value === "fr" ? "Mots à placer (texte + poids)." : "Words to place (text + weight)."}</td>
        </tr>
        <tr>
          <td><code>label</code></td>
          <td><code>string</code></td>
          <td><em>{locale.value === "fr" ? "requis" : "required"}</em></td>
          <td>{locale.value === "fr" ? "Label aria-label du graphique (a11y)." : "Chart aria-label (a11y)."}</td>
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
          <td><code>320</code></td>
          <td>{locale.value === "fr" ? "Hauteur du viewBox SVG." : "SVG viewBox height."}</td>
        </tr>
      </tbody>
    </table>
    <p class="docs-demo-note">
      {locale.value === "fr"
        ? "WordCloudChartWord = { text: string; weight: number; tone?: WordCloudChartTone }"
        : "WordCloudChartWord = { text: string; weight: number; tone?: WordCloudChartTone }"}
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
          <td>{locale.value === "fr" ? "Palette catégorielle pour la couleur des mots." : "Categorical palette for word colors."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-surface-inverse</code></td>
          <td>{locale.value === "fr" ? "Fond du tooltip de survol." : "Hover tooltip background."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-text-inverse</code></td>
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
