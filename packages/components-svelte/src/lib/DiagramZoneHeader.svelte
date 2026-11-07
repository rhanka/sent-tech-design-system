<script lang="ts">
  import DiagramCardHeader from "./DiagramCardHeader.svelte";
  import { ZONE_GEOMETRY, type DiagramGlyphPaths, type LaidOutLine } from "./diagramCardModel.js";

  /**
   * Internal zone header (DC-D1, spec §6.2): the shared `DiagramCardHeader`
   * row (icon 70 at the 16 px inset, kicker over title at the 92 px text
   * inset, toggle in the header slot) plus the subtitle block wrapping
   * under the icon from the left inset. Composed by `DiagramZone`; not a
   * public export.
   */
  interface DiagramZoneHeaderProps {
    kicker: readonly LaidOutLine[];
    title: readonly LaidOutLine[];
    subtitle: readonly LaidOutLine[];
    iconName?: string;
    iconGlyph?: DiagramGlyphPaths;
    headerTextWidth: number;
    /** Subtitle measure: frame width minus both inline insets. */
    subtitleWidth: number;
    toggle?: { collapsed: boolean; label: string; onToggle?: () => void };
    /**
     * Frame-top inset of the toggle (10 px in the frozen SVG) while the
     * header band starts at the 16 px headerInset: forwarded as the toggle
     * slot's top offset.
     */
    toggleTopInset?: number;
  }

  let {
    kicker,
    title,
    subtitle,
    iconName,
    iconGlyph,
    headerTextWidth,
    subtitleWidth,
    toggle,
    toggleTopInset,
  }: DiagramZoneHeaderProps = $props();
</script>

<div class="st-diagramZoneHeader">
  <DiagramCardHeader
    {kicker}
    {title}
    {iconName}
    {iconGlyph}
    {headerTextWidth}
    {toggle}
    toggleTopOffset={toggleTopInset === undefined
      ? undefined
      : toggleTopInset - ZONE_GEOMETRY.headerInset}
  />
  {#if subtitle.length > 0}
    <div class="st-diagramZoneHeader-subtitle" style={`width:${subtitleWidth}px`}>
      {#each subtitle as line, subtitleIndex (subtitleIndex)}
        <span class="st-diagramZone-subtitle">{line.text}</span>
      {/each}
    </div>
  {/if}
</div>

<style>
  .st-diagramZoneHeader {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 0 0 auto;
  }
  .st-diagramZoneHeader-subtitle {
    /* subtitleGap aliases the card gap (§6.4). */
    margin-top: var(--st-component-diagramZone-subtitleGap, var(--st-component-diagramCard-gap, 6px));
    min-width: 0;
  }
  .st-diagramZone-subtitle {
    display: block;
    min-width: 0;
    font-size: var(--st-component-diagramZone-subtitleFontSize, 24px);
    font-weight: var(--st-component-diagramZone-subtitleFontWeight, 400);
    line-height: var(--st-component-diagramZone-subtitleLineHeight, 1.3);
    color: var(--st-component-diagramZone-text, var(--st-semantic-text-primary));
    /* No mid-word break: an over-long word overflows and is diagnosed
       (Astra J4), never silently broken or cut. */
    overflow-wrap: normal;
    word-break: normal;
  }
</style>
