<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import { EXAMPLES } from "$lib/framework/examples";

  const copy = {
    fr: {
      kicker: "Composant · Données",
      badge: "WP20",
      intro: "DashboardGrid compose un canvas de tuiles analytiques par coordonnées de grille. Le mode éditable expose des contrôles accessibles pour déplacer et redimensionner les tuiles sans dépendance drag-and-drop.",
      staticTitle: "Grille statique",
      editTitle: "Mode édition",
      apiTitle: "API du composant",
      defaultLabel: "Par défaut",
      required: "requis",
      optional: "optionnel",
      notesTitle: "Notes d'usage",
      notes: "Les collisions sont autorisées dans cette première version et se superposent dans la grille CSS. Le callback reçoit toujours le layout complet normalisé, dans l'ordre d'entrée."
    },
    en: {
      kicker: "Component · Data",
      badge: "WP20",
      intro: "DashboardGrid composes an analytics tile canvas from grid coordinates. Editable mode exposes accessible controls to move and resize tiles without a drag-and-drop dependency.",
      staticTitle: "Static grid",
      editTitle: "Edit mode",
      apiTitle: "Component API",
      defaultLabel: "Default",
      required: "required",
      optional: "optional",
      notesTitle: "Usage notes",
      notes: "Collisions are allowed in this first version and overlay in the CSS grid. The callback always receives the full normalized layout in input order."
    }
  } as const;

  const text = () => copy[locale.value];

  const staticNodes = EXAMPLES.dashboardgridstatic.nodes;
  const editNodes = EXAMPLES.dashboardgridedit.nodes;
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{text().kicker}</p>
    <div class="docs-hero-title">
      <h1>DashboardGrid</h1>
      <Badge tone="neutral">{text().badge}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>

  <section class="docs-section">
    <h2>{text().staticTitle}</h2>
    <TabbedExample nodes={staticNodes} title={text().staticTitle} />
  </section>

  <section class="docs-section">
    <h2>{text().editTitle}</h2>
    <TabbedExample nodes={editNodes} title={text().editTitle} />
  </section>

  <section class="docs-section">
    <h2>{text().apiTitle}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>{text().defaultLabel}</th></tr>
      </thead>
      <tbody>
        <tr><td><code>tiles</code></td><td><code>DashboardGridTile[]</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>columns</code></td><td><code>number</code></td><td><code>12</code></td></tr>
        <tr><td><code>rowHeight</code></td><td><code>number</code></td><td><code>88</code></td></tr>
        <tr><td><code>gap</code></td><td><code>number</code></td><td><code>16</code></td></tr>
        <tr><td><code>editable</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><code>"Dashboard grid"</code></td></tr>
        <tr><td><code>onLayout</code></td><td><code>(tiles) =&gt; void</code></td><td><em>{text().optional}</em></td></tr>
      </tbody>
    </table>
    <p class="docs-demo-note"><code>DashboardGridTile</code> = <code>{`{ id: string; x: number; y: number; w: number; h: number; title?: string; description?: string; value?: string }`}</code></p>
  </section>

  <section class="docs-section">
    <h2>{text().notesTitle}</h2>
    <p class="docs-demo-note">{text().notes}</p>
  </section>
</div>
