<script lang="ts" module>
  export type { LassoLayerEvents, LassoLayerProps } from "./types.js";
</script>

<script lang="ts">
  import type { LassoLayerProps } from "./types.js";

  // §5.3b — rubber band only. Render-only in AS-1 (LassoLayerEvents =
  // Record<string, never>): no scoring, no intersection logic, no gesture
  // interpretation; lasso end/cancel routing lives in LassoLayerHostHandlers
  // owned by the adapter. The component renders whatever rect the runtime
  // passes during the gesture.
  let { active, rect }: LassoLayerProps = $props();
</script>

{#if active && rect}
  <div class="st-lassoLayer" data-st-shell="lasso-layer">
    <div
      class="st-lassoLayer__band"
      aria-hidden="true"
      style:left="{rect.x}px"
      style:top="{rect.y}px"
      style:width="{rect.width}px"
      style:height="{rect.height}px"
    ></div>
  </div>
{/if}

<style>
  /* §5.5 layering: lasso shares the lowest layer with the highlight (z 1) */
  .st-lassoLayer {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 1;
  }

  .st-lassoLayer__band {
    position: absolute;
    border: 1px solid var(--st-component-lasso-border, var(--st-semantic-border-interactive));
    background: var(--st-component-lasso-fill, var(--st-semantic-feedback-info));
    opacity: 0.24;
    border-radius: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-lassoLayer__band {
      animation-duration: 0s;
      transition-duration: 0s;
    }
  }
</style>
