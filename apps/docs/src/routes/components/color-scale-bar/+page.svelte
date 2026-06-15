<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "scalebar-demo-col" },
      children: [
        {
          comp: "ColorScaleBar",
          props: {
            label: locale.value === "fr" ? "Séquentielle (intensité)" : "Sequential (intensity)",
            colors: ["#eff6ff", "#60a5fa", "#1d4ed8", "#172554"],
            min: "0",
            max: "100",
            length: 280
          }
        },
        {
          comp: "ColorScaleBar",
          props: {
            label: locale.value === "fr" ? "Divergente (écart)" : "Diverging (deviation)",
            colors: ["#b91c1c", "#fca5a5", "#f5f5f5", "#93c5fd", "#1d4ed8"],
            min: "−1",
            max: "+1",
            length: 280
          }
        },
        {
          el: "div",
          props: { class: "scalebar-demo-row" },
          children: [
            {
              comp: "ColorScaleBar",
              props: {
                label: locale.value === "fr" ? "Verticale" : "Vertical",
                orientation: "vertical",
                colors: ["#fef3c7", "#f59e0b", "#7c2d12"],
                min: "min",
                max: "max",
                length: 140
              }
            }
          ]
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
      <h1>ColorScaleBar</h1>
      <Badge tone="success">{locale.value === "fr" ? "Stable" : "Stable"}</Badge>
    </div>
    <p>
      {#if locale.value === "fr"}
        Barre rendant une <strong>échelle de couleur continue</strong> à partir d'une liste de
        stops arbitraires (<code>colors</code>, ≥2), via un <code>linear-gradient(…)</code> en
        ligne — sa raison d'être. Pensée pour documenter les échelles séquentielles, divergentes ou
        OKLab : libellés d'extrémités <code>min</code>/<code>max</code> et orientation au choix. Le
        style propre (rayon, bordure, typo) reste token-only.
      {:else}
        A bar rendering a <strong>continuous color scale</strong> from a list of arbitrary stops
        (<code>colors</code>, ≥2), via an inline <code>linear-gradient(…)</code> — its purpose. Made
        to document sequential, diverging or OKLab scales: optional <code>min</code>/<code>max</code>
        end labels and either orientation. The component's own styling stays token-only.
      {/if}
    </p>
  </section>

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Exemples" : "Examples"}</h2>
    <p class="section-desc">
      {#if locale.value === "fr"}
        Échelle séquentielle, échelle divergente et une barre verticale.
      {:else}
        A sequential scale, a diverging scale and a vertical bar.
      {/if}
    </p>
    <TabbedExample
      nodes={demoNodes}
      title={locale.value === "fr" ? "Échelles de couleur" : "Color scales"}
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
          <td><code>colors</code></td>
          <td><code>string[]</code></td>
          <td>—</td>
          <td>{locale.value === "fr" ? "Stops du gradient (≥2), rendus en ligne." : "Gradient stops (≥2), rendered inline."}</td>
        </tr>
        <tr>
          <td><code>orientation</code></td>
          <td><code>'horizontal' | 'vertical'</code></td>
          <td><code>'horizontal'</code></td>
          <td>{locale.value === "fr" ? "Sens de la barre." : "Bar direction."}</td>
        </tr>
        <tr>
          <td><code>length</code></td>
          <td><code>number</code></td>
          <td>–</td>
          <td>{locale.value === "fr" ? "Longueur de la barre en pixels." : "Bar length in pixels."}</td>
        </tr>
        <tr>
          <td><code>thickness</code></td>
          <td><code>number</code></td>
          <td>–</td>
          <td>{locale.value === "fr" ? "Épaisseur de la barre en pixels." : "Bar thickness in pixels."}</td>
        </tr>
        <tr>
          <td><code>min</code> / <code>max</code></td>
          <td><code>string</code></td>
          <td>–</td>
          <td>{locale.value === "fr" ? "Libellés d'extrémités optionnels." : "Optional end labels."}</td>
        </tr>
        <tr>
          <td><code>label</code></td>
          <td><code>string</code></td>
          <td>–</td>
          <td>{locale.value === "fr" ? "Libellé accessible de la barre." : "Accessible bar label."}</td>
        </tr>
        <tr>
          <td><code>class</code></td>
          <td><code>string</code></td>
          <td>–</td>
          <td>{locale.value === "fr" ? "Classe CSS supplémentaire sur la racine." : "Extra CSS class on the root."}</td>
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
          <td><code>--st-semantic-border-subtle</code></td>
          <td>{locale.value === "fr" ? "Bordure de la barre." : "Bar border."}</td>
        </tr>
        <tr>
          <td><code>--st-radius-sm</code></td>
          <td>{locale.value === "fr" ? "Rayon de la barre." : "Bar radius."}</td>
        </tr>
        <tr>
          <td><code>--st-colorScaleBar-length</code> / <code>--st-colorScaleBar-thickness</code></td>
          <td>{locale.value === "fr" ? "Dimensions par défaut (sinon props length/thickness)." : "Default dimensions (else length/thickness props)."}</td>
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

  :global(.scalebar-demo-col) {
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-6, 1.5rem);
    align-items: flex-start;
  }

  :global(.scalebar-demo-row) {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-6, 1.5rem);
    align-items: flex-start;
  }
</style>
