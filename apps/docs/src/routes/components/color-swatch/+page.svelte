<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "swatch-demo-col" },
      children: [
        {
          el: "div",
          props: { class: "swatch-demo-row" },
          children: [
            { comp: "ColorSwatch", props: { color: "#2563eb", label: "#2563eb" } },
            { comp: "ColorSwatch", props: { color: "#16a34a", label: "#16a34a" } },
            { comp: "ColorSwatch", props: { color: "#f59e0b", label: "#f59e0b" } },
            { comp: "ColorSwatch", props: { color: "#dc2626", label: "#dc2626" } }
          ]
        },
        {
          el: "div",
          props: { class: "swatch-demo-row" },
          children: [
            { comp: "ColorSwatch", props: { color: "oklch(0.7 0.15 250)", shape: "circle", size: 32 } },
            { comp: "ColorSwatch", props: { color: "oklch(0.7 0.15 160)", shape: "circle", size: 32 } },
            { comp: "ColorSwatch", props: { color: "var(--st-semantic-action-primary)", shape: "pill", size: 40, label: locale.value === "fr" ? "Token DS" : "DS token" } }
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
      <h1>ColorSwatch</h1>
      <Badge tone="success">{locale.value === "fr" ? "Stable" : "Stable"}</Badge>
    </div>
    <p>
      {#if locale.value === "fr"}
        Pastille affichant <strong>une couleur arbitraire</strong> — hex, <code>rgb()</code>,
        <code>oklch()</code> ou un token CSS <code>var(--st-…)</code>. Contrairement à
        <code>Tag</code>/<code>Badge</code> (limités aux tons <code>category1…8</code>), la couleur
        passée en prop est rendue via un <code>background</code> en ligne : c'est la raison d'être du
        composant (palette-picker, légende d'échelle). Le reste du style reste token-only.
      {:else}
        A swatch displaying <strong>an arbitrary color</strong> — hex, <code>rgb()</code>,
        <code>oklch()</code> or a CSS token <code>var(--st-…)</code>. Unlike
        <code>Tag</code>/<code>Badge</code> (limited to <code>category1…8</code> tones), the color
        prop is rendered via an inline <code>background</code>: that is the component's purpose
        (palette picker, scale legend). The rest of the styling stays token-only.
      {/if}
    </p>
  </section>

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Exemples" : "Examples"}</h2>
    <p class="section-desc">
      {#if locale.value === "fr"}
        Carrés avec libellé hex, cercles <code>oklch()</code> et une pilule sur token DS.
      {:else}
        Hex-labelled squares, <code>oklch()</code> circles and a pill bound to a DS token.
      {/if}
    </p>
    <TabbedExample
      nodes={demoNodes}
      title={locale.value === "fr" ? "Pastilles de couleur" : "Color swatches"}
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
          <td><code>color</code></td>
          <td><code>string</code></td>
          <td>—</td>
          <td>{locale.value === "fr" ? "Couleur arbitraire (hex/rgb/oklch/token), rendue en ligne." : "Arbitrary color (hex/rgb/oklch/token), rendered inline."}</td>
        </tr>
        <tr>
          <td><code>size</code></td>
          <td><code>number</code></td>
          <td><code>24</code></td>
          <td>{locale.value === "fr" ? "Côté de la pastille en pixels." : "Swatch side in pixels."}</td>
        </tr>
        <tr>
          <td><code>shape</code></td>
          <td><code>'square' | 'circle' | 'pill'</code></td>
          <td><code>'square'</code></td>
          <td>{locale.value === "fr" ? "Forme de la pastille." : "Swatch shape."}</td>
        </tr>
        <tr>
          <td><code>label</code></td>
          <td><code>string</code></td>
          <td>–</td>
          <td>{locale.value === "fr" ? "Libellé optionnel affiché à côté." : "Optional label shown next to the chip."}</td>
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
        ? "Accessibilité : aria-label dérivé du label, sinon de la couleur."
        : "Accessibility: aria-label derived from the label, otherwise from the color."}
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
          <td><code>--st-semantic-border-subtle</code></td>
          <td>{locale.value === "fr" ? "Bordure de la pastille." : "Swatch border."}</td>
        </tr>
        <tr>
          <td><code>--st-radius-sm</code> / <code>--st-radius-pill</code></td>
          <td>{locale.value === "fr" ? "Rayon selon la forme." : "Radius per shape."}</td>
        </tr>
        <tr>
          <td><code>--st-spacing-2</code></td>
          <td>{locale.value === "fr" ? "Écart entre la pastille et le libellé." : "Gap between chip and label."}</td>
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

  :global(.swatch-demo-col) {
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-4, 1rem);
  }

  :global(.swatch-demo-row) {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-5, 1.25rem);
    align-items: center;
  }
</style>
