<script lang="ts" module>
  export type { BlockCandidateListEvents, BlockCandidateListProps } from "./types.js";

  // unique heading id per mounted list (aria-labelledby target)
  let headingCounter = 0;
</script>

<script lang="ts">
  import type {
    BlockCandidateListEvents,
    BlockCandidateListProps,
    OpaqueKey
  } from "./types.js";

  // §5.3c — controlled listbox for the ambiguous-lasso / no-pointer route.
  // The component renders activeKey as the active row and emits
  // onActiveKeyChange on arrow keys; it never invents an active key. No live
  // region here: cycling announcements are computed by the adapter into
  // CommentModeStatus.announcementText.
  let {
    open,
    candidates,
    activeKey,
    selectedKey,
    headingLabel,
    onPickBlock,
    onActiveKeyChange,
    onAnchor,
    onClose
  }: BlockCandidateListProps & BlockCandidateListEvents = $props();

  const headingId = `st-blockCandidateList-heading-${++headingCounter}`;

  let listEl: HTMLElement | null = $state(null);

  function rowClass(block: (typeof candidates)[number]): string {
    let cls = "st-blockCandidateList__row";
    if (block.key === activeKey) cls += " st-blockCandidateList__row--active";
    if (block.key === selectedKey) cls += " st-blockCandidateList__row--selected";
    return cls;
  }

  // Clamp, no wrap. activeKey null → Down = first, Up = last; empty
  // candidates → null (caller emits nothing, no preventDefault).
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
      onActiveKeyChange(next);
      return;
    }
    // Home/End are listbox row navigation (inside-component), distinct from
    // the §5.2 paging-key rule which applies to the status
    if (event.key === "Home" || event.key === "End") {
      if (candidates.length === 0) return;
      event.preventDefault();
      onActiveKeyChange(event.key === "Home" ? candidates[0].key : candidates[candidates.length - 1].key);
      return;
    }
    if (event.key === "Enter") {
      if (activeKey === null) return;
      event.preventDefault();
      onAnchor(activeKey);
      return;
    }
    if (event.key === "Escape") {
      // its own stage — never also an exit request
      event.preventDefault();
      onClose();
      return;
    }
  }

  // focus follows the controlled activeKey, but only while focus is already
  // inside the list (the component never steals focus)
  $effect(() => {
    const key = activeKey;
    if (!open || key === null || !listEl) return;
    if (!listEl.contains(document.activeElement)) return;
    const index = candidates.findIndex((candidate) => candidate.key === key);
    if (index === -1) return;
    const row = listEl.querySelectorAll('[role="option"]')[index] as HTMLElement | undefined;
    row?.focus();
  });
</script>

{#if open}
  <div
    class="st-blockCandidateList"
    data-st-shell="block-candidate-list"
    role="listbox"
    aria-labelledby={headingId}
    tabindex="-1"
    onkeydown={handleKeydown}
    bind:this={listEl}
  >
    <div class="st-blockCandidateList__heading" id={headingId}>{headingLabel}</div>
    {#each candidates as block (block.key)}
      <!-- §5.3c: rows are options of the listbox; the keyboard contract
           (arrows / Home / End / Enter / Esc) lives on the listbox root
           above, so the row itself carries no key handler. -->
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <div
        class={rowClass(block)}
        role="option"
        aria-selected={block.key === selectedKey}
        tabindex={block.key === activeKey ? 0 : -1}
        data-block-key={block.key}
        onclick={() => onPickBlock(block.key)}
      >
        <span class="st-blockCandidateList__label">{block.label}</span>
        <span class="st-blockCandidateList__kind">{block.kindLabel}</span>
        {#if block.threadCount > 0}
          <span class="st-blockCandidateList__count">{block.threadCount}</span>
        {/if}
      </div>
    {/each}
  </div>
{/if}

<style>
  /* §5.5 layering: the candidate list (z 2) sits above highlight/lasso
     (z 1) and below the status bar (z 3) */
  .st-blockCandidateList {
    position: absolute;
    z-index: 2;
    display: flex;
    flex-direction: column;
    max-height: calc(var(--st-spacing-16, 4rem) * 4);
    overflow-y: auto;
    background: var(--st-component-blockCandidateList-background, var(--st-semantic-surface-raised));
    border: var(--st-border-width-thin, 1px) solid var(--st-component-blockCandidateList-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-radius-md, 0.375rem);
    color: var(--st-semantic-text-primary);
  }

  /* foundation focus primitive on the focusable list root, same as the rows */
  .st-blockCandidateList:focus-visible {
    outline: var(--st-focus-width, 2px) solid var(--st-semantic-border-interactive);
    outline-offset: var(--st-focus-offset, 2px);
  }

  .st-blockCandidateList__heading {
    padding: var(--st-spacing-1, 0.25rem) var(--st-spacing-3, 0.75rem);
    font-weight: var(--st-font-weight-semibold, 600);
    border-bottom: var(--st-border-width-thin, 1px) solid var(--st-semantic-border-subtle);
  }

  .st-blockCandidateList__row {
    display: flex;
    align-items: baseline;
    gap: var(--st-spacing-2, 0.5rem);
    padding: var(--st-spacing-1, 0.25rem) var(--st-spacing-3, 0.75rem);
    cursor: pointer;
  }

  /* active row: background token AND a non-colour cue (inset bar) */
  .st-blockCandidateList__row--active {
    background: var(--st-component-blockCandidateList-rowActiveBackground, var(--st-semantic-surface-subtle));
    box-shadow: inset var(--st-border-width-thick, 2px) 0 0 var(--st-semantic-border-interactive);
  }

  /* selected row: background token AND a non-colour cue (weight) plus
     aria-selected — never colour alone */
  .st-blockCandidateList__row--selected {
    background: var(--st-component-blockCandidateList-rowSelectedBackground, var(--st-semantic-surface-subtle));
    font-weight: var(--st-font-weight-semibold, 600);
  }

  .st-blockCandidateList__row:focus-visible {
    outline: var(--st-focus-width, 2px) solid var(--st-semantic-border-interactive);
    outline-offset: var(--st-focus-offset, 2px);
  }

  .st-blockCandidateList__kind,
  .st-blockCandidateList__count {
    color: var(--st-semantic-text-secondary);
  }

  .st-blockCandidateList__count {
    margin-left: auto;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-blockCandidateList,
    .st-blockCandidateList__row {
      animation-duration: 0s;
      transition-duration: 0s;
    }
  }
</style>
