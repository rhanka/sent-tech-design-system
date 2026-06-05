<script lang="ts" module>
  import type { Snippet } from "svelte";

  export type PortalProps = {
    /**
     * Where to teleport the children. A CSS selector string or an actual
     * `HTMLElement`. Defaults to the document `<body>`.
     */
    target?: string | HTMLElement;
    /** When `true`, render inline in place (no teleportation). */
    disabled?: boolean;
    /** Optional class applied to the portal container element. */
    class?: string;
    children?: Snippet;
  };

  /**
   * Resolve a target prop to an `HTMLElement`. Returns `null` when it cannot be
   * resolved (SSR, missing selector, etc.).
   */
  export function resolvePortalTarget(
    target: string | HTMLElement | undefined
  ): HTMLElement | null {
    if (typeof document === "undefined") return null;
    if (target == null) return document.body;
    if (typeof target === "string") {
      return document.querySelector<HTMLElement>(target) ?? document.body;
    }
    return target;
  }
</script>

<script lang="ts">
  let {
    target = "body",
    disabled = false,
    class: className,
    children
  }: PortalProps = $props();

  // The container that actually holds the children. We render it inline first
  // (so SSR produces markup in place) and move it into the target on mount.
  let container = $state<HTMLDivElement | undefined>();

  $effect(() => {
    // Client-only: never touch the DOM during SSR or before mount.
    if (disabled || !container) return;
    if (typeof document === "undefined") return;

    const destination = resolvePortalTarget(target);
    if (!destination) return;

    destination.appendChild(container);

    return () => {
      // Clean up on unmount / target change: remove the container from the DOM.
      container?.remove();
    };
  });
</script>

{#if disabled}
  <div class={className ? `st-portal ${className}` : "st-portal"} data-st-portal="inline">
    {@render children?.()}
  </div>
{:else}
  <div
    bind:this={container}
    class={className ? `st-portal ${className}` : "st-portal"}
    data-st-portal="teleported"
  >
    {@render children?.()}
  </div>
{/if}

<style>
  .st-portal {
    display: contents;
  }
</style>
