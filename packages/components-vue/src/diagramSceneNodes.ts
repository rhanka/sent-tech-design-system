/** Card/zone drawing for the scene host; all text and box geometry is shared. */
import { h, type VNode } from "vue";
import { Minus, Plus } from "lucide-vue-next";
import { IconButton } from "./IconButton.js";
import {
  layoutCard, layoutZone, projectCardProps, projectZoneProps, zoneCollapsedCardProps,
  firstOverflowDiagnostic, ZONE_GEOMETRY,
  type DiagramCardProps, type DiagramGlyphPaths, type CardLineMeasure, type LaidOutLine,
} from "@sentropic/diagram-canvas/diagramCardModel";
import type { SceneNodeModel } from "@sentropic/diagram-canvas/diagramSceneModel";

const lines = (items: readonly LaidOutLine[], className: string) => items.map((line) => h("span", { class: className }, line.text));

function header(data: { kicker: readonly LaidOutLine[]; title: readonly LaidOutLine[]; headerTextWidth: number; headerBlockHeight: number }, props: Pick<DiagramCardProps, "icon" | "iconGlyph" | "toggle">, toggleOffset?: number): VNode {
  const glyph = props.iconGlyph;
  return h("div", { class: "st-diagramCardHeader", style: `height:${data.headerBlockHeight}px` }, [
    props.icon !== undefined && glyph !== undefined ? h("svg", { class: "st-diagramCardHeader-icon", "data-diagram-icon": props.icon, viewBox: "0 0 64 64", width: "70", height: "70", "aria-hidden": "true", focusable: "false" }, [
      h("path", { d: "M8 53L32 44L56 53L32 62Z", fill: "var(--st-component-diagramIcon-baseFill)" }),
      h("path", { d: glyph.face, fill: "var(--st-component-diagramIcon-faceFill)", stroke: "var(--st-component-diagramIcon-faceStroke)", "stroke-width": "1.5", "stroke-linejoin": "round" }),
      glyph.line === undefined ? null : h("path", { d: glyph.line, fill: "none", stroke: glyph.darkLine ? "var(--st-component-diagramIcon-lineDarkStroke)" : "var(--st-component-diagramIcon-lineStroke)", "stroke-width": "2.5", "stroke-linecap": "round", "stroke-linejoin": "round" }),
      glyph.text === undefined ? null : h("text", { x: "32", y: "47", "text-anchor": "middle", fill: "var(--st-component-diagramIcon-lineStroke)", "font-size": "13", "font-weight": "750" }, glyph.text),
    ]) : null,
    h("div", { class: "st-diagramCardHeader-text", style: `width:${data.headerTextWidth}px` }, [...lines(data.kicker, "st-diagramCard-kicker"), ...lines(data.title, "st-diagramCard-title")]),
    props.toggle === undefined ? null : h("div", { class: "st-diagramCard-toggle", style: toggleOffset === undefined ? undefined : `margin-top:${toggleOffset}px` }, [h(IconButton, { size: "sm", variant: "ghost", "aria-label": props.toggle.label, "aria-expanded": !props.toggle.collapsed, onClick: props.toggle.onToggle }, { default: () => h(props.toggle!.collapsed ? Plus : Minus, { style: { width: "var(--st-component-button-anatomy-density-sm-fontSize)", height: "var(--st-component-button-anatomy-density-sm-fontSize)" }, "aria-hidden": "true" }) })]),
  ]);
}

function card(props: DiagramCardProps, measure: CardLineMeasure, select: () => void): VNode {
  const layout = layoutCard(props, measure), refused = firstOverflowDiagnostic(layout.diagnostics);
  return h("div", {
    class: ["st-diagramCard", refused === undefined ? undefined : "st-diagramCard--refused", props.bodyMode === "subtitle" ? "st-diagramCard--subtitle" : undefined, props.align === "center" ? "st-diagramCard--center" : undefined, props.proposed ? "st-diagramCard--proposed" : undefined],
    "data-entity": props.entityId, "data-tone": props.tone, "data-proposed": props.proposed ? "true" : undefined,
    "data-card-refused": refused?.slot, "data-card-overflow": refused?.slot,
    "data-card-icon-unknown": layout.diagnostics.some((d) => d.code === "card-icon-unknown") ? "" : undefined,
    role: "group", "aria-label": props.title, onClick: select,
  }, refused === undefined ? [
    header(layout, props), h("div", { class: "st-diagramCard-gap", "aria-hidden": "true" }),
    h("div", { class: "st-diagramCard-body", style: `margin-left:${layout.bodyX - 16}px;width:${layout.bodyWidth}px` }, layout.body.map((line) => h("span", { class: line.secondary ? "st-diagramCard-detail" : "st-diagramCard-line" }, line.text))),
    h("div", { class: "st-diagramCard-foot" }, [layout.ruleY === undefined ? null : h("div", { class: "st-diagramCard-rule", "aria-hidden": "true" }), layout.footerLines.length === 0 ? null : h("div", { class: "st-diagramCard-footer" }, lines(layout.footerLines, "st-diagramCard-footerLine"))]),
  ] : []);
}

export function sceneNode(node: SceneNodeModel, options: { measure: CardLineMeasure; expand: (title: string) => string; collapse: (title: string) => string; resolveGlyph?: (name: string) => DiagramGlyphPaths | undefined; select: () => void; toggle: () => void }): VNode | undefined {
  const context = { entityId: node.entity, ...(options.resolveGlyph === undefined ? {} : { resolveGlyph: options.resolveGlyph }) };
  if (node.kind === "card") {
    const projected = projectCardProps(node.presentation, context);
    return projected.kind === "card" ? card(projected.props, options.measure, options.select) : undefined;
  }
  if (node.kind !== "zone") return h("div", { class: "st-diagramSceneFigure-label", "data-entity": node.entity }, node.text);
  const title = node.presentation?.text.title ?? "";
  const projected = projectZoneProps(node.presentation, { ...context, collapsed: node.collapsed, toggleLabel: node.collapsed ? options.expand(title) : options.collapse(title), ...(node.collapsed ? {} : { width: node.rect.width, height: node.rect.height }) });
  if (projected.kind !== "zone") return undefined;
  const props = projected.props, layout = layoutZone(props, options.measure), refused = firstOverflowDiagnostic(layout.diagnostics);
  const toggle = { collapsed: node.collapsed, label: props.toggleLabel!, onToggle: options.toggle };
  if (node.collapsed) return h("div", { class: "st-diagramZone-pos", style: "left:0px;top:0px", "data-entity": node.entity, "data-collapsed": "true" }, [card({ ...zoneCollapsedCardProps(props), toggle }, options.measure, options.select)]);
  const data = layout.header;
  const offset = (n: number) => `calc(${n}px - var(--st-component-diagramZone-borderWidth, 1.5px))`;
  return h("div", { class: "st-diagramZone-pos", style: "left:0px;top:0px", "data-entity": node.entity, "data-collapsed": "false", "data-zone-refused": refused?.slot, "data-zone-overflow": refused?.slot }, [
    h("div", { class: ["st-diagramZone", "st-diagramZone--expanded", refused === undefined ? undefined : "st-diagramZone--refused", props.align === "center" ? "st-diagramZone--center" : undefined, props.proposed ? "st-diagramZone--proposed" : undefined], style: `width:${layout.box.width}px;height:${layout.box.height}px`, role: "group", "aria-label": title, "data-tone": props.tone, "data-proposed": props.proposed ? "true" : undefined, onClick: options.select }, refused !== undefined || data === undefined ? [] : [
      h("div", { class: "st-diagramZone-header", style: `top:${offset(ZONE_GEOMETRY.headerInset)};left:${offset(ZONE_GEOMETRY.headerInset)};right:${offset(ZONE_GEOMETRY.contentInsetInline)};height:${data.ruleY - ZONE_GEOMETRY.headerRuleGap - ZONE_GEOMETRY.headerInset}px` }, [h("div", { class: "st-diagramZoneHeader" }, [header(data, { ...props, toggle }, ZONE_GEOMETRY.toggleTopInset - ZONE_GEOMETRY.headerInset), data.subtitle.length === 0 ? null : h("div", { class: "st-diagramZoneHeader-subtitle", style: `width:${data.subtitleWidth}px` }, lines(data.subtitle, "st-diagramZone-subtitle"))])]),
      h("div", { class: "st-diagramZone-rule", "aria-hidden": "true", style: `left:${offset(ZONE_GEOMETRY.ruleInsetStart)};right:${offset(ZONE_GEOMETRY.ruleInsetEnd)};top:${offset(data.ruleY)}` }),
      h("div", { class: "st-diagramZone-content", style: `top:${offset(data.contentTop)};left:${offset(ZONE_GEOMETRY.contentInsetInline)};right:${offset(ZONE_GEOMETRY.contentInsetInline)};bottom:${offset(ZONE_GEOMETRY.contentInsetBottom)}` }),
      data.footerRuleY === undefined ? null : h("div", { class: "st-diagramZone-footerRule", "aria-hidden": "true", style: `top:${offset(data.footerRuleY)};left:${offset(ZONE_GEOMETRY.ruleInsetStart)};right:${offset(ZONE_GEOMETRY.ruleInsetEnd)}` }),
      data.footer.length === 0 ? null : h("div", { class: "st-diagramZone-footer", style: `left:${offset(ZONE_GEOMETRY.contentInsetInline)};right:${offset(ZONE_GEOMETRY.contentInsetInline)};bottom:var(--st-component-diagramZone-footerBottomInset, var(--st-component-diagramCard-footerBottomInset, 9.25px))` }, lines(data.footer, "st-diagramZone-footerLine")),
    ]),
  ]);
}
