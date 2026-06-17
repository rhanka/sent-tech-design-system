<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { NavShellSide } from "./NavShell.svelte";

  export interface NavDrawerProps {
    title?: string;
    subtitle?: string;
    label?: string;
    search?: Snippet;
    footer?: Snippet;
    children: Snippet;
    open?: boolean;
    side?: NavShellSide;
    class?: string;
  }
</script>

<script lang="ts">
  import NavShell from "./NavShell.svelte";

  let {
    title,
    subtitle,
    label,
    search,
    footer,
    children,
    open = $bindable(false),
    side = "left",
    class: className
  }: NavDrawerProps = $props();
</script>

<NavShell
  bind:open
  variant="drawer"
  {title}
  {subtitle}
  {label}
  {search}
  {footer}
  {side}
  class={["st-navDrawer", className].filter(Boolean).join(" ")}
>
  {@render children()}
</NavShell>
