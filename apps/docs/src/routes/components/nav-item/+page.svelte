<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "navitem-demo-col" },
      children: [
        {
          comp: "NavItem",
          props: {
            title: locale.value === "fr" ? "Mes favoris" : "Favorites",
            swatch: { tone: "info" },
            count: 5
          }
        },
        {
          comp: "NavItem",
          props: {
            title: locale.value === "fr" ? "Non retenus" : "Discarded",
            swatch: { tone: "error" },
            status: "error",
            count: 5043
          }
        },
        {
          comp: "NavItem",
          props: {
            title: locale.value === "fr" ? "Zones 4+ seulement" : "4+ zones only",
            swatch: { color: "#16a34a", shape: "circle" },
            selected: true
          }
        },
        {
          comp: "NavItem",
          props: {
            title: "Signal: modification zonage 1675",
            caption: "DesignationEvent",
            depth: 1
          }
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
      <h1>NavItem</h1>
      <Badge tone="success">Stable</Badge>
    </div>
    <p>
      {#if locale.value === "fr"}
        L'<strong>anatomie de rangée canonique</strong> du système de navigation : tête
        (pastille/ton via <code>swatch</code>), titre, <code>caption</code> muette, bulle de
        <code>count</code>, <code>depth</code> (échelle typographique décroissante), <code>status</code>
        sémantique et <code>divider</code> optionnel. Compose <code>SelectableRow</code> (rôle ARIA
        dérivé du conteneur), <code>ColorSwatch</code>/<code>StatusDot</code> et <code>Badge</code> ;
        style <strong>token-only</strong>, un seul tab-stop.
      {:else}
        The <strong>canonical navigation row anatomy</strong>: head (swatch/tone via
        <code>swatch</code>), title, muted <code>caption</code>, <code>count</code> bubble,
        <code>depth</code> (decreasing type scale), semantic <code>status</code> and optional
        <code>divider</code>. Composes <code>SelectableRow</code> (container-derived ARIA role),
        <code>ColorSwatch</code>/<code>StatusDot</code> and <code>Badge</code>;
        <strong>token-only</strong>, a single tab-stop.
      {/if}
    </p>
  </section>

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Exemples" : "Examples"}</h2>
    <p class="section-desc">
      {#if locale.value === "fr"}
        Pastille de ton/couleur, bulle de compte, sélection, ton sémantique et profondeur.
      {:else}
        Tone/color swatch, count bubble, selection, semantic status and depth.
      {/if}
    </p>
    <TabbedExample
      nodes={demoNodes}
      title={locale.value === "fr" ? "Rangées de navigation" : "Navigation rows"}
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
        <tr><td><code>title</code></td><td><code>string</code></td><td>–</td><td>{locale.value === "fr" ? "Libellé principal (requis)." : "Main label (required)."}</td></tr>
        <tr><td><code>caption</code></td><td><code>string</code></td><td>–</td><td>{locale.value === "fr" ? "2ᵉ ligne muette, ellipse indépendante." : "Muted secondary line, independent ellipsis."}</td></tr>
        <tr><td><code>swatch</code></td><td><code>{"{ color?, tone?, shape? }"}</code></td><td>–</td><td>{locale.value === "fr" ? "Pastille de tête : couleur arbitraire (ColorSwatch) ou ton (StatusDot)." : "Head swatch: arbitrary color (ColorSwatch) or tone (StatusDot)."}</td></tr>
        <tr><td><code>count</code></td><td><code>number</code></td><td>–</td><td>{locale.value === "fr" ? "Bulle de compte en queue (Badge circle)." : "Trailing count bubble (Badge circle)."}</td></tr>
        <tr><td><code>depth</code></td><td><code>0 | 1 | 2 | 3</code></td><td><code>0</code></td><td>{locale.value === "fr" ? "Profondeur : graisse/taille décroissante + indentation." : "Depth: decreasing weight/size + indentation."}</td></tr>
        <tr><td><code>status</code></td><td><code>'neutral' | 'info' | 'success' | 'warning' | 'error'</code></td><td><code>'neutral'</code></td><td>{locale.value === "fr" ? "Ton sémantique de la rangée." : "Row semantic tone."}</td></tr>
        <tr><td><code>selected</code></td><td><code>boolean</code></td><td><code>false</code></td><td>{locale.value === "fr" ? "Sélection (2 signaux)." : "Selection (two signals)."}</td></tr>
        <tr><td><code>divider</code></td><td><code>boolean</code></td><td><code>false</code></td><td>{locale.value === "fr" ? "Séparateur après la rangée." : "Divider after the row."}</td></tr>
        <tr><td><code>href</code></td><td><code>string</code></td><td>–</td><td>{locale.value === "fr" ? "Rend la rangée comme un lien." : "Render the row as a link."}</td></tr>
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
        <tr><td><code>--st-component-navItem-depth0..3-*</code></td><td>{locale.value === "fr" ? "Échelle typographique par profondeur." : "Typographic scale per depth."}</td></tr>
        <tr><td><code>--st-semantic-feedback-*</code></td><td>{locale.value === "fr" ? "Ton sémantique du titre (status)." : "Semantic title tone (status)."}</td></tr>
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

  :global(.navitem-demo-col) {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    max-width: 320px;
  }
</style>
