<script setup lang="ts">
defineOptions({ name: 'DiagramZone' });
import { computed, onMounted, watch } from "vue";
import DiagramCard from "./DiagramCard.vue";
import DiagramZoneHeader from "./DiagramZoneHeader.vue";
import { ZONE_GEOMETRY, defaultCardMeasure, layoutZone, zoneCollapsedCardProps, type CardLineMeasure, type DiagramZoneProps as DiagramZoneData, type ZoneDiagnostic, } from "./diagramCardModel.js";
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
 * zone occurrence. Owner A11 keeps all content visible and grows the zone;
   * explicit hard-cap overflow remains diagnostic.
 *
 * The component owns no view state: `collapsed` is a prop (§4.3) and
 * activating the toggle emits the §7.2 intent through `onToggle`.
 */
export interface DiagramZoneProps extends DiagramZoneData {
    /** Text measurer, shared with the card and the pure renderer. */
    measure?: CardLineMeasure;
    /** §7.2 intent out: collapse/expand with the zone as target. */
    onToggle?: (event: {
        entityId: string;
        collapsed: boolean;
    }) => void;
    /** Select intent (§4.6). */
    onSelect?: (event: {
        entityId: string;
    }) => void;
    /** One call per zone diagnostic the layout raises. */
    onDiagnostic?: (diagnostic: ZoneDiagnostic) => void;
}
const { autoSize = true, entityId, containerPadding, kicker, title, subtitle, footer, icon, iconGlyph, tone, proposed, collapsed, toggleLabel, align, x = 0, y = 0, width, height, measure = defaultCardMeasure, } = defineProps<DiagramZoneProps>();
const emit = defineEmits<{
    toggle: [
        event: {
            entityId: string;
            collapsed: boolean;
        }
    ];
    select: [
        event: {
            entityId: string;
        }
    ];
    diagnostic: [
        event: ZoneDiagnostic
    ];
}>();
const onToggle = (event: {
    entityId: string;
    collapsed: boolean;
}) => emit('toggle', event);
const onSelect = (event: {
    entityId: string;
}) => emit('select', event);
const onDiagnostic = (event: ZoneDiagnostic) => emit('diagnostic', event);
const zoneProps = computed(() => ({
    entityId,
    containerPadding,
    ...(autoSize === undefined ? {} : { autoSize }),
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
}));
// Children geometry is host layout data (§6.1): the Svelte zone paints
// around the supplied box, so the layout pass sees no child specs.
const layout = computed(() => layoutZone(zoneProps.value, measure, []));
const cardProps = computed(() => toggleLabel === undefined
    ? zoneCollapsedCardProps(zoneProps.value)
    : {
        ...zoneCollapsedCardProps(zoneProps.value),
        toggle: {
            collapsed: true,
            label: toggleLabel,
            onToggle: () => onToggle?.({ entityId, collapsed: true }),
        },
    });
const overflowSlot = computed(() => layout.value.diagnostics.find((diagnostic) => diagnostic.code === "zone-overflow")?.slot);
const unknownIcon = computed(() => layout.value.diagnostics.some((diagnostic) => diagnostic.code === "zone-icon-unknown"));
// Overflow = refusal: the same predicate as the pure renderer
// (`firstOverflowDiagnostic`), so both renderers refuse together.

const header = computed(() => layout.value.header);
// Expanded subtitle measure: the layout's own `subtitleWidth`
// (min(width, 460) − 26) — the single geometry source shared with
// `renderZoneSvg`, no local arithmetic here.
const subtitleWidth = computed(() => header.value?.subtitleWidth ?? 0);
// Review pass 4 (blocking): the expanded frame positions its header,
// rules, content and footer from the shared layout (`layout.header` /
// `layout.box`) — never from an independent CSS stack of border +
// padding + line boxes. Layout coordinates are frame-edge based, while
// an absolutely positioned child resolves against the frame's PADDING
// box, so the CSS border is subtracted exactly once, through the border
// token, in every frame-edge offset below. The footer is pinned the
// other way round: the model's `footerBottom = frame bottom − border −
// inset` is already measured from the inner border edge, so from the
// padding box the whole offset is the inset itself (9.25 px) — no
// border subtraction in the value.
const borderToken = "var(--st-component-diagramZone-borderWidth, 1.5px)";
const frameTop = (frameY: number): string => `calc(${frameY - y}px - ${borderToken})`;
const frameInset = (inset: number): string => `calc(${inset}px - ${borderToken})`;
// Header band: frame top + headerInset, spanning the header/content
// inline insets, as tall as the layout's header block + subtitle.
const headerStyle = computed(() => header.value === undefined
    ? undefined
    : `top:${frameTop(y + ZONE_GEOMETRY.headerInset)};left:${frameInset(ZONE_GEOMETRY.headerInset)};right:${frameInset(containerPadding ?? ZONE_GEOMETRY.contentInsetInline)};height:${header.value.ruleY - ZONE_GEOMETRY.headerRuleGap - y - ZONE_GEOMETRY.headerInset}px`);
const ruleStyle = computed(() => header.value === undefined
    ? undefined
    : `top:${frameTop(header.value.ruleY)};left:${frameInset(ZONE_GEOMETRY.ruleInsetStart)};right:${frameInset(ZONE_GEOMETRY.ruleInsetEnd)}`);
const contentStyle = computed(() => header.value === undefined
    ? undefined
    : `top:${frameTop(header.value.contentTop)};left:${frameInset(containerPadding ?? ZONE_GEOMETRY.contentInsetInline)};right:${frameInset(containerPadding ?? ZONE_GEOMETRY.contentInsetInline)};bottom:${frameInset(containerPadding ?? ZONE_GEOMETRY.contentInsetBottom)}`);
const footerRuleStyle = computed(() => header.value?.footerRuleY === undefined
    ? undefined
    : `top:${frameTop(header.value.footerRuleY)};left:${frameInset(ZONE_GEOMETRY.ruleInsetStart)};right:${frameInset(ZONE_GEOMETRY.ruleInsetEnd)}`);
const footerStyle = computed(() => header.value === undefined
    ? undefined
    : `left:${frameInset(containerPadding ?? ZONE_GEOMETRY.contentInsetInline)};right:${frameInset(containerPadding ?? ZONE_GEOMETRY.contentInsetInline)};bottom:var(--st-component-diagramZone-footerBottomInset, var(--st-component-diagramCard-footerBottomInset, 9.25px))`);
onMounted(() => {
    watch(layout, value => {
        for (const diagnostic of value.diagnostics)
            onDiagnostic(diagnostic);
    }, { immediate: true });
});
</script>

<template>
<div class="st-diagramZone-pos" :style="`left:${x}px;top:${y}px`" :data-entity="entityId" :data-collapsed="collapsed ? 'true' : 'false'" :data-zone-overflow="overflowSlot" :data-zone-icon-unknown="unknownIcon ? '' : undefined">
  <template v-if="collapsed">
    <DiagramCard v-bind="cardProps" :measure="measure" @select="onSelect"></DiagramCard>
  </template><template v-else>

    <div :class="`st-diagramZone st-diagramZone--expanded${align === 'center' ? ' st-diagramZone--center' : ''}${proposed === true ? ' st-diagramZone--proposed' : ''}`" :style="`width:${layout.box.width}px;height:${layout.box.height}px`" :data-tone="tone" :data-proposed="proposed === true ? 'true' : undefined" role="group" :aria-label="title" @click="() => onSelect?.({ entityId })">
      <template v-if="header !== undefined">

        <div class="st-diagramZone-header" :style="headerStyle">
          <DiagramZoneHeader :kicker="header.kicker" :title="header.title" :subtitle="header.subtitle" :iconName="layout.icon.name" :iconGlyph="layout.icon.glyph" :headerTextWidth="header.headerTextWidth" :headerBlockHeight="header.headerBlockHeight" :subtitleWidth="subtitleWidth" :toggle="toggleLabel === undefined
              ? undefined
              : {
                  collapsed: false,
                  label: toggleLabel,
                  onToggle: () => onToggle?.({ entityId, collapsed: false }),
                }" :toggleTopInset="ZONE_GEOMETRY.toggleTopInset"></DiagramZoneHeader>
        </div>
        <div class="st-diagramZone-rule" :style="ruleStyle" aria-hidden="true"></div>
        <div class="st-diagramZone-content" :style="contentStyle">
          <slot />
        </div>
        <template v-if="header.footer.length > 0">

          <template v-if="header.footerRuleY !== undefined">
            <div class="st-diagramZone-footerRule" :style="footerRuleStyle" aria-hidden="true"></div>
          </template>
          <div class="st-diagramZone-footer" :style="footerStyle">
            <template v-for="(line, footerIndex) in header.footer" :key="footerIndex">
              <span class="st-diagramZone-footerLine">{{ line.text }}</span>
            </template>
          </div>
        </template>
      </template>
    </div>
  </template>
</div>
</template>

<style>

  /* The positioning wrapper, present in collapsed AND expanded states:
     folding never moves the occurrence (second review, blocking). */
  .st-diagramZone-pos {
    position: absolute;
  }
  .st-diagramZone {
    /* Expanded frame: the containing block of every part below. The parts
       are absolutely positioned from the shared layout's inline offsets
       (review pass 4), so the frame is a plain bordered box — no flex
       stack of border + padding + line boxes. */
    position: relative;
    box-sizing: border-box;
    border: var(--st-component-diagramZone-borderWidth, 1.5px) solid
      var(--st-component-diagramZone-border, var(--st-semantic-border-strong));
    border-radius: var(--st-component-diagramZone-radius, 0);
    background: var(--st-component-diagramZone-surface, var(--st-semantic-surface-raised));
    color: var(--st-component-diagramZone-text, var(--st-semantic-text-primary));
    text-align: left;
    font-family: var(--st-component-diagramCard-fontFamily, var(--st-font-sans, Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif));
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
    /* top/left/right/height come from the shared layout inline; the CSS
       border is already accounted exactly once in those calc offsets
       (frame-edge layout coordinate − border token). */
    position: absolute;
    min-width: 0;
  }
  .st-diagramZone-rule {
    position: absolute;
    display: block;
    /* 1 screen px at every zoom with a constant LAYOUT footprint (review
       pass 2, item 5): the box keeps a fixed 1 px height and only the
       painted stroke is counter-scaled by scaleY(1/zoom), same contract
       as the card rule — the zone footer never moves at overview zoom.
       The rule's top/left/right come from the shared layout inline
       (ruleY and the rule insets). */
    height: var(--st-component-diagramCard-ruleHeight, 1px);
    transform: scaleY(calc(1 / var(--st-diagram-zoom, 1)));
    transform-origin: center;
    background: var(--st-component-diagramZone-rule, var(--st-semantic-border-subtle));
  }
  .st-diagramZone-content {
    /* top/left/right/bottom from the shared layout inline (contentTop and
       the content insets); still the positioning context for the
       host-rendered children. */
    position: absolute;
    min-height: 0;
  }
  .st-diagramZone-footerRule {
    position: absolute;
    display: block;
    /* Same constant-footprint rule contract as the card and the header
       rule (review pass 2, item 5): fixed 1 px layout box, paint-only
       counter-scale. Top/left/right come from the shared layout inline
       (footerRuleY and the rule insets). */
    height: var(--st-component-diagramCard-ruleHeight, 1px);
    transform: scaleY(calc(1 / var(--st-diagram-zoom, 1)));
    transform-origin: center;
    background: var(--st-component-diagramZone-rule, var(--st-semantic-border-subtle));
  }
  .st-diagramZone-footer {
    position: absolute;
    /* Pinned at the frame bottom like the card footer: the model pins
       footerBottom at (frame bottom − border − inset), and the padding
       box already sits inside the border, so the whole bottom offset is
       the footerBottomInset token (9.25 px) — no border subtraction in
       the value (review pass 4). Inline insets: the layout's footerX. */
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
