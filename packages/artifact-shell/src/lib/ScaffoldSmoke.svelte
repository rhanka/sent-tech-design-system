<script lang="ts">
  import { ThemeProvider } from "@sentropic/design-system-svelte";
  import type { BlockDisplay } from "./types.js";

  // AS-0-only smoke component: proves token resolution, ThemeProvider scoping
  // and the test harness. Not exported from the barrel; carries no §5
  // contract.
  type ScaffoldSmokeProps = {
    block: BlockDisplay;
  };

  let { block }: ScaffoldSmokeProps = $props();
</script>

<ThemeProvider>
  <div class="st-scaffoldSmoke" data-st-shell="scaffold-smoke">
    <span class="st-scaffoldSmoke__label">{block.label}</span>
  </div>
</ThemeProvider>

<style>
  .st-scaffoldSmoke {
    background: var(--st-component-blockHighlight-chipBackground, var(--st-semantic-surface-raised));
    color: var(--st-component-blockHighlight-chipText, var(--st-semantic-text-primary));
    padding: var(--st-spacing-2, 0.5rem) var(--st-spacing-3, 0.75rem);
  }
</style>
