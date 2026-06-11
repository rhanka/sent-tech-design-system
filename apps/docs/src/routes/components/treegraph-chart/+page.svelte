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
          comp: "TreegraphChart",
          props: {
            label:
              locale.value === "fr"
                ? "Arborescence des fichiers du projet"
                : "Project file tree",
            data: [
              { id: "src", label: "src" },
              { id: "comp", parentId: "src", label: locale.value === "fr" ? "composants" : "components" },
              { id: "lib", parentId: "src", label: "lib" },
              { id: "routes", parentId: "src", label: "routes" },
              { id: "button", parentId: "comp", label: "Button" },
              { id: "card", parentId: "comp", label: "Card" },
              { id: "utils", parentId: "lib", label: "utils" },
              { id: "home", parentId: "routes", label: "home" }
            ],
            width: 640,
            height: 360
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
      <h1>TreegraphChart</h1>
      <Badge tone="success">{locale.value === "fr" ? "Stable" : "Stable"}</Badge>
    </div>
    <p>
      {#if locale.value === "fr"}
        Arbre / dendrogramme : une orientation horizontale (gauche → droite) où la profondeur
        fixe la colonne, les feuilles sont réparties verticalement et chaque parent est centré
        sur ses enfants. Chaque nœud est un cercle coloré et les liens parent → enfant sont des
        courbes de Bézier cubiques. Plusieurs racines sont acceptées, les <code>parentId</code>
        invalides (inconnus ou cycliques) sont traités comme des racines. Liste de valeurs
        accessible décrivant la hiérarchie.
      {:else}
        Tree / dendrogram: a horizontal (left → right) layout where depth sets the column,
        leaves are spread vertically, and each parent is centred on its children. Each node is a
        coloured circle and parent → child links are cubic Bézier curves. Multiple roots are
        supported and invalid <code>parentId</code> values (unknown or cyclic) are treated as
        roots. An accessible value list describes the hierarchy.
      {/if}
    </p>
  </section>

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Exemples" : "Examples"}</h2>
    <p class="section-desc">
      {#if locale.value === "fr"}
        Arborescence de fichiers à 3 niveaux : un dossier racine, ses sous-dossiers et leurs
        feuilles. Chaque nœud adopte une couleur de la palette catégorielle du thème ; les liens
        courbes relient chaque parent à ses enfants de gauche à droite.
      {:else}
        3-level file tree: one root folder, its sub-folders and their leaves. Each node takes a
        colour from the theme's categorical palette; curved links connect each parent to its
        children from left to right.
      {/if}
    </p>
    <TabbedExample
      nodes={demoNodes}
      title={locale.value === "fr"
        ? "Arborescence des fichiers du projet"
        : "Project file tree"}
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
          <td><code>TreegraphChartNode[]</code></td>
          <td><em>{locale.value === "fr" ? "requis" : "required"}</em></td>
          <td>{locale.value === "fr" ? "Nœuds plats ; parentId null/absent = racine." : "Flat nodes; null/absent parentId = root."}</td>
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
          <td><code>640</code></td>
          <td>{locale.value === "fr" ? "Largeur du viewBox SVG." : "SVG viewBox width."}</td>
        </tr>
        <tr>
          <td><code>height</code></td>
          <td><code>number</code></td>
          <td><code>360</code></td>
          <td>{locale.value === "fr" ? "Hauteur du viewBox SVG." : "SVG viewBox height."}</td>
        </tr>
      </tbody>
    </table>
    <p class="docs-demo-note">
      {locale.value === "fr"
        ? "TreegraphChartNode = { id: string; parentId?: string | null; label: string; tone?: TreegraphChartTone }"
        : "TreegraphChartNode = { id: string; parentId?: string | null; label: string; tone?: TreegraphChartTone }"}
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
          <td>{locale.value === "fr" ? "Palette catégorielle pour le remplissage des cercles." : "Categorical palette for node circle fills."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-border-default</code></td>
          <td>{locale.value === "fr" ? "Couleur des liens parent → enfant." : "Parent → child link colour."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-text-primary</code></td>
          <td>{locale.value === "fr" ? "Couleur des libellés de nœuds." : "Node label text colour."}</td>
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
    max-width: 680px;
    margin-top: 0.75rem;
  }
</style>
