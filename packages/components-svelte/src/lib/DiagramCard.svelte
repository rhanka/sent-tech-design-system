<script lang="ts">
  import DiagramCardHeader from "./DiagramCardHeader.svelte";
  import { defaultCardMeasure, firstOverflowDiagnostic, layoutCard } from "./diagramCardModel.js";
  import type {
    CardDiagnostic,
    CardLineMeasure,
    DiagramCardProps as DiagramCardData,
  } from "./diagramCardModel.js";

  /**
   * `DiagramCard` — the atomic diagram card (DC-1).
   *
   * Spec: spec/SPEC_EVOL_DS_DIAGRAM_CARDS.md §5. Fixed 460 × 200 box, square
   * corners, footer pinned at 9.25, one 1 px rule, no shortening. Overflow
   * = refusal (owner criterion): any `card-overflow` — a too-wide line, a
   * line-count overflow, or a header+body height that does not fit above the
   * pinned rule — renders NO normal card; the root carries the host-visible
   * refusal state `data-card-refused="<slot>"` and the diagnostics keep the
   * original slot text. An icon name with no glyph data raises
   * `card-icon-unknown` and the slot collapses (DIF-14).
   *
   * The rule stays 1 screen px at every zoom WITHOUT moving the layout: the
   * host publishes the current camera zoom as `--st-diagram-zoom` on the
   * canvas viewport, the rule's layout box keeps a constant 1 px footprint,
   * and only its painted stroke is counter-scaled by `scaleY(1/zoom)`
   * (review pass 2, item 5) — the HTML twin of the SVG
   * `vector-effect="non-scaling-stroke"`.
   *
   * The pictogram path data arrives via the `iconGlyph` prop (resolved by
   * the host from the `diagram-icons` subpath, e.g. `getDiagramGlyph`, or by
   * `projectCardProps` from `diagram-render`): the barrel never resolves the
   * icon registry graph (§5.6). Line splits come from the shared
   * `layoutCard`, the same geometry the pure `renderCardSvg` consumes.
   */
  export interface DiagramCardProps extends DiagramCardData {
    /**
     * Text measurer. Defaults to the deterministic greedy wrapper;
     * production hosts pass their measured `LineMeasurer` adapter so the
     * Svelte card wraps against the same advances as layout and rendering.
     */
    measure?: CardLineMeasure;
    /** Select intent (§4.6): `{ event: "intent", name: "select", target }`. */
    onSelect?: (event: { entityId: string }) => void;
    /** One call per diagnostic the layout raises. */
    onDiagnostic?: (diagnostic: CardDiagnostic) => void;
  }

  let {
    entityId,
    autoSize,
    height,
    kicker,
    title,
    body,
    detailCount,
    footer,
    icon,
    iconGlyph,
    tone,
    proposed,
    toggle,
    align,
    bodyMode,
    measure = defaultCardMeasure,
    onSelect,
    onDiagnostic,
  }: DiagramCardProps = $props();

  const layout = $derived(
    layoutCard(
      {
        entityId,
        ...(autoSize === undefined ? {} : { autoSize }),
        ...(height === undefined ? {} : { height }),
        ...(kicker === undefined ? {} : { kicker }),
        title,
        body,
        ...(detailCount === undefined ? {} : { detailCount }),
        ...(footer === undefined ? {} : { footer }),
        ...(icon === undefined ? {} : { icon }),
        ...(iconGlyph === undefined ? {} : { iconGlyph }),
        ...(tone === undefined ? {} : { tone }),
        ...(proposed === undefined ? {} : { proposed }),
        ...(toggle === undefined ? {} : { toggle }),
        ...(align === undefined ? {} : { align }),
        ...(bodyMode === undefined ? {} : { bodyMode }),
      },
      measure,
    ),
  );

  const overflowSlot = $derived(
    layout.diagnostics.find((diagnostic) => diagnostic.code === "card-overflow")?.slot,
  );
  const unknownIcon = $derived(
    layout.diagnostics.some((diagnostic) => diagnostic.code === "card-icon-unknown"),
  );
  // Overflow = refusal: the same predicate as the pure renderer
  // (`firstOverflowDiagnostic`), so both renderers refuse together.
  const refused = $derived(firstOverflowDiagnostic(layout.diagnostics));

  $effect(() => {
    if (onDiagnostic === undefined) return;
    for (const diagnostic of layout.diagnostics) onDiagnostic(diagnostic);
  });
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- Click selects (the §4.6 select intent), like BarChart's point select:
     keyboard activation of a card is the host figure's concern (DC-2). -->
{#if refused !== undefined}
  <!-- Overflow = refusal: no normal card is rendered for refused content.
       The host sees the refusal state on the root (data-card-refused) and
       gets the original slot text through onDiagnostic. -->
  <div
    class="st-diagramCard st-diagramCard--refused"
    data-entity={entityId}
    data-tone={tone}
    data-proposed={proposed === true ? "true" : undefined}
    data-card-refused={refused.slot}
    data-card-overflow={refused.slot}
    role="group"
    aria-label={title}
    onclick={() => onSelect?.({ entityId })}
  ></div>
{:else}
<div
  class="st-diagramCard{bodyMode === "subtitle" ? " st-diagramCard--subtitle" : ""}{align === "center" ? " st-diagramCard--center" : ""}{proposed === true ? " st-diagramCard--proposed" : ""}"
  data-entity={entityId}
  data-tone={tone}
  data-proposed={proposed === true ? "true" : undefined}
  style={autoSize ? `height:${layout.box.height}px` : undefined}
  data-card-overflow={overflowSlot}
  data-card-icon-unknown={unknownIcon ? "" : undefined}
  role="group"
  aria-label={title}
  onclick={() => onSelect?.({ entityId })}
>
  <DiagramCardHeader
    kicker={layout.kicker}
    title={layout.title}
    iconName={icon}
    iconGlyph={iconGlyph}
    headerTextWidth={layout.headerTextWidth}
    headerBlockHeight={layout.headerBlockHeight}
    toggle={toggle}
  />
  <div class="st-diagramCard-gap" aria-hidden="true"></div>
  <div
    class="st-diagramCard-body"
    style={`margin-left:${layout.bodyX - 16}px;width:${layout.bodyWidth}px`}
  >
    {#each layout.body as line, bodyIndex (bodyIndex)}
      <span class={line.secondary ? "st-diagramCard-detail" : "st-diagramCard-line"}>{line.text}</span>
    {/each}
  </div>
  <!-- The rule and the footer are positioned together from the shared
       geometry: the foot wrapper is pinned to the bottom (margin-top:auto),
       the rule keeps its 4 px margins inside it, so the rule→footer gap is
       the frozen 4 px at every body line count, exactly as the SVG pins
       ruleY from the footer. -->
  <div class="st-diagramCard-foot">
    {#if layout.ruleY !== undefined}
      <div class="st-diagramCard-rule" aria-hidden="true"></div>
    {/if}
    {#if layout.footerLines.length > 0}
      <div class="st-diagramCard-footer">
        {#each layout.footerLines as line, footerIndex (footerIndex)}
          <span class="st-diagramCard-footerLine">{line.text}</span>
        {/each}
      </div>
    {/if}
  </div>
</div>
{/if}

<style>
  .st-diagramCard {
    width: var(--st-component-diagramCard-width, 460px);
    height: var(--st-component-diagramCard-height, 200px);
    box-sizing: border-box;
    border: var(--st-component-diagramCard-borderWidth, 2px) solid
      var(--st-component-diagramCard-border, var(--st-semantic-border-strong));
    border-left: var(--st-component-diagramCard-accentWidth, 8px) solid
      var(--st-component-diagramCard-accent, var(--st-semantic-data-category1));
    border-radius: var(--st-component-diagramCard-radius, 0);
    background: var(--st-component-diagramCard-surface, var(--st-semantic-surface-raised));
    color: var(--st-component-diagramCard-text, var(--st-semantic-text-primary));
    padding: var(--st-component-diagramCard-padding, 8px);
    display: flex;
    flex-direction: column;
    text-align: left;
    font-family: var(--st-component-diagramCard-fontFamily, var(--st-font-sans, Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif));
  }
  .st-diagramCard--center {
    /* Owner variant: every text slot centred inside its allocation. */
    text-align: center;
  }
  /* Neutral status prop: a proposed card is always drawn dashed,
     independently of the tint (owner criterion 5). */
  .st-diagramCard--proposed {
    border-style: dashed;
  }
  .st-diagramCard-gap {
    display: block;
    height: var(--st-component-diagramCard-gap, 6px);
    flex: 0 0 var(--st-component-diagramCard-gap, 6px);
  }
  .st-diagramCard-body {
    /* margin-left and width both come from the shared layout: the body box
       is exactly layout.bodyWidth wide at layout.bodyX — −2 px / 436 px for
       leaf bodies (bodyInsetFromBar 14 vs headerInset 16), 16 px / 396 px
       for the centred collapsed-subtitle measure (§6.2.1: the subtitle is
       centred at 32 + 396/2 = 230, not over the wider content box). */
    min-width: 0;
    flex: 0 0 auto;
    font-size: var(--st-component-diagramCard-bodyFontSize, 24px);
    font-weight: var(--st-component-diagramCard-bodyFontWeight, 400);
    line-height: var(--st-component-diagramCard-bodyLineHeight, 1.3);
  }
  .st-diagramCard--subtitle .st-diagramCard-body {
    /* §6.2.1: the collapsed-zone subtitle block is centred horizontally
       and vertically inside the card body area. */
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
  }
  .st-diagramCard-line,
  .st-diagramCard-detail {
    display: block;
    min-width: 0;
    /* No mid-word break: an over-long word overflows and is diagnosed
       (Astra J4), never silently broken or cut. */
    overflow-wrap: normal;
    word-break: normal;
  }
  .st-diagramCard-detail {
    color: var(--st-component-diagramCard-secondaryText, var(--st-semantic-text-secondary));
  }
  /* Rule and footer share one pinned wrapper (`.st-diagramCard-foot`):
     the wrapper takes the automatic top margin, so spare body space grows
     above the rule and the rule→footer gap stays the frozen 4 px. */
  .st-diagramCard-foot {
    margin-top: auto;
    flex: 0 0 auto;
  }
  .st-diagramCard-rule {
    display: block;
    flex: 0 0 auto;
    /* 1 screen px at every zoom, with a constant LAYOUT footprint (review
       pass 2, item 5): the box height never reads --st-diagram-zoom, so at
       overview zoom 0.25 the rule still occupies exactly 1 px of layout and
       the pinned footer never moves. Only the painted stroke is
       counter-scaled: the host scales the viewport by --st-diagram-zoom, so
       scaleY(1/zoom) on the fixed 1 px box paints exactly 1 screen px — the
       HTML twin of the SVG vector-effect="non-scaling-stroke". */
    height: var(--st-component-diagramCard-ruleHeight, 1px);
    margin: var(--st-component-diagramCard-ruleMargin, 4px) 0;
    background: var(--st-component-diagramCard-rule, var(--st-semantic-border-subtle));
    transform: scaleY(calc(1 / var(--st-diagram-zoom, 1)));
    transform-origin: center;
  }
  .st-diagramCard-footer {
    /* Pinned footer: text-box bottom at (height − border − inset); the flex
       content bottom sits at (height − padding − border), so the margin is
       (inset − padding) = 1.25 px at the frozen values. No margin-top:auto
       here: the rule and the footer are positioned together by the shared
       foot wrapper. */
    margin-bottom: calc(
      var(--st-component-diagramCard-footerBottomInset, 9.25px) -
        var(--st-component-diagramCard-padding, 8px)
    );
    font-size: var(--st-component-diagramCard-footerFontSize, 24px);
    font-weight: var(--st-component-diagramCard-footerFontWeight, 700);
    line-height: var(--st-component-diagramCard-footerLineHeight, 1.3);
  }
  .st-diagramCard-footerLine {
    display: block;
    min-width: 0;
    overflow-wrap: normal;
    word-break: normal;
  }
</style>
