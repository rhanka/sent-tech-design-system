<script lang="ts">
  import type { Snippet } from "svelte";
  import { compileTheme, sentTechTheme, type TenantTheme } from "@sentropic/design-system-themes";

  type ThemeProviderProps = {
    theme?: TenantTheme;
    namespace?: string;
    children?: Snippet;
  };

  let { theme = sentTechTheme, namespace = "st", children }: ThemeProviderProps = $props();

  let css = $derived(compileTheme(theme, { selector: `[data-st-theme="${theme.id}"]`, namespace }));
</script>

<svelte:head>
  {@html `<style data-st-theme-provider="${theme.id}">${css}</style>`}
</svelte:head>

<div data-st-theme={theme.id}>
  {@render children?.()}
</div>
