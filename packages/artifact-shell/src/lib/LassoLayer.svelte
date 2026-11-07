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
    >
      <div class="st-lassoLayer__fill" aria-hidden="true"></div>
    </div>
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

  /* the border stays at full opacity: the translucent fill lives on a child
     element at a LOWER alpha than blockHighlight.fill (0.16), per §2.5 */
  .st-lassoLayer__band {
    position: absolute;
    border: var(--st-border-width-thin, 1px) solid var(--st-component-lasso-border, var(--st-semantic-border-interactive));
    border-radius: var(--st-radius-sm, 0.25rem);
  }

  .st-lassoLayer__fill {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: var(--st-component-lasso-fill, var(--st-semantic-feedback-info));
    opacity: 0.1;
    pointer-events: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-lassoLayer__band,
    .st-lassoLayer__fill {
      animation-duration: 0s;
      transition-duration: 0s;
    }
  }
</style>
