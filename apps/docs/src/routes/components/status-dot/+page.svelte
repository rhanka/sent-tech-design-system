<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "statusdot-demo-col" },
      children: [
        {
          el: "div",
          props: { class: "statusdot-demo-row" },
          children: [
            { comp: "StatusDot", props: { tone: "neutral" } },
            { comp: "StatusDot", props: { tone: "info" } },
            { comp: "StatusDot", props: { tone: "success" } },
            { comp: "StatusDot", props: { tone: "warning" } },
            { comp: "StatusDot", props: { tone: "error" } }
          ]
        },
        {
          el: "div",
          props: { class: "statusdot-demo-row" },
          children: [
            {
              comp: "StatusDot",
              props: { tone: "success", pulse: true, label: locale.value === "fr" ? "En direct" : "Live" }
            },
            {
              comp: "StatusDot",
              props: { tone: "warning", label: locale.value === "fr" ? "Dégradé" : "Degraded" }
            },
            {
              comp: "StatusDot",
              props: { tone: "error", label: locale.value === "fr" ? "Hors ligne" : "Offline" }
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
      {locale.value === "fr" ? "Composant · Feedback" : "Component · Feedback"}
    </p>
    <div class="docs-hero-title">
      <h1>StatusDot</h1>
      <Badge tone="success">{locale.value === "fr" ? "Stable" : "Stable"}</Badge>
    </div>
    <p>
      {#if locale.value === "fr"}
        Pastille de statut — un point coloré via <code>tone</code> (mappé sur
        <code>--st-semantic-feedback-*</code>) ou une couleur arbitraire via <code>color</code>
        (rendue en <code>background-color</code> inline, comme <code>ColorSwatch</code>).
        <code>pulse</code> ajoute un halo animé « en direct » (désactivé sous
        <code>prefers-reduced-motion</code>) ; <code>label</code> rend point + texte = un
        <strong>StatusIndicator</strong>. Style <strong>token-only</strong>, accessibilité câblée
        (role="img" + aria-label sans label, texte porteur avec label).
      {:else}
        A status dot — a colored dot via <code>tone</code> (mapped onto
        <code>--st-semantic-feedback-*</code>) or an arbitrary color via <code>color</code>
        (rendered as an inline <code>background-color</code>, like <code>ColorSwatch</code>).
        <code>pulse</code> adds an animated “live” halo (disabled under
        <code>prefers-reduced-motion</code>); <code>label</code> renders dot + text = a
        <strong>StatusIndicator</strong>. <strong>Token-only</strong> styling, accessibility wired
        (role="img" + aria-label without a label, text-bearing with a label).
      {/if}
    </p>
  </section>

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Exemples" : "Examples"}</h2>
    <p class="section-desc">
      {#if locale.value === "fr"}
        Les cinq tonalités, puis trois indicateurs avec libellé dont un en direct animé
        (<code>pulse</code>).
      {:else}
        The five tones, then three labelled indicators including an animated live one
        (<code>pulse</code>).
      {/if}
    </p>
    <TabbedExample
      nodes={demoNodes}
      title={locale.value === "fr" ? "Points de statut" : "Status dots"}
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
          <td><code>tone</code></td>
          <td><code>'neutral' | 'info' | 'success' | 'warning' | 'error'</code></td>
          <td><code>'neutral'</code></td>
          <td>{locale.value === "fr" ? "Ton sémantique. Ignoré si color est fourni." : "Semantic tone. Ignored when color is provided."}</td>
        </tr>
        <tr>
          <td><code>color</code></td>
          <td><code>string</code></td>
          <td>–</td>
          <td>{locale.value === "fr" ? "Couleur arbitraire (hex/rgb/token), background inline. Prime sur tone." : "Arbitrary color (hex/rgb/token), inline background. Overrides tone."}</td>
        </tr>
        <tr>
          <td><code>size</code></td>
          <td><code>number</code></td>
          <td><code>8</code></td>
          <td>{locale.value === "fr" ? "Diamètre du point en px." : "Dot diameter in px."}</td>
        </tr>
        <tr>
          <td><code>pulse</code></td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
          <td>{locale.value === "fr" ? "Halo animé « live ». Désactivé sous prefers-reduced-motion." : "Animated “live” halo. Disabled under prefers-reduced-motion."}</td>
        </tr>
        <tr>
          <td><code>label</code></td>
          <td><code>string</code></td>
          <td>–</td>
          <td>{locale.value === "fr" ? "Si fourni, rend le point + ce texte inline." : "When provided, renders the dot + this inline text."}</td>
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
        ? "Accessibilité : sans label, role=\"img\" + aria-label (tone ou couleur) ; avec label, le texte porte l'info et le point est aria-hidden."
        : "Accessibility: without a label, role=\"img\" + aria-label (tone or color); with a label, the text carries the info and the dot is aria-hidden."}
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
          <td><code>--st-component-statusDot-{'{tone}'}</code></td>
          <td>{locale.value === "fr" ? "Couleur du point par tonalité (retombe sur --st-semantic-feedback-*)." : "Dot color per tone (falls back to --st-semantic-feedback-*)."}</td>
        </tr>
        <tr>
          <td><code>--st-component-statusDot-labelFontSize</code> / <code>-labelFontWeight</code></td>
          <td>{locale.value === "fr" ? "Typographie du libellé." : "Label typography."}</td>
        </tr>
        <tr>
          <td><code>--st-component-statusDot-pulseSpread</code></td>
          <td>{locale.value === "fr" ? "Amplitude du halo animé." : "Animated halo spread."}</td>
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

  :global(.statusdot-demo-col) {
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-4, 1rem);
  }

  :global(.statusdot-demo-row) {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-5, 1.25rem);
    align-items: center;
  }
</style>
