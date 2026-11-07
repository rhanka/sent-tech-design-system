<script lang="ts">
  import DiagramCardHeader from "./DiagramCardHeader.svelte";
  import type { DiagramGlyphPaths, LaidOutLine } from "./diagramCardModel.js";

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
  }
</style>
