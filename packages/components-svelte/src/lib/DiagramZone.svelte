<script lang="ts">
  import type { Snippet } from "svelte";
  import DiagramCard from "./DiagramCard.svelte";
  import DiagramZoneHeader from "./DiagramZoneHeader.svelte";
  import {
    ZONE_GEOMETRY,
    defaultCardMeasure,
    layoutZone,
    zoneCollapsedCardProps,
    type CardLineMeasure,
    type DiagramZoneProps as DiagramZoneData,
    type ZoneDiagnostic,
  } from "./diagramCardModel.js";

  /**
   * `DiagramZone` — the wrapping diagram card (DC-2, spec §6).
   *
   * Collapsed, the zone IS the atomic card (§6.2): `DiagramCard` with the
   * subtitle as the centred body, the footer pinning the rule, and the
   * "+" `IconButton` in the top-right toggle slot. Expanded, the component
   * paints the frame, the shared header (`DiagramZoneHeader` =
   * `DiagramCardHeader` + subtitle), the header rule and the toggle around
   * the occurrence box it is given (`x`/`y`/`width`/`height`); children are
   * host-rendered content and are positioned by the host layout, never by
   * the zone (§6.1).
   *
   * The component owns no view state: `collapsed` is a prop (§4.3) and
   * activating the toggle emits the §7.2 intent through `onToggle`.
   */
  export interface DiagramZoneProps extends DiagramZoneData {
    /** Text measurer, shared with the card and the pure renderer. */
    measure?: CardLineMeasure;
    /** §7.2 intent out: collapse/expand with the zone as target. */
    onToggle?: (event: { entityId: string; collapsed: boolean }) => void;
    /** Select intent (§4.6). */
    onSelect?: (event: { entityId: string }) => void;
    /** One call per zone diagnostic the layout raises. */
    onDiagnostic?: (diagnostic: ZoneDiagnostic) => void;
    /** Expanded state only: host-rendered children (cards, sub-zones). */
    children?: Snippet;
  }

  let {
    entityId,
    kicker,
    title,
    subtitle,
    footer,
    icon,
    iconGlyph,
    tone,
    proposed,
    collapsed,
    toggleLabel,
    align,
    x = 0,
    y = 0,
    width,
    height,
    measure = defaultCardMeasure,
    onToggle,
    onSelect,
    onDiagnostic,
    children,
  }: DiagramZoneProps = $props();

  const zoneProps = $derived({
    entityId,
    ...(kicker === undefined ? {} : { kicker }),
    title,
    ...(subtitle === undefined ? {} : { subtitle }),
    ...(footer === undefined ? {} : { footer }),
    ...(icon === undefined ? {} : { icon }),
    ...(iconGlyph === undefined ? {} : { iconGlyph }),
    ...(tone === undefined ? {} : { tone }),
    ...(proposed === undefined ? {} : { proposed }),
    collapsed,
    ...(toggleLabel === undefined ? {} : { toggleLabel }),
    ...(align === undefined ? {} : { align }),
    x,
    y,
    ...(width === undefined ? {} : { width }),
    ...(height === undefined ? {} : { height }),
  });

  // Children geometry is host layout data (§6.1): the Svelte zone paints
  // around the supplied box, so the layout pass sees no child specs.
  const layout = $derived(layoutZone(zoneProps, measure, []));

  const cardProps = $derived(
    toggleLabel === undefined
      ? zoneCollapsedCardProps(zoneProps)
      : {
          ...zoneCollapsedCardProps(zoneProps),
          toggle: {
            collapsed: true,
            label: toggleLabel,
            onToggle: () => onToggle?.({ entityId, collapsed: true }),
          },
        },
  );

  const overflowSlot = $derived(
    layout.diagnostics.find((diagnostic) => diagnostic.code === "zone-overflow")?.slot,
  );
  const unknownIcon = $derived(
    layout.diagnostics.some((diagnostic) => diagnostic.code === "zone-icon-unknown"),
  );

  const header = $derived(layout.header);
  const subtitleWidth = $derived(layout.box.width - 2 * ZONE_GEOMETRY.contentInsetInline);

  $effect(() => {
    if (onDiagnostic === undefined) return;
    for (const diagnostic of layout.diagnostics) onDiagnostic(diagnostic);
  });

  function remapDiagnostic(diagnostic: {
    code: string;
    slot: string;
    entityId: string;
    neededPx: number;
    allocatedPx: number;
  }): void {
    if (onDiagnostic === undefined) return;
    onDiagnostic({
      code: diagnostic.code === "card-icon-unknown" ? "zone-icon-unknown" : "zone-overflow",
      slot: diagnostic.slot,
      entityId: diagnostic.entityId,
      neededPx: diagnostic.neededPx,
      allocatedPx: diagnostic.allocatedPx,
    });
  }
</script>

{#if collapsed}
  <DiagramCard
    {...cardProps}
    measure={measure}
    onSelect={onSelect === undefined ? undefined : (event) => onSelect(event)}
    onDiagnostic={onDiagnostic === undefined ? undefined : remapDiagnostic}
  />
{:else}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div
    class="st-diagramZone st-diagramZone--expanded{align === "center" ? " st-diagramZone--center" : ""}{proposed === true ? " st-diagramZone--proposed" : ""}"
    style={`position:absolute;left:${x}px;top:${y}px;width:${layout.box.width}px;height:${layout.box.height}px`}
    data-entity={entityId}
    data-collapsed="false"
    data-tone={tone}
    data-proposed={proposed === true ? "true" : undefined}
    data-zone-overflow={overflowSlot}
    data-zone-icon-unknown={unknownIcon ? "" : undefined}
    role="group"
    aria-label={title}
    onclick={() => onSelect?.({ entityId })}
  >
    {#if header !== undefined}
      <div class="st-diagramZone-header">
        <DiagramZoneHeader
          kicker={header.kicker}
          title={header.title}
          subtitle={header.subtitle}
          iconName={icon}
          iconGlyph={iconGlyph}
          headerTextWidth={header.headerTextWidth}
          subtitleWidth={subtitleWidth}
          toggle={toggleLabel === undefined
            ? undefined
            : {
                collapsed: false,
                label: toggleLabel,
                onToggle: () => onToggle?.({ entityId, collapsed: false }),
              }}
          toggleTopInset={ZONE_GEOMETRY.toggleTopInset}
        />
      </div>
      <div class="st-diagramZone-rule" aria-hidden="true"></div>
      <div class="st-diagramZone-content">
        {#if children !== undefined}
          {@render children()}
        {/if}
      </div>
      {#if header.footer.length > 0}
        <!-- The footer is identical in both states (§6.1): folding never
             changes it. Pinned at the frame bottom like the card footer. -->
        {#if header.footerRuleY !== undefined}
          <div class="st-diagramZone-footerRule" aria-hidden="true"></div>
        {/if}
        <div class="st-diagramZone-footer">
          {#each header.footer as line, footerIndex (footerIndex)}
            <span class="st-diagramZone-footerLine">{line.text}</span>
          {/each}
        </div>
      {/if}
    {/if}
  </div>
{/if}

<style>
  .st-diagramZone {
    box-sizing: border-box;
    border: var(--st-component-diagramZone-borderWidth, 1.5px) solid
      var(--st-component-diagramZone-border, var(--st-semantic-border-strong));
    border-radius: var(--st-component-diagramZone-radius, 0);
    background: var(--st-component-diagramZone-surface, var(--st-semantic-surface-raised));
    color: var(--st-component-diagramZone-text, var(--st-semantic-text-primary));
    display: flex;
    flex-direction: column;
    text-align: left;
    font-family: var(--st-component-diagramCard-fontFamily, var(--st-font-sans));
  }
  .st-diagramZone--center {
    /* Owner variant: every text slot centred inside its allocation. */
    text-align: center;
  }
  /* Neutral status prop: a proposed zone is always drawn dashed,
     independently of the tint (owner criterion 5). */
  .st-diagramZone--proposed {
    border-style: dashed;
  }
  .st-diagramZone-header {
    /* headerInset 16: frame edge → icon left edge. */
    padding: var(--st-component-diagramZone-headerInset, 16px)
      var(--st-component-diagramZone-contentInsetInline, 16px) 0
      var(--st-component-diagramZone-headerInset, 16px);
    min-width: 0;
    flex: 0 0 auto;
  }
  .st-diagramZone-rule {
    display: block;
    height: var(--st-component-diagramCard-ruleHeight, 1px);
    flex: 0 0 var(--st-component-diagramCard-ruleHeight, 1px);
    /* headerRuleGap 4 above; contentInsetTop 16 below; the rule insets are
       the card's (same rule, §6.2). */
    margin: var(--st-component-diagramZone-headerRuleGap, 4px)
      var(--st-component-diagramCard-ruleInsetEnd, 10px) 0
      var(--st-component-diagramCard-ruleInsetStart, 16px);
    background: var(--st-component-diagramZone-rule, var(--st-semantic-border-subtle));
  }
  .st-diagramZone-content {
    flex: 1 1 auto;
    min-height: 0;
    position: relative;
    margin: var(--st-component-diagramZone-contentInsetTop, 16px)
      var(--st-component-diagramZone-contentInsetInline, 16px)
      var(--st-component-diagramZone-contentInsetBottom, 16px);
  }
  .st-diagramZone-footerRule {
    display: block;
    height: var(--st-component-diagramCard-ruleHeight, 1px);
    flex: 0 0 var(--st-component-diagramCard-ruleHeight, 1px);
    margin: var(--st-component-diagramZone-headerRuleGap, 4px)
      var(--st-component-diagramCard-ruleInsetEnd, 10px) 0
      var(--st-component-diagramCard-ruleInsetStart, 16px);
    background: var(--st-component-diagramZone-rule, var(--st-semantic-border-subtle));
  }
  .st-diagramZone-footer {
    flex: 0 0 auto;
    /* Pinned at the frame bottom like the card footer: text-box bottom at
       (height − border − inset). */
    margin-bottom: calc(
      var(--st-component-diagramZone-footerBottomInset, var(--st-component-diagramCard-footerBottomInset, 9.25px)) -
        var(--st-component-diagramZone-borderWidth, 1.5px)
    );
    font-size: var(--st-component-diagramZone-footerFontSize, var(--st-component-diagramCard-footerFontSize, 24px));
    font-weight: var(--st-component-diagramZone-footerFontWeight, var(--st-component-diagramCard-footerFontWeight, 700));
    line-height: var(--st-component-diagramZone-footerLineHeight, var(--st-component-diagramCard-footerLineHeight, 1.3));
    color: var(--st-component-diagramZone-text, var(--st-semantic-text-primary));
  }
  .st-diagramZone-footerLine {
    display: block;
    min-width: 0;
    overflow-wrap: normal;
    word-break: normal;
  }
</style>
