<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "navsection-demo-col" },
      children: [
        {
          comp: "NavSection",
          props: {
            label: locale.value === "fr" ? "Signaux" : "Signals",
            count: 33,
            collapsible: true,
            open: true
          },
          children: [
            { comp: "NavItem", props: { title: locale.value === "fr" ? "Zonage uniquement" : "Zoning only", count: 33, swatch: { tone: "info" } } },
            { comp: "NavItem", props: { title: "Multifamilial 4+", caption: locale.value === "fr" ? "≥ 4 unités" : "≥ 4 units", count: 33, swatch: { tone: "success" } } },
            { comp: "NavItem", props: { title: locale.value === "fr" ? "Signaux précoces" : "Early signals", count: 33, swatch: { tone: "warning" } } }
          ]
        }
      ]
    }
  ]);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">
      {locale.value === "fr" ? "Composant · Navigation" : "Component · Navigation"}
    </p>
    <div class="docs-hero-title">
      <h1>NavSection</h1>
      <Badge tone="success">Stable</Badge>
    </div>
    <p>
      {#if locale.value === "fr"}
        En-tête de groupe d'un rail/drawer : libellé <strong>small-caps</strong> (via
        <code>Overline</code>), compteur optionnel (<code>Badge</code>), repli optionnel (via
        <code>Collapsible</code>, <code>aria-expanded</code>) et emplacement normé pour une
        <code>action</code> de section. Donne la hiérarchie typographique et un foyer pour l'action
        locale, au lieu d'un primaire planté dans la liste. Style <strong>token-only</strong>.
      {:else}
        A rail/drawer group heading: <strong>small-caps</strong> label (via <code>Overline</code>),
        optional count (<code>Badge</code>), optional collapse (via <code>Collapsible</code>,
        <code>aria-expanded</code>) and a normed slot for a section <code>action</code>. Gives
        typographic hierarchy and a home for the local action, instead of a primary dropped into the
        list. <strong>Token-only</strong> styling.
      {/if}
    </p>
  </section>

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Exemples" : "Examples"}</h2>
    <p class="section-desc">
      {#if locale.value === "fr"}
        Section repliable avec compteur, contenant des NavItem.
      {:else}
        Collapsible section with a count, containing NavItems.
      {/if}
    </p>
    <TabbedExample
      nodes={demoNodes}
      title={locale.value === "fr" ? "Section de navigation" : "Navigation section"}
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
        <tr><td><code>label</code></td><td><code>string</code></td><td>–</td><td>{locale.value === "fr" ? "Libellé small-caps (Overline)." : "Small-caps label (Overline)."}</td></tr>
        <tr><td><code>count</code></td><td><code>number</code></td><td>–</td><td>{locale.value === "fr" ? "Compteur de section (Badge circle)." : "Section count (Badge circle)."}</td></tr>
        <tr><td><code>collapsible</code></td><td><code>boolean</code></td><td><code>false</code></td><td>{locale.value === "fr" ? "En-tête repliable (aria-expanded)." : "Collapsible header (aria-expanded)."}</td></tr>
        <tr><td><code>open</code></td><td><code>boolean</code></td><td><code>true</code></td><td>{locale.value === "fr" ? "État d'ouverture (si collapsible)." : "Open state (when collapsible)."}</td></tr>
        <tr><td><code>as</code></td><td><code>'h2' | 'h3'</code></td><td><code>'h3'</code></td><td>{locale.value === "fr" ? "Niveau de titre en mode statique." : "Heading level in static mode."}</td></tr>
        <tr><td><code>action</code></td><td><code>Snippet</code></td><td>–</td><td>{locale.value === "fr" ? "Action de section (mode statique uniquement)." : "Section action (static mode only)."}</td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Tokens CSS" : "CSS Tokens"}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>{locale.value === "fr" ? "Variable CSS" : "CSS Variable"}</th><th>Description</th></tr>
      </thead>
      <tbody>
        <tr><td><code>--st-component-overline-*</code></td><td>{locale.value === "fr" ? "Style du libellé small-caps." : "Small-caps label styling."}</td></tr>
        <tr><td><code>--st-component-navSection-*</code></td><td>{locale.value === "fr" ? "Padding/gaps de l'en-tête." : "Header padding/gaps."}</td></tr>
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

  :global(.navsection-demo-col) {
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-4, 1rem);
    max-width: 320px;
  }
</style>
