<script lang="ts">
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";

  const fr = $derived(locale.value === "fr");
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Guide d'intégration" : "Integration guide"}</p>
    <h1>{fr ? "Démarrage rapide" : "Getting started"}</h1>
    <p>
      {fr
        ? "Installez le Design System Sentropic dans votre application en Svelte, React ou Vue."
        : "Install the Sentropic Design System in your Svelte, React, or Vue application."}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr ? "Prérequis" : "Prerequisites"}</h2>
    <p>
      {fr
        ? "Node.js 18+ et npm 9+. Le DS est publié en ESM avec des déclarations TypeScript."
        : "Node.js 18+ and npm 9+. The DS is published as ESM with TypeScript declarations."}
    </p>
    <p>
      {fr
        ? "Choisissez le package correspondant à votre framework :"
        : "Pick the package matching your framework:"}
    </p>
    <div class="gs-framework-grid">
      <div class="gs-framework-card">
        <div class="gs-framework-head">
          <span class="gs-framework-name">Svelte</span>
          <Badge tone="success">v5</Badge>
        </div>
        <code>@sentropic/design-system-svelte</code>
      </div>
      <div class="gs-framework-card">
        <div class="gs-framework-head">
          <span class="gs-framework-name">React</span>
          <Badge tone="info">18+</Badge>
        </div>
        <code>@sentropic/design-system-react</code>
      </div>
      <div class="gs-framework-card">
        <div class="gs-framework-head">
          <span class="gs-framework-name">Vue</span>
          <Badge tone="warning">3</Badge>
        </div>
        <code>@sentropic/design-system-vue</code>
      </div>
    </div>
  </section>

  <section class="docs-section">
    <h2>Svelte</h2>
    <h3>{fr ? "Installation" : "Install"}</h3>
    <pre class="gs-code"><code>npm install @sentropic/design-system-svelte @sentropic/design-system-themes</code></pre>
    <h3>{fr ? "Utilisation" : "Usage"}</h3>
    <p>
      {fr
        ? "Importez le CSS une fois au niveau racine, puis utilisez les composants dans vos fichiers Svelte."
        : "Import the CSS once at the root level, then use the components in your Svelte files."}
    </p>
    <pre class="gs-code"><code>{`<!-- App.svelte ou +layout.svelte -->
<script>
  import { ThemeProvider, Button, Card } from "@sentropic/design-system-svelte";
  import "@sentropic/design-system-svelte/styles.css";
</` + `script>

<ThemeProvider>
  <Card>
    <Button>Action</Button>
  </Card>
</ThemeProvider>`}</code></pre>
  </section>

  <section class="docs-section">
    <h2>React</h2>
    <h3>{fr ? "Installation" : "Install"}</h3>
    <pre class="gs-code"><code>npm install @sentropic/design-system-react @sentropic/design-system-themes</code></pre>
    <h3>{fr ? "Utilisation" : "Usage"}</h3>
    <pre class="gs-code"><code>{`// main.tsx
import { ThemeProvider, Button, Card } from "@sentropic/design-system-react";
import "@sentropic/design-system-react/styles.css";

export function App() {
  return (
    <ThemeProvider>
      <Card>
        <Button>Action</Button>
      </Card>
    </ThemeProvider>
  );
}`}</code></pre>
  </section>

  <section class="docs-section">
    <h2>Vue</h2>
    <h3>{fr ? "Installation" : "Install"}</h3>
    <pre class="gs-code"><code>npm install @sentropic/design-system-vue @sentropic/design-system-themes</code></pre>
    <h3>{fr ? "Utilisation" : "Usage"}</h3>
    <pre class="gs-code"><code>{`<!-- App.vue -->
<script setup>
import { ThemeProvider, Button, Card } from "@sentropic/design-system-vue";
import "@sentropic/design-system-vue/styles.css";
</` + `script>

<template>
  <ThemeProvider>
    <Card>
      <Button>Action</Button>
    </Card>
  </ThemeProvider>
</template>`}</code></pre>
  </section>

  <section class="docs-section">
    <h2>{fr ? "Thèmes" : "Themes"}</h2>
    <p>
      {fr
        ? "Par défaut, ThemeProvider applique le thème Sent Tech. Vous pouvez surcharger avec n'importe quel thème du package :"
        : "By default, ThemeProvider applies the Sent Tech theme. Override with any theme from the package:"}
    </p>
    <pre class="gs-code"><code>{`import { carbonTheme } from "@sentropic/design-system-theme-carbon";
import { dsfrTheme } from "@sentropic/design-system-theme-dsfr";
import { quebecTheme } from "@sentropic/design-system-theme-quebec";

// Passer le thème comme prop :
// <ThemeProvider theme={carbonTheme}>`}</code></pre>
    <p>
      {fr
        ? "Les thèmes disponibles : Sent Tech (défaut), Carbon (IBM), DSFR (France), Québec."
        : "Available themes: Sent Tech (default), Carbon (IBM), DSFR (France), Québec."}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr ? "Étapes suivantes" : "Next steps"}</h2>
    <ul class="gs-checklist">
      <li><a href="/components">{fr ? "Catalogue des composants" : "Component catalog"}</a></li>
      <li><a href="/#tokens">{fr ? "Système de tokens" : "Token system"}</a></li>
      <li><a href="/layouts">{fr ? "Gabarits de pages" : "Page layouts"}</a></li>
      <li><a href="/views">{fr ? "Vues métier" : "Domain views"}</a></li>
    </ul>
  </section>
</div>

<style>
  .gs-framework-grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
    margin: 1rem 0 2rem;
  }

  .gs-framework-card {
    background: var(--st-semantic-surface-subtle, #f8fafc);
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.5rem;
    display: grid;
    gap: 0.5rem;
    padding: 1rem 1.25rem;
  }

  .gs-framework-head {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    justify-content: space-between;
  }

  .gs-framework-name {
    font-weight: 600;
  }

  .gs-code {
    background: var(--st-semantic-surface-subtle, #f1f5f9);
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.375rem;
    font-family: var(--st-foundation-font-mono, monospace);
    font-size: 0.875rem;
    line-height: 1.6;
    margin: 0.75rem 0 1.5rem;
    overflow-x: auto;
    padding: 1rem 1.25rem;
    white-space: pre;
  }

  .gs-checklist {
    display: grid;
    gap: 0.5rem;
    padding-left: 1.25rem;
  }

  .gs-checklist a {
    color: var(--st-semantic-text-accent, #2563eb);
    text-decoration: none;
  }

  .gs-checklist a:hover {
    text-decoration: underline;
  }
</style>
