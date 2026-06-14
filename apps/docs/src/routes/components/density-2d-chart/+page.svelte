<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  // Nuage de points (x,y) avec deux foyers de densité : agrégé en grille bins×bins.
  const seed = (() => {
    const points: { x: number; y: number }[] = [];
    let s = 7;
    const rand = () => {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return s / 0x7fffffff;
    };
    // foyer dense 1
    for (let i = 0; i < 120; i++) {
      points.push({ x: 3 + rand() * 2, y: 3 + rand() * 2 });
    }
    // foyer dense 2
    for (let i = 0; i < 90; i++) {
      points.push({ x: 7 + rand() * 1.5, y: 6 + rand() * 1.5 });
    }
    // bruit dispersé
    for (let i = 0; i < 60; i++) {
      points.push({ x: rand() * 10, y: rand() * 10 });
    }
    return points;
  })();

  const demoNodes = $derived<NodeSpec[]>([
    {
      comp: "Density2DChart",
      props: {
        label: locale.value === "fr" ? "Densité des observations" : "Observation density",
        width: 600,
        height: 300,
        bins: 14,
        data: seed
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
      <h1>Density2DChart</h1>
      <Badge tone="success">{locale.value === "fr" ? "Stable" : "Stable"}</Badge>
    </div>
    <p>
      {#if locale.value === "fr"}
        Densité 2D non-géographique sur axes numériques (heatmap binned, façon Tableau/Dataiku
        density). Les points <code>(x, y)</code> sont agrégés dans une grille régulière
        <code>bins×bins</code> sur l'étendue des données ; la couleur d'une cellule encode la
        <strong>densité</strong> (somme des poids) normalisée sur l'échelle continue
        category1..8. Axes gradués (ticks « nice ») et légende Low→High.
      {:else}
        Non-geographic 2D density on numeric axes (binned heatmap, Tableau/Dataiku density style).
        <code>(x, y)</code> points are aggregated into a regular <code>bins×bins</code> grid over the
        data extent; a cell's color encodes <strong>density</strong> (sum of weights) normalised on
        the continuous category1..8 scale. Nice-tick axes and a Low→High legend.
      {/if}
    </p>
  </section>

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Exemples" : "Examples"}</h2>
    <p class="section-desc">
      {#if locale.value === "fr"}
        Deux foyers de concentration ressortent en clair sur la rampe, le bruit dispersé reste froid.
      {:else}
        Two concentration clusters stand out high on the ramp; scattered noise stays cool.
      {/if}
    </p>
    <TabbedExample
      nodes={demoNodes}
      title={locale.value === "fr" ? "Densité des observations" : "Observation density"}
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
          <td><code>Density2DPoint[]</code></td>
          <td>–</td>
          <td>{locale.value === "fr" ? "Points { x, y, weight? } à agréger." : "Points { x, y, weight? } to aggregate."}</td>
        </tr>
        <tr>
          <td><code>bins</code></td>
          <td><code>number</code></td>
          <td><code>12</code></td>
          <td>{locale.value === "fr" ? "Nombre de bins par axe (grille bins×bins)." : "Number of bins per axis (bins×bins grid)."}</td>
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
          <td><code>640</code></td>
          <td>{locale.value === "fr" ? "Largeur du viewBox SVG." : "SVG viewBox width."}</td>
        </tr>
        <tr>
          <td><code>height</code></td>
          <td><code>number</code></td>
          <td><code>320</code></td>
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
        ? "Density2DPoint = { x: number; y: number; weight?: number }"
        : "Density2DPoint = { x: number; y: number; weight?: number }"}
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
          <td>{locale.value === "fr" ? "Rampe de densité (Low→High)." : "Density ramp (Low→High)."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-border-subtle</code></td>
          <td>{locale.value === "fr" ? "Axes X et Y." : "X and Y axes."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-surface-default</code></td>
          <td>{locale.value === "fr" ? "Trait de séparation des cellules." : "Cell separator stroke."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-text-secondary</code></td>
          <td>{locale.value === "fr" ? "Étiquettes des axes." : "Axis tick labels."}</td>
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
