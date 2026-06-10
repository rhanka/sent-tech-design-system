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
          comp: "OrganizationChart",
          props: {
            label:
              locale.value === "fr"
                ? "Organigramme de l'entreprise"
                : "Company org chart",
            data: [
              { id: "ceo", label: locale.value === "fr" ? "Direction" : "Leadership" },
              { id: "eng", parentId: "ceo", label: locale.value === "fr" ? "Ingénierie" : "Engineering" },
              { id: "sales", parentId: "ceo", label: locale.value === "fr" ? "Ventes" : "Sales" },
              { id: "ops", parentId: "ceo", label: locale.value === "fr" ? "Opérations" : "Operations" },
              { id: "fe", parentId: "eng", label: "Frontend" },
              { id: "be", parentId: "eng", label: "Backend" },
              { id: "amer", parentId: "sales", label: locale.value === "fr" ? "Amériques" : "Americas" },
              { id: "emea", parentId: "sales", label: "EMEA" }
            ],
            width: 640,
            height: 320
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
      <h1>OrganizationChart</h1>
      <Badge tone="success">{locale.value === "fr" ? "Stable" : "Stable"}</Badge>
    </div>
    <p>
      {#if locale.value === "fr"}
        Organigramme hiérarchique : une boîte rectangulaire par nœud, disposée par niveau
        (la profondeur fixe la ligne verticale) avec les enfants centrés sous leur parent.
        Les connecteurs orthogonaux relient chaque parent à ses enfants. Plusieurs racines
        sont acceptées, les <code>parentId</code> invalides (inconnus ou cycliques) sont
        traités comme des racines. Liste de valeurs accessible décrivant la hiérarchie.
      {:else}
        Hierarchical org chart: one rectangular box per node, laid out by level (depth sets
        the vertical row) with children centred under their parent. Orthogonal connectors
        link each parent to its children. Multiple roots are supported and invalid
        <code>parentId</code> values (unknown or cyclic) are treated as roots. An accessible
        value list describes the hierarchy.
      {/if}
    </p>
  </section>

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Exemples" : "Examples"}</h2>
    <p class="section-desc">
      {#if locale.value === "fr"}
        Organigramme à 3 niveaux : une direction, trois départements (Ingénierie, Ventes,
        Opérations) et leurs équipes. Chaque boîte adopte une couleur de la palette
        catégorielle du thème.
      {:else}
        3-level org chart: one leadership root, three departments (Engineering, Sales,
        Operations) and their teams. Each box takes a colour from the theme's categorical
        palette.
      {/if}
    </p>
    <TabbedExample
      nodes={demoNodes}
      title={locale.value === "fr"
        ? "Organigramme de l'entreprise"
        : "Company org chart"}
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
          <td><code>OrganizationChartNode[]</code></td>
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
          <td><code>320</code></td>
          <td>{locale.value === "fr" ? "Hauteur du viewBox SVG." : "SVG viewBox height."}</td>
        </tr>
      </tbody>
    </table>
    <p class="docs-demo-note">
      {locale.value === "fr"
        ? "OrganizationChartNode = { id: string; parentId?: string | null; label: string; tone?: OrganizationChartTone }"
        : "OrganizationChartNode = { id: string; parentId?: string | null; label: string; tone?: OrganizationChartTone }"}
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
          <td>{locale.value === "fr" ? "Palette catégorielle pour le fond des boîtes." : "Categorical palette for box fills."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-border-default</code></td>
          <td>{locale.value === "fr" ? "Couleur des connecteurs parent → enfant." : "Parent → child connector colour."}</td>
        </tr>
        <tr>
          <td><code>--st-semantic-text-inverse</code></td>
          <td>{locale.value === "fr" ? "Couleur du label dans les boîtes." : "Box label text colour."}</td>
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
