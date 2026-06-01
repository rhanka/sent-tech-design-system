<script lang="ts">
  import { Badge, CodeSnippet } from "@sentropic/design-system-svelte";

  const installCommand =
    "npm install @sentropic/design-system-react @sentropic/design-system-themes react react-dom";

  const usageExample = `import { Button, Card, ThemeProvider } from "@sentropic/design-system-react";
import "@sentropic/design-system-react/styles.css";

export function ReleasePanel() {
  return (
    <ThemeProvider>
      <Card>
        <strong>Release plan</strong>
        <Button>Open plan</Button>
      </Card>
    </ThemeProvider>
  );
}`;

  const coverageRows = [
    {
      surface: "Exports publics",
      status: "Complet",
      evidence: "Le package React couvre le catalogue Svelte public hors ThemeProvider."
    },
    {
      surface: "Props TypeScript",
      status: "Complet",
      evidence: "Les declarations sont produites dans dist/index.d.ts."
    },
    {
      surface: "CSS partage",
      status: "Complet",
      evidence: "styles.css reprend la couche visuelle commune du DS."
    },
    {
      surface: "Themes",
      status: "Complet",
      evidence: "ThemeProvider accepte les themes Sentropic, DSFR, Carbon et Airbus."
    }
  ];

  const behaviorRows = [
    {
      group: "Navigation",
      components: "Tabs, Accordion, Pagination",
      evidence: "src/behavior.test.tsx"
    },
    {
      group: "Overlays",
      components: "Modal, Drawer, Popover, Tooltip, Toggletip",
      evidence: "src/behavior.test.tsx"
    },
    {
      group: "Menus",
      components: "Menu, Dropdown, OverflowMenu",
      evidence: "src/behavior.test.tsx"
    },
    {
      group: "Form controls",
      components: "Checkbox, Radio, Toggle, Switch, Combobox, MultiSelect",
      evidence: "src/behavior.test.tsx"
    },
    {
      group: "Feedback",
      components: "Toast",
      evidence: "src/behavior.test.tsx"
    }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Framework</p>
    <div class="docs-hero-title">
      <h1>React</h1>
      <Badge tone="success">Public-ready</Badge>
    </div>
    <p>
      Implementation React du catalogue Sentropic, avec les memes tokens, themes et classes
      de composants que la version Svelte.
    </p>
  </section>

  <section class="docs-section">
    <h2>React package</h2>
    <p>
      Le package expose des composants React purs, sans dependance headless, et garde React
      et React DOM en peer dependencies.
    </p>
    <CodeSnippet code={installCommand} language="bash" />
  </section>

  <section class="docs-section">
    <h2>Exemple minimal</h2>
    <p>
      Importez la feuille de styles une fois au point d'entree de l'application ou de la
      preview, puis encapsulez les composants dans <code>ThemeProvider</code>.
    </p>
    <CodeSnippet code={usageExample} language="tsx" />
  </section>

  <section class="docs-section">
    <h2>Contrat de surface</h2>
    <table class="docs-table">
      <thead>
        <tr>
          <th>Surface</th>
          <th>Statut</th>
          <th>Preuve</th>
        </tr>
      </thead>
      <tbody>
        {#each coverageRows as row}
          <tr>
            <td>{row.surface}</td>
            <td><Badge tone="success">{row.status}</Badge></td>
            <td>{row.evidence}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>Couverture comportementale</h2>
    <p>
      Les composants interactifs prioritaires ont une garde jsdom qui verifie clavier, focus,
      ARIA et callbacks controles.
    </p>
    <table class="docs-table">
      <thead>
        <tr>
          <th>Groupe</th>
          <th>Composants</th>
          <th>Test</th>
        </tr>
      </thead>
      <tbody>
        {#each behaviorRows as row}
          <tr>
            <td>{row.group}</td>
            <td>{row.components}</td>
            <td><code>{row.evidence}</code></td>
          </tr>
        {/each}
      </tbody>
    </table>
  </section>
</div>
