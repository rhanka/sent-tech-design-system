<script lang="ts" module>
  export type { CommentModeStatusEvents, CommentModeStatusProps } from "./types.js";
</script>

<script lang="ts">
  import type { CommentModeStatusEvents, CommentModeStatusProps, OpaqueKey } from "./types.js";

  // §5.2 — slim status bar above the frame, outside any header. Controlled:
  // mode state arrives as props, intent leaves as events. The keydown
  // listener lives on this root only (never window), so arrows are captured
  // exactly while focus is inside the status.
  let {
    visible,
    statusText,
    announcementText,
    hintText,
    candidates,
    activeKey,
    onExitRequest,
    onCycleBlock,
    onAnchor
  }: CommentModeStatusProps & CommentModeStatusEvents = $props();

  // Clamp, no wrap (§5.2 freeze). activeKey null → Down = first, Up = last.
  // Empty candidates → null (caller emits nothing, no preventDefault).
  function neighbour(arrow: "ArrowDown" | "ArrowUp"): OpaqueKey | null {
    if (candidates.length === 0) return null;
    if (activeKey === null) {
      return arrow === "ArrowDown" ? candidates[0].key : candidates[candidates.length - 1].key;
    }
    const index = candidates.findIndex((candidate) => candidate.key === activeKey);
    if (index === -1) {
      return arrow === "ArrowDown" ? candidates[0].key : candidates[candidates.length - 1].key;
    }
    if (arrow === "ArrowDown") return candidates[Math.min(index + 1, candidates.length - 1)].key;
    return candidates[Math.max(index - 1, 0)].key;
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      const next = neighbour(event.key);
      if (next === null) return;
      event.preventDefault();
      onCycleBlock(next);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      onAnchor();
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      onExitRequest();
      return;
    }
    // PageUp/PageDown/Home/End and every other key are never captured.
  }
</script>

{#if visible}
  <!-- §5.2 mandates no ARIA role on this root: it is a programmatic focus
       target (tabindex=-1) whose keydown contract (arrows / Enter / staged
       Esc, §7.2) is handled here. -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="st-commentModeStatus"
    data-st-shell="comment-mode-status"
    tabindex="-1"
    onkeydown={handleKeydown}
  >
    <span class="st-commentModeStatus__status">{statusText}</span>
    {#if hintText !== undefined}
      <span class="st-commentModeStatus__hint">{hintText}</span>
    {/if}
    <span class="st-commentModeStatus__live" aria-live="polite">{announcementText}</span>
  </div>
{/if}

<style>
  .st-commentModeStatus {
    position: relative;
    z-index: 3;
    display: flex;
    align-items: baseline;
    gap: var(--st-spacing-2, 0.5rem);
    padding: var(--st-spacing-1, 0.25rem) var(--st-spacing-3, 0.75rem);
    background: var(--st-component-commentModeStatus-background, var(--st-semantic-surface-raised));
    color: var(--st-component-commentModeStatus-text, var(--st-semantic-text-primary));
    border-bottom: var(--st-border-width-thin, 1px) solid var(--st-component-commentModeStatus-border, var(--st-semantic-border-subtle));
    transition:
      background-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
  }

  /* foundation focus primitive: 2 px outline, 2 px offset, interactive border
     token — no shell-specific ring */
  .st-commentModeStatus:focus-visible {
    outline: var(--st-focus-width, 2px) solid var(--st-semantic-border-interactive);
    outline-offset: var(--st-focus-offset, 2px);
  }

  .st-commentModeStatus__status {
    font-weight: var(--st-font-weight-semibold, 600);
  }

  .st-commentModeStatus__hint {
    color: var(--st-semantic-text-secondary);
  }

  /* the single polite live region: visually hidden, text-only */
  .st-commentModeStatus__live {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-commentModeStatus {
      animation-duration: 0s;
      transition-duration: 0s;
    }
  }
</style>
