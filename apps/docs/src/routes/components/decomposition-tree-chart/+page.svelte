<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const demoNodes = $derived<NodeSpec[]>([
    {
      comp: "DecompositionTreeChart",
      props: {
        label: locale.value === "fr" ? "Décomposition du revenu" : "Revenue decomposition",
        width: 600,
        height: 280,
        data: {
          measure: locale.value === "fr" ? "Revenu" : "Revenue",
          levels: [
            {
              dimension: locale.value === "fr" ? "Région" : "Region",
              nodes: [
                { label: locale.value === "fr" ? "Nord" : "North", value: 62 },
                { label: locale.value === "fr" ? "Sud" : "South", value: 38 }
              ]
            },
            {
              dimension: locale.value === "fr" ? "Canal" : "Channel",
              nodes: [
                {
                  label: "Web",
                  value: 40,
                  parent: locale.value === "fr" ? "Nord" : "North"
                },
                {
                  label: locale.value === "fr" ? "Magasin" : "Store",
                  value: 22,
                  parent: locale.value === "fr" ? "Nord" : "North"
                },
                {
                  label: "Web",
                  value: 25,
                  parent: locale.value === "fr" ? "Sud" : "South"
                },
                {
                  label: locale.value === "fr" ? "Magasin" : "Store",
                  value: 13,
                  parent: locale.value === "fr" ? "Sud" : "South"
                }
              ]
            }
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
      <h1>DecompositionTreeChart</h1>
      <Badge tone="success">{locale.value === "fr" ? "Stable" : "Stable"}</Badge>
    </div>
    <p>
      {#if locale.value === "fr"}
        Arbre de décomposition hiérarchique (façon Power BI decomposition tree). Une mesure
        <code>measure</code> totale se décompose en niveaux successifs : chaque niveau est une
        <strong>colonne</strong> de nœuds dont la barre horizontale a une largeur ∝
        <code>value</code> (relative au max du niveau), reliée à son <code>parent</code> du niveau
        précédent par un lien lissé. Idéal pour expliquer comment un total se ventile dimension après
        dimension.
      {:else}
        Hierarchical decomposition tree (Power BI decomposition tree style). A total
        <code>measure</code> is broken down across successive levels: each level is a
        <strong>column</strong> of nodes whose horizontal bar width is ∝ <code>value</code> (relative
        to the level max), linked to its <code>parent</code> from the previous level by a smoothed
        path. Ideal to explain how a total splits dimension after dimension.
      {/if}
    </p>
  </section>

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Exemples" : "Examples"}</h2>
    <p class="section-desc">
      {#if locale.value === "fr"}
        Le revenu se décompose d'abord par région, puis par canal : le Web du Nord est le plus gros
        contributeur.
      {:else}
        Revenue splits first by region, then by channel: North Web is the single largest contributor.
      {/if}
    </p>
    <TabbedExample
      nodes={demoNodes}
      title={locale.value === "fr" ? "Décomposition du revenu" : "Revenue decomposition"}
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
          <td><code>DecompositionTreeData</code></td>
          <td>–</td>
          <td>{locale.value === "fr" ? "{ measure, levels[] } : mesure totale + niveaux de nœuds." : "{ measure, levels[] }: total measure + node levels."}</td>
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
        ? "DecompositionTreeData = { measure: string; levels: { dimension: string; nodes: { label: string; value: number; parent?: string }[] }[] }"
        : "DecompositionTreeData = { measure: string; levels: { dimension: string; nodes: { label: string; value: number; parent?: string }[] }[] }"}
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
          <td>{locale.value === "fr" ? "Couleurs des barres (par niveau)." : "Bar colors (by level)."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-border-subtle</code></td>
          <td>{locale.value === "fr" ? "Liens lissés parent→enfant." : "Smoothed parent→child links."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-surface-default</code></td>
          <td>{locale.value === "fr" ? "Trait de séparation des barres." : "Bar separator stroke."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-text-inverse</code></td>
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
