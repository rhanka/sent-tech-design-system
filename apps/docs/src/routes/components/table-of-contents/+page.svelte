<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const items = [
    { id: "intro", label: "Intro", level: 1 },
    { id: "usage", label: "Utilisation", level: 1 },
    { id: "nested", label: "Niveau 2", level: 2 },
    { id: "api", label: "API", level: 1 },
    { id: "acc", label: "Accessibilité", level: 1 }
  ];

  // Démos décrites en arbre NodeSpec neutre -> rendues dans le framework actif
  // (toute la page bascule, pas seulement le bloc « Aperçu live »).
  const presentationDemo: NodeSpec[] = [
    { comp: "TableOfContents", props: { items, title: "Sur cette page", activeId: "intro" } }
  ];

  const usageDemo: NodeSpec[] = [
    { comp: "TableOfContents", props: { items, title: "Sommaire", activeId: "usage" } }
  ];

  const hierarchyDemo: NodeSpec[] = [
    {
      comp: "TableOfContents",
      props: {
        items: [
          { id: "intro", label: "Intro", level: 1 },
          { id: "usage", label: "Utilisation", level: 1 },
          { id: "nested", label: "Niveau secondaire", level: 2 },
          { id: "api-3", label: "Niveau tertiaire", level: 3 },
          { id: "api", label: "API", level: 1 }
        ],
        title: "Sommaire hiérarchique",
        activeId: "intro"
      }
    }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Navigation</p>
    <div class="docs-hero-title">
      <h1>TableOfContents</h1>
      <Badge tone="neutral">Documenté</Badge>
    </div>
    <p>
      <code>TableOfContents</code> affiche une table d’ancres structurée avec
      niveaux hiérarchiques. Idéal pour guider la navigation verticale des longues pages.
    </p>
  </section>


  <section class="docs-section" id="intro">
    <h2>Présentation</h2>
    <TabbedExample nodes={presentationDemo} title="Présentation" />
  </section>

  <section class="docs-section" id="usage">
    <h2>Cas d’usage</h2>
    <TabbedExample nodes={usageDemo} title="Cas d’usage" />
    <p class="docs-demo-note">
      L’identifiant actif est purement déclaratif (via <code>activeId</code>) dans cette version.
      Les ancres sont générées avec <code>href=&quot;#&lt;id&gt;&quot;</code>.
    </p>
  </section>

  <section class="docs-section" id="nested">
    <h2>Hiérarchie</h2>
    <TabbedExample nodes={hierarchyDemo} title="Sommaire hiérarchique" />
    <p class="docs-demo-note">Les niveaux inférieurs gagnent une indentation visuelle.</p>
  </section>

  <section class="docs-section" id="api">
    <h2>API</h2>
    <table class="docs-table">
      <thead>
        <tr>
          <th>Prop</th>
          <th>Type</th>
          <th>Défaut</th>
          <th>Effet</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>items</code></td>
          <td><code>TableOfContentsItem[]</code></td>
          <td>obligatoire</td>
          <td>Pivots du sommaire</td>
        </tr>
        <tr>
          <td><code>activeId</code></td>
          <td><code>string</code></td>
          <td>obligatoire</td>
          <td>Item actif visuel via <code>aria-current</code></td>
        </tr>
        <tr>
          <td><code>title</code></td>
          <td><code>string</code></td>
          <td>""</td>
          <td>Intitulé optionnel du bloc</td>
        </tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section" id="acc">
    <h2>Accessibilité</h2>
    <ul class="docs-token-list">
      <li>Le conteneur expose un <code>nav</code> avec <code>aria-label</code> explicite.</li>
      <li>Chaque entrée est un lien classique avec <code>href=#id</code>.</li>
      <li>Le repère actif porte <code>aria-current="location"</code>.</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>Type</h2>
    <p>
      Export Svelte: <code>TableOfContentsItem</code> contient <code>id</code>, <code>label</code>,
      et <code>level?</code> (1 = racine, 2/3 = indentations).
    </p>
  </section>
</div>
