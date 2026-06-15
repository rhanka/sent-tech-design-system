<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "overline-demo-col" },
      children: [
        {
          el: "div",
          props: { class: "overline-demo-group" },
          children: [
            { comp: "Overline", children: [locale.value === "fr" ? "Documentation" : "Documentation"] },
            {
              el: "p",
              props: { class: "overline-demo-body" },
              children: [
                locale.value === "fr"
                  ? "Libellé de groupe discret, posé au-dessus d'un bloc de contenu."
                  : "Discreet group label, set above a block of content."
              ]
            }
          ]
        },
        {
          el: "div",
          props: { class: "overline-demo-group" },
          children: [
            { comp: "Overline", props: { as: "h3" }, children: [locale.value === "fr" ? "Signaux" : "Signals"] },
            {
              el: "p",
              props: { class: "overline-demo-body" },
              children: [
                locale.value === "fr"
                  ? "En-tête de région (as=\"h3\") : porte la sémantique de titre."
                  : "Region heading (as=\"h3\"): carries title semantics."
              ]
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
      {locale.value === "fr" ? "Composant · Autres" : "Component · Other"}
    </p>
    <div class="docs-hero-title">
      <h1>Overline</h1>
      <Badge tone="success">{locale.value === "fr" ? "Stable" : "Stable"}</Badge>
    </div>
    <p>
      {#if locale.value === "fr"}
        Étiquette de section discrète en <strong>petites capitales</strong> — les
        « DOCUMENTATION », « SIGNAUX », « COMMUNITIES » des maquettes. Rôle : libellé de groupe de
        niveau 0, en ton secondaire, posé au-dessus d'un bloc. Avec <code>as="h2"</code> /
        <code>as="h3"</code> elle porte la sémantique de titre d'une région. Style
        <strong>token-only</strong> : chaque <code>--st-component-overline-*</code> retombe sur un
        littéral, donc un thème qui n'émet rien rend à l'identique.
      {:else}
        A discreet small-caps <strong>section label</strong> — the “DOCUMENTATION”, “SIGNALS”,
        “COMMUNITIES” of the mockups. Role: a level-0 group label, in a secondary tone, set above a
        block. With <code>as="h2"</code> / <code>as="h3"</code> it carries the heading semantics of a
        region. <strong>Token-only</strong> styling: every <code>--st-component-overline-*</code>
        falls back to a literal, so a theme that emits nothing renders identically.
      {/if}
    </p>
  </section>

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Exemples" : "Examples"}</h2>
    <p class="section-desc">
      {#if locale.value === "fr"}
        Un overline inline en libellé de groupe, puis un overline en en-tête de région
        (<code>as="h3"</code>).
      {:else}
        An inline overline used as a group label, then an overline as a region heading
        (<code>as="h3"</code>).
      {/if}
    </p>
    <TabbedExample
      nodes={demoNodes}
      title={locale.value === "fr" ? "Libellés de section" : "Section labels"}
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
          <td><code>as</code></td>
          <td><code>'span' | 'div' | 'h2' | 'h3'</code></td>
          <td><code>'span'</code></td>
          <td>{locale.value === "fr" ? "Balise rendue. span/div = neutre ; h2/h3 = en-tête de région." : "Rendered tag. span/div = neutral; h2/h3 = region heading."}</td>
        </tr>
        <tr>
          <td><code>class</code></td>
          <td><code>string</code></td>
          <td>–</td>
          <td>{locale.value === "fr" ? "Classe CSS supplémentaire sur la racine." : "Extra CSS class on the root."}</td>
        </tr>
        <tr>
          <td><code>children</code></td>
          <td><code>Snippet</code></td>
          <td>–</td>
          <td>{locale.value === "fr" ? "Contenu du libellé." : "Label content."}</td>
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
          <td><code>--st-component-overline-color</code></td>
          <td>{locale.value === "fr" ? "Couleur du libellé (retombe sur le texte secondaire)." : "Label color (falls back to secondary text)."}</td>
        </tr>
        <tr>
          <td><code>--st-component-overline-fontSize</code> / <code>-fontWeight</code></td>
          <td>{locale.value === "fr" ? "Taille et graisse." : "Size and weight."}</td>
        </tr>
        <tr>
          <td><code>--st-component-overline-letterSpacing</code> / <code>-textTransform</code></td>
          <td>{locale.value === "fr" ? "Interlettrage et casse (small-caps)." : "Letter spacing and case (small-caps)."}</td>
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

  :global(.overline-demo-col) {
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-5, 1.25rem);
  }

  :global(.overline-demo-group) {
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-2, 0.5rem);
  }

  :global(.overline-demo-body) {
    color: var(--st-semantic-text-secondary);
    font-size: 0.9375rem;
    line-height: 1.5;
    margin: 0;
  }
</style>
