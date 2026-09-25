<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { dashboardGridDemoNodes, type NodeSpec } from "$lib/framework/examples";
  import { Badge, CodeSnippet, Link } from "@sentropic/design-system-svelte";
  import type { DashboardLayout } from "@sentropic/dataviz-core";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  const fr = $derived(locale.value === "fr");

  // Static serializable layout: DashboardGrid takes no store (stated below).
  const layout: DashboardLayout = {
    columns: 12,
    panels: [
      { id: "revenue", x: 0, y: 0, w: 6, h: 2 },
      { id: "pipeline", x: 6, y: 0, w: 6, h: 2 },
      { id: "risk", x: 0, y: 2, w: 12, h: 1 }
    ]
  };

  const demo = $derived<NodeSpec[]>(dashboardGridDemoNodes(layout));

  const notes = $derived({
    angular: fr
      ? "Aucun adaptateur DashboardGrid côté Angular."
      : "No DashboardGrid adapter in Angular."
  });

  const storeCode = `import type { DashboardLayout } from "@sentropic/dataviz-core";
import { DashboardGrid } from "@sentropic/dataviz-svelte";

const layout: DashboardLayout = {
  columns: 12,
  panels: [
    { id: "revenue", x: 0, y: 0, w: 6, h: 2 },
    { id: "pipeline", x: 6, y: 0, w: 6, h: 2 },
    { id: "risk", x: 0, y: 2, w: 12, h: 1 }
  ]
};`;
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{t(locale.value, "datavizKicker")}</p>
    <div class="docs-hero-title">
      <h1>DashboardGrid</h1>
      <Badge tone="neutral">{fr ? "Documenté" : "Documented"}</Badge>
    </div>
    <p>
      {#if fr}
        Grille de panneaux sérialisable : <code>layout</code> place les panneaux sur
        douze colonnes, avec déplacement et redimensionnement optionnels en mode
        éditable. Sans import DS : l’adaptateur rend son propre balisage et ne lit
        aucun store.
      {:else}
        Serializable panel grid: <code>layout</code> places panels on twelve columns,
        with optional move and resize in editable mode. No DS import: the adapter
        renders its own markup and reads no store.
      {/if}
    </p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "datavizCoverageTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr>
          <th>Framework</th>
          <th>{t(locale.value, "datavizFrameworkShape")}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>Svelte</code></td>
          <td>{fr ? "Composant DashboardGrid (démo live ci-dessous)." : "DashboardGrid component (live demo below)."}</td>
        </tr>
        <tr>
          <td><code>React</code></td>
          <td>{fr ? "Composant DashboardGrid (démo live ci-dessous)." : "DashboardGrid component (live demo below)."}</td>
        </tr>
        <tr>
          <td><code>Vue</code></td>
          <td>{fr ? "Composant DashboardGrid (démo live ci-dessous)." : "DashboardGrid component (live demo below)."}</td>
        </tr>
        <tr>
          <td><code>Angular</code></td>
          <td>{fr ? "Absent : aucun adaptateur." : "Missing: no adapter."}</td>
        </tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{fr ? "Exemples" : "Examples"}</h2>
    <p class="section-desc">
      {#if fr}
        Trois panneaux sur douze colonnes : deux cartes côte à côte, une bande pleine
        largeur en dessous. Contenu des panneaux omis (rendu via snippet côté Svelte).
      {:else}
        Three panels on twelve columns: two side-by-side cards, one full-width strip
        below. Panel content omitted (rendered through a snippet in Svelte).
      {/if}
    </p>
    <TabbedExample
      nodes={demo}
      {notes}
      title={fr ? "Grille trois panneaux" : "Three-panel grid"}
    />
    <p>
      <Link href="/components/dashboard-grid">
        {fr ? "DashboardGrid natif (tuiles)" : "Native DashboardGrid (tiles)"}
      </Link>
    </p>
    <h3 class="docs-demo-title">{fr ? "Disposition" : "Layout"}</h3>
    <CodeSnippet
      code={storeCode}
      language="ts"
      copyLabel={fr ? "Copier" : "Copy"}
      copiedLabel={fr ? "Copié" : "Copied"}
    />
  </section>

  <section class="docs-section">
    <h2>{fr ? "API du composant" : "Component API"}</h2>
    <table class="docs-table">
      <thead>
        <tr>
          <th>Prop</th>
          <th>Type</th>
          <th>{fr ? "Défaut" : "Default"}</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>layout</code></td>
          <td><code>DashboardLayout</code></td>
          <td><em>{fr ? "requis" : "required"}</em></td>
          <td>
            {fr
              ? "Disposition sérialisable : columns et panneaux { id, x, y, w, h }."
              : "Serializable layout: columns and { id, x, y, w, h } panels."}
          </td>
        </tr>
        <tr>
          <td><code>panels</code></td>
          <td><code>DashboardGridPanel[]</code></td>
          <td><code>[]</code></td>
          <td>
            {fr
              ? "Métadonnées d’affichage par id de panneau (titre, description)."
              : "Display metadata per panel id (title, description)."}
          </td>
        </tr>
        <tr>
          <td><code>editable</code></td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
          <td>
            {fr
              ? "Active déplacements, redimensionnements et poignées de glisser."
              : "Enables moves, resizes, and drag handles."}
          </td>
        </tr>
        <tr>
          <td><code>rowHeight</code> / <code>minPanelHeight</code></td>
          <td><code>number</code></td>
          <td><code>112</code> / <code>96</code></td>
          <td>
            {fr
              ? "Hauteur de ligne et hauteur visuelle minimale (px, plancher 32)."
              : "Row height and minimum visual height (px, floored at 32)."}
          </td>
        </tr>
        <tr>
          <td><code>onLayoutChange</code></td>
          <td><code>(layout: DashboardLayout) =&gt; void</code></td>
          <td>{fr ? "non défini" : "unset"}</td>
          <td>
            {fr
              ? "Appelé avec la disposition normalisée après chaque édition."
              : "Called with the normalized layout after every edit."}
          </td>
        </tr>
        <tr>
          <td><code>ariaLabel</code></td>
          <td><code>string</code></td>
          <td><code>"Dashboard layout"</code></td>
          <td>{fr ? "Label accessible de la liste de panneaux." : "Accessible label for the panel list."}</td>
        </tr>
        <tr>
          <td><code>class</code></td>
          <td><code>string</code></td>
          <td>{fr ? "non défini" : "unset"}</td>
          <td>{fr ? "Classe transmise à la grille." : "Class forwarded to the grid."}</td>
        </tr>
      </tbody>
    </table>
    <p class="docs-demo-context">
      {#if fr}
        Faux ami assumé : l’homonyme natif <code>DashboardGrid</code> (tiles, columns,
        rowHeight, gap, editable, label, onLayout) rend des tuiles par valeur ; cette
        page documente l’adaptateur dataviz, qui place des panneaux sérialisables et
        ne compose aucun composant DS.
      {:else}
        Deliberate false friend: the native namesake <code>DashboardGrid</code>
        (tiles, columns, rowHeight, gap, editable, label, onLayout) renders tiles by
        value; this page documents the dataviz adapter, which places serializable
        panels and composes no DS component.
      {/if}
    </p>
  </section>
</div>
