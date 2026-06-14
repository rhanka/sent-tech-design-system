<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const demoNodes = $derived<NodeSpec[]>([
    {
      comp: "FlamegraphChart",
      props: {
        label: locale.value === "fr" ? "Profil CPU de la requête" : "Request CPU profile",
        width: 560,
        height: 280,
        data: {
          name: locale.value === "fr" ? "requête" : "request",
          value: 100,
          children: [
            {
              name: locale.value === "fr" ? "authentifier" : "authenticate",
              value: 28,
              children: [{ name: "verifyToken", value: 18 }]
            },
            {
              name: locale.value === "fr" ? "requête SQL" : "db query",
              value: 46,
              children: [
                { name: "parse", value: 14 },
                { name: "execute", value: 26, children: [{ name: "scanIndex", value: 17 }] }
              ]
            },
            { name: locale.value === "fr" ? "rendu" : "render", value: 22 }
          ]
        }
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
      <h1>FlamegraphChart</h1>
      <Badge tone="success">{locale.value === "fr" ? "Stable" : "Stable"}</Badge>
    </div>
    <p>
      {#if locale.value === "fr"}
        Pile d'appels (call stacks façon Grafana flamegraph / Brendan Gregg). La LARGEUR d'un nœud
        est ∝ <code>value</code> : la racine occupe toute la largeur, chaque enfant occupe
        <code>value / Σ frères</code> de la largeur de son parent, et la profondeur fixe le niveau
        vertical. Idéal pour visualiser où le temps (ou toute mesure cumulative) se concentre dans
        une hiérarchie récursive.
      {:else}
        Call stacks (Grafana flamegraph / Brendan Gregg style). A node's WIDTH is ∝
        <code>value</code>: the root spans the full width, each child takes
        <code>value / Σ siblings</code> of its parent's width, and depth sets the vertical level.
        Ideal to see where time (or any cumulative measure) concentrates in a recursive hierarchy.
      {/if}
    </p>
  </section>

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Exemples" : "Examples"}</h2>
    <p class="section-desc">
      {#if locale.value === "fr"}
        Le profil d'une requête : la requête SQL domine, et l'exécution de l'index est le point chaud
        le plus profond.
      {:else}
        A request profile: the DB query dominates, and index execution is the deepest hot spot.
      {/if}
    </p>
    <TabbedExample
      nodes={demoNodes}
      title={locale.value === "fr" ? "Profil CPU de la requête" : "Request CPU profile"}
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
          <td><code>FlamegraphNode</code></td>
          <td>–</td>
          <td>{locale.value === "fr" ? "Nœud racine récursif : { name, value, children? }." : "Recursive root node: { name, value, children? }."}</td>
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
        ? "FlamegraphNode = { name: string; value: number; children?: FlamegraphNode[] }"
        : "FlamegraphNode = { name: string; value: number; children?: FlamegraphNode[] }"}
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
          <td>{locale.value === "fr" ? "Couleurs des nœuds (par profondeur)." : "Node colors (by depth)."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-surface-default</code></td>
          <td>{locale.value === "fr" ? "Trait de séparation des rectangles." : "Rectangle separator stroke."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-text-primary</code></td>
          <td>{locale.value === "fr" ? "Étiquettes des nœuds." : "Node labels."}</td>
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
