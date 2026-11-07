<script lang="ts">
  import type { Snippet } from "svelte";
  import DiagramCard from "./DiagramCard.svelte";
  import DiagramZoneHeader from "./DiagramZoneHeader.svelte";
  import {
    ZONE_GEOMETRY,
    defaultCardMeasure,
    firstOverflowDiagnostic,
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
   * Both states render inside the SAME positioning wrapper
   * (`.st-diagramZone-pos`, absolute at `x`/`y`): folding never moves the
   * zone occurrence. Overflow = refusal (owner criterion): a `zone-overflow`
   * renders no normal zone — the wrapper carries the host-visible refusal
   * state `data-zone-refused="<slot>"`, matching the pure renderer's refused
   * result.
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
  // Overflow = refusal: the same predicate as the pure renderer
  // (`firstOverflowDiagnostic`), so both renderers refuse together.
  const refused = $derived(firstOverflowDiagnostic(layout.diagnostics));

  const header = $derived(layout.header);
  // Expanded subtitle measure: the layout's own `subtitleWidth`
  // (min(width, 460) − 26) — the single geometry source shared with
  // `renderZoneSvg`, no local arithmetic here.
  const subtitleWidth = $derived(header?.subtitleWidth ?? 0);

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
    text?: string;
  }): void {
    if (onDiagnostic === undefined) return;
    onDiagnostic({
      code: diagnostic.code === "card-icon-unknown" ? "zone-icon-unknown" : "zone-overflow",
      slot: diagnostic.slot,
      entityId: diagnostic.entityId,
      neededPx: diagnostic.neededPx,
      allocatedPx: diagnostic.allocatedPx,
      ...(diagnostic.text === undefined ? {} : { text: diagnostic.text }),
    });
  }
</script>

<!-- One positioning wrapper in BOTH states (second review, blocking): the
     occurrence never moves on fold/unfold — only the inner rendering
     changes. Overflow = refusal: a refused zone renders no normal frame
     or card, the wrapper carries data-zone-refused for the host. -->
<div
  class="st-diagramZone-pos"
  style={`left:${x}px;top:${y}px`}
  data-entity={entityId}
  data-collapsed={collapsed ? "true" : "false"}
  data-zone-refused={refused === undefined ? undefined : refused.slot}
  data-zone-overflow={overflowSlot}
  data-zone-icon-unknown={unknownIcon ? "" : undefined}
>
  {#if refused !== undefined}
    <div
      class="st-diagramZone st-diagramZone--refused"
      style={`width:${layout.box.width}px;height:${layout.box.height}px`}
      role="group"
      aria-label={title}
    ></div>
  {:else if collapsed}
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
      style={`width:${layout.box.width}px;height:${layout.box.height}px`}
      data-tone={tone}
      data-proposed={proposed === true ? "true" : undefined}
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
            headerBlockHeight={header.headerBlockHeight}
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
</div>

<style>
  /* The positioning wrapper, present in collapsed AND expanded states:
     folding never moves the occurrence (second review, blocking). */
  .st-diagramZone-pos {
    position: absolute;
  }
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
  /* Refusal state (overflow = refusal): no normal frame, a dashed
     placeholder the host can see via data-zone-refused on the wrapper. */
  .st-diagramZone--refused {
    border-style: dashed;
    background: transparent;
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
    /* 1 screen px at every zoom with a constant LAYOUT footprint (review
       pass 2, item 5): the box keeps a fixed 1 px height/flex-basis and only
       the painted stroke is counter-scaled by scaleY(1/zoom), same contract
       as the card rule — the zone footer never moves at overview zoom. */
    height: var(--st-component-diagramCard-ruleHeight, 1px);
    flex: 0 0 var(--st-component-diagramCard-ruleHeight, 1px);
    transform: scaleY(calc(1 / var(--st-diagram-zoom, 1)));
    transform-origin: center;
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
    /* Same constant-footprint rule contract as the card and the header rule
       (review pass 2, item 5): fixed 1 px layout box, paint-only
       counter-scale. */
    height: var(--st-component-diagramCard-ruleHeight, 1px);
    flex: 0 0 var(--st-component-diagramCard-ruleHeight, 1px);
    transform: scaleY(calc(1 / var(--st-diagram-zoom, 1)));
    transform-origin: center;
    /* 4 px above (headerRuleGap) and 4 px below the rule, same inline
       insets as the header rule; the footer text follows the gap. */
    margin: var(--st-component-diagramZone-headerRuleGap, 4px)
      var(--st-component-diagramCard-ruleInsetEnd, 10px)
      var(--st-component-diagramZone-headerRuleGap, 4px)
      var(--st-component-diagramCard-ruleInsetStart, 16px);
    background: var(--st-component-diagramZone-rule, var(--st-semantic-border-subtle));
  }
  .st-diagramZone-footer {
    flex: 0 0 auto;
    /* 16 px horizontal inset, same as the layout's footerX; pinned at the
       frame bottom like the card footer: text-box bottom at
       (height − border − inset). */
    margin-inline: var(--st-component-diagramZone-contentInsetInline, 16px);
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
