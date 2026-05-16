<script lang="ts">
  import "../app.css";
  import { ThemeProvider } from "@sentropic/design-system-svelte";
  import { sentTechTheme } from "@sentropic/design-system-themes";

  let { children } = $props();
</script>

<ThemeProvider theme={sentTechTheme}>
  <div class="docs-shell">
    <header class="docs-header">
      <a class="docs-brand" href="/">Sent Tech DS</a>
      <nav class="docs-nav" aria-label="Documentation">
        <a href="/">Catalogue</a>
        <a href="/components/button">Button</a>
        <a href="/components/forms">Forms</a>
        <a href="/components/overlays">Overlays</a>
        <a href="/components/data-navigation">Data & Nav</a>
        <a href="/components/plan-completion">Plan completion</a>
      </nav>
    </header>
    <main class="docs-main">
      {@render children()}
    </main>
    <footer class="docs-footer">
      <a href="https://github.com/rhanka/sent-tech-design-system" rel="noreferrer" target="_blank">
        github.com/rhanka/sent-tech-design-system
      </a>
      <span>Sent Tech Design System</span>
    </footer>
  </div>
</ThemeProvider>
