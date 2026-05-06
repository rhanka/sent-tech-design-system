<script lang="ts">
  import "../app.css";
  import { ThemeProvider } from "@sent-tech/components-svelte";
  import { sentTechTheme } from "@sent-tech/themes";

  let { children } = $props();
</script>

<ThemeProvider theme={sentTechTheme}>
  <div class="docs-shell">
    <header class="docs-header">
      <a class="docs-brand" href="/">Sent Tech DS</a>
      <nav class="docs-nav" aria-label="Documentation">
        <a href="/components/button">Button</a>
      </nav>
    </header>
    <main class="docs-main">
      {@render children()}
    </main>
  </div>
</ThemeProvider>
