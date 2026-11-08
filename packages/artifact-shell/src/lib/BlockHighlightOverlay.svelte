<script lang="ts" module>
  export type { BlockHighlightOverlayEvents, BlockHighlightOverlayProps } from "./types.js";
</script>

<script lang="ts">
  import { foundation } from "@sentropic/design-system-tokens";
  import type {
    BlockDisplay,
    BlockHighlightOverlayEvents,
    BlockHighlightOverlayProps
  } from "./types.js";

  // §5.3a — rectangle-only highlight layer. No hit-testing, no block
  // resolution, no anchor logic: hover/click hit-testing lives in the AC-9
  // host hit layer (BlockHighlightOverlayHostHandlers); the component emits
  // only onAnchor from the chip. Rect elements carry no handlers.
  let {
    hovered,
    selected,
    chipLabel,
    onAnchor
  }: BlockHighlightOverlayProps & BlockHighlightOverlayEvents = $props();

  // Fixed dual stroke fallbacks (spec §2.5): one dark + one light stroke so
  // the combined outline holds >= 3:1 against an unknown authored page. The
  // values come from the foundation token table at runtime — no colour
  // literal appears in this source (import-graph gate item 6).
  const outlineDarkFallback = foundation.color.slate[90];
  const outlineLightFallback = foundation.color.slate[0];
</script>

{#snippet highlight(block: BlockDisplay, modifier: "hover" | "selected")}
  <div
    class="st-blockHighlightOverlay__rect st-blockHighlightOverlay__rect--{modifier}"
    style:left="{block.rect.x}px"
    style:top="{block.rect.y}px"
    style:width="{block.rect.width}px"
    style:height="{block.rect.height}px"
  >
    <span class="st-blockHighlightOverlay__stroke st-blockHighlightOverlay__stroke--dark" aria-hidden="true"></span>
    <span class="st-blockHighlightOverlay__stroke st-blockHighlightOverlay__stroke--light" aria-hidden="true"></span>
    <span class="st-blockHighlightOverlay__fill" aria-hidden="true"></span>
    <button
      type="button"
      class="st-blockHighlightOverlay__chip"
      tabindex="-1"
      onclick={() => onAnchor()}
    >
      <span class="st-blockHighlightOverlay__chipLabel">{chipLabel}</span>
      {#if block.threadCount > 0}
        <span class="st-blockHighlightOverlay__chipCount">{block.threadCount}</span>
      {/if}
    </button>
  </div>
{/snippet}

{#if hovered || selected}
  <div
    class="st-blockHighlightOverlay"
    data-st-shell="block-highlight-overlay"
    style:--st-shell-outline-dark={outlineDarkFallback}
    style:--st-shell-outline-light={outlineLightFallback}
  >
    {#if hovered}
      {@render highlight(hovered, "hover")}
    {/if}
    {#if selected}
      {@render highlight(selected, "selected")}
    {/if}
  </div>
{/if}

<style>
  /* §5.5 layering: highlight/lasso (z 1) below the candidate list (z 2) and
     the status bar (z 3). The root never intercepts pointer events; only the
     chip does, so pins (AS-2) above it stay hit-testable. */
  .st-blockHighlightOverlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 1;
  }

  .st-blockHighlightOverlay__rect {
    position: absolute;
  }

  /* dual-tone outline: dark stroke at the rect edge, light stroke inset by
     the dark stroke's own width — combined >= 2 px against any authored page.
     The weights are the §2.5 fixed dual values, read through the foundation
     border-width tokens with those values as fallbacks */
  .st-blockHighlightOverlay__stroke {
    position: absolute;
    border-style: solid;
    pointer-events: none;
  }

  .st-blockHighlightOverlay__stroke--dark {
    inset: 0;
    border-width: var(--st-border-width-thin, 1px);
    border-color: var(--st-component-blockHighlight-outlineDark, var(--st-shell-outline-dark));
  }

  .st-blockHighlightOverlay__stroke--light {
    inset: var(--st-border-width-thin, 1px);
    border-width: var(--st-border-width-thin, 1px);
    border-color: var(--st-component-blockHighlight-outlineLight, var(--st-shell-outline-light));
  }

  /* translucent fill: semantic feedback colour at reduced opacity (opacity,
     never a colour literal or color-mix) */
  .st-blockHighlightOverlay__fill {
    position: absolute;
    inset: 0;
    background: var(--st-component-blockHighlight-fill, var(--st-semantic-feedback-info));
    opacity: 0.16;
    pointer-events: none;
  }

  /* selected treatment: heavier dual outline + stronger fill + modifier class
     — distinguishable from hover by outline WEIGHT, never colour/alpha alone.
     The light stroke insets by the increased dark width so it cannot occlude
     the weight increase (hover 1+1 px, selected 2+1 px) */
  .st-blockHighlightOverlay__rect--selected .st-blockHighlightOverlay__stroke--dark {
    border-width: var(--st-border-width-thick, 2px);
    border-color: var(--st-component-blockHighlight-selectedOutlineDark, var(--st-shell-outline-dark));
  }

  .st-blockHighlightOverlay__rect--selected .st-blockHighlightOverlay__stroke--light {
    inset: var(--st-border-width-thick, 2px);
    border-color: var(--st-component-blockHighlight-selectedOutlineLight, var(--st-shell-outline-light));
  }

  .st-blockHighlightOverlay__rect--selected .st-blockHighlightOverlay__fill {
    background: var(--st-component-blockHighlight-selectedFill, var(--st-semantic-feedback-info));
    opacity: 0.24;
  }

  /* the action chip: the only pointer target of the overlay, and a pointer
     affordance only — not in the Tab order (the keyboard route is the status
     cycle + Enter). It sits INSIDE the block rect (top/right inset): scope
     §6.4 F2 returns Hover → Armed and clears the highlight when the pointer
     leaves every stamped block, so a chip outside block.rect unmounts on
     approach before it can be clicked. The spec fixes no exact placement;
     its only placement clauses are that the overlay root never captures
     pointer events and never covers the chip's own rect with a capturing
     layer (§5.3a) — an in-rect chip satisfies both. */
  .st-blockHighlightOverlay__chip {
    position: absolute;
    top: var(--st-spacing-1, 0.25rem);
    right: var(--st-spacing-1, 0.25rem);
    display: inline-flex;
    align-items: center;
    gap: var(--st-spacing-1, 0.25rem);
    padding: calc(var(--st-spacing-1, 0.25rem) / 2) var(--st-spacing-2, 0.5rem);
    border: var(--st-border-width-thin, 1px) solid var(--st-semantic-border-subtle);
    border-radius: var(--st-radius-md, 0.375rem);
    background: var(--st-component-blockHighlight-chipBackground, var(--st-semantic-surface-raised));
    color: var(--st-component-blockHighlight-chipText, var(--st-semantic-text-primary));
    font: inherit;
    cursor: pointer;
    pointer-events: auto;
  }

  .st-blockHighlightOverlay__chipCount {
    font-weight: var(--st-font-weight-semibold, 600);
  }

  @media (prefers-reduced-motion: reduce) {
    .st-blockHighlightOverlay,
    .st-blockHighlightOverlay__chip {
      animation-duration: 0s;
      transition-duration: 0s;
    }
  }
</style>
