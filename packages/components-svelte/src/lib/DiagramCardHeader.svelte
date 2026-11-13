<script lang="ts">
  import { getDiagramGlyph } from "./diagram-icons/registry.js";
  import IconButton from "./IconButton.svelte";
  import { Minus, Plus } from "@lucide/svelte";
  import type { DiagramGlyphPaths, LaidOutLine } from "./diagramCardModel.js";

  /**
   * Internal shared header row (DC-D1): icon box, kicker over title, toggle
   * slot. Composed by `DiagramCard` and (DC-2) by `DiagramZoneHeader`, so
   * zone and card headers cannot diverge in size, spacing or typography.
   * Not a public export: exercised through `DiagramCard`.
   */
  interface DiagramCardHeaderProps {
    kicker: readonly LaidOutLine[];
    title: readonly LaidOutLine[];
    iconName?: string;
    iconGlyph?: DiagramGlyphPaths;
    /** Width the title/kicker block may take (toggle-aware). */
    headerTextWidth: number;
    /**
     * Header row height from the shared model (`headerSlotGeometry`, review
     * pass 2 item 10): `max(icon 70, kicker+title)` with an icon, the bare
     * kicker+title line boxes without one. Applied here as the row height so
     * the Svelte header places the body exactly where `layoutCard` /
     * `layoutZone` and the SVG renderers place it.
     */
    headerBlockHeight: number;
    toggle?: { collapsed: boolean; label: string; onToggle?: () => void };
    /**
     * Extra px the toggle slot is pulled up (zone expanded: the toggle sits
     * at frame top + 10 while the header band starts at + 16, so −6).
     */
    toggleTopOffset?: number;
  }

  let {
    kicker,
    title,
    iconName,
    iconGlyph = iconName === undefined || iconName === "none" ? undefined : getDiagramGlyph(iconName) ?? getDiagramGlyph("unknown"),
    headerTextWidth,
    headerBlockHeight,
    toggle,
    toggleTopOffset,
  }: DiagramCardHeaderProps = $props();
</script>

<div class="st-diagramCardHeader" style={`height:${headerBlockHeight}px`}>
  {#if iconName !== undefined && iconName !== "none" && iconGlyph !== undefined}
    <svg
      class="st-diagramCardHeader-icon"
      data-diagram-icon={iconName}
      viewBox="0 0 64 64"
      width="70"
      height="70"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M8 53L32 44L56 53L32 62Z"
        fill="var(--st-component-diagramIcon-baseFill, color-mix(in srgb, var(--st-semantic-feedback-info) 18%, var(--st-semantic-surface-raised)))"
      />
      <path
        d={iconGlyph.face}
        fill="var(--st-component-diagramIcon-faceFill, color-mix(in srgb, var(--st-semantic-feedback-info) 75%, var(--st-semantic-surface-raised)))"
        stroke="var(--st-component-diagramIcon-faceStroke, var(--st-semantic-feedback-info))"
        stroke-width="1.5"
        stroke-linejoin="round"
      />
      {#if iconGlyph.line !== undefined}
        <path
          d={iconGlyph.line}
          fill="none"
          stroke={iconGlyph.darkLine === true
            ? "var(--st-component-diagramIcon-lineDarkStroke, var(--st-semantic-feedback-info))"
            : "var(--st-component-diagramIcon-lineStroke, var(--st-semantic-surface-raised))"}
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      {/if}
      {#if iconGlyph.text !== undefined}
        <text
          x="32"
          y="47"
          text-anchor="middle"
          fill="var(--st-component-diagramIcon-lineStroke, var(--st-semantic-surface-raised))"
          font-size="13"
          font-weight="750"
        >{iconGlyph.text}</text>
      {/if}
    </svg>
  {/if}
  <div class="st-diagramCardHeader-text" style={`width:${headerTextWidth}px`}>
    {#each kicker as line, kickerIndex (kickerIndex)}
      <span class="st-diagramCard-kicker">{line.text}</span>
    {/each}
    {#each title as line, titleIndex (titleIndex)}
      <span class="st-diagramCard-title">{line.text}</span>
    {/each}
  </div>
  {#if toggle !== undefined}
    <div
      class="st-diagramCard-toggle"
      style={`top:${toggleTopOffset === undefined ? "calc(var(--st-component-diagramZone-toggleInset, 8px) - var(--st-component-diagramCard-borderWidth, 2px))" : 'calc(var(--st-component-diagramZone-toggleInset, 8px) - var(--st-component-diagramZone-headerInset, 16px) - var(--st-component-diagramZone-borderWidth, 1.5px))'};right:${toggleTopOffset === undefined ? "calc(var(--st-component-diagramZone-toggleInset, 8px) - var(--st-component-diagramCard-borderWidth, 2px))" : 'calc(var(--st-component-diagramZone-toggleInset, 8px) - var(--st-component-diagramZone-headerInset, 16px) - var(--st-component-diagramZone-borderWidth, 1.5px))'}`}

    >
      <IconButton
        size="sm"
        variant="ghost"
        aria-label={toggle.label}
        aria-expanded={!toggle.collapsed}
        onclick={toggle.onToggle}
      >
        {#if toggle.collapsed}
          <Plus size="var(--st-component-button-anatomy-density-sm-fontSize)" aria-hidden="true" />
        {:else}
          <Minus size="var(--st-component-button-anatomy-density-sm-fontSize)" aria-hidden="true" />
        {/if}
      </IconButton>
    </div>
  {/if}
</div>

<style>
  .st-diagramCardHeader {
    display: flex;
    align-items: center;
    gap: var(--st-component-diagramCard-iconTextGap, 6px);
    min-width: 0;
    flex: 0 0 auto;
  }
  .st-diagramCardHeader-icon {
    flex: 0 0 var(--st-component-diagramCard-iconSize, 70px);
    width: var(--st-component-diagramCard-iconSize, 70px);
    height: var(--st-component-diagramCard-iconSize, 70px);
  }
  .st-diagramCardHeader-text {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-width: 0;
    flex: 0 1 auto;
  }
  .st-diagramCard-kicker {
    display: block;
    min-width: 0;
    font-size: var(--st-component-diagramCard-kickerFontSize, 22px);
    font-weight: var(--st-component-diagramCard-kickerFontWeight, 400);
    line-height: var(--st-component-diagramCard-kickerLineHeight, 1.3);
    letter-spacing: var(--st-component-diagramCard-kickerLetterSpacing, 0.04em);
    text-transform: var(--st-component-diagramCard-kickerTextTransform, uppercase);
    color: var(--st-component-diagramCard-secondaryText, var(--st-semantic-text-secondary));
    /* No mid-word break: an over-long word is diagnosed, never broken. */
    overflow-wrap: normal;
    word-break: normal;
  }
  .st-diagramCard-title {
    display: block;
    min-width: 0;
    font-size: var(--st-component-diagramCard-titleFontSize, 32px);
    font-weight: var(--st-component-diagramCard-titleFontWeight, 700);
    line-height: var(--st-component-diagramCard-titleLineHeight, 1.3);
    color: var(--st-component-diagramCard-text, var(--st-semantic-text-primary));
    overflow-wrap: normal;
    word-break: normal;
  }
  .st-diagramCard-toggle {
    position: absolute;
    width: var(--st-component-diagramCard-toggleBoxSize, 32px);
    height: var(--st-component-diagramCard-toggleBoxSize, 32px);
  }
</style>
