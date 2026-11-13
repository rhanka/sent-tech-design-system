import { describe, expect, it } from "vitest";
import { component, createComponent } from "./component.js";
import { foundation } from "./foundation.js";
import { semantic } from "./semantic.js";
import { flattenTokens, toCssVariables } from "./css.js";
import { componentDark } from "./component.dark.js";
import { semanticDark } from "./semantic.dark.js";

/**
 * DC-1 CA-DC1-1: every Appendix A token exists with its owner-amended value.
 *
 * Spec: spec/SPEC_EVOL_DS_DIAGRAM_CARDS.md Appendix A (§5.3, §6.4, §9.1).
 * Geometry leaves are frozen literals; colour leaves alias the semantic
 * layer (no raw value of their own); zone kicker/title leaves alias the
 * atomic card tokens so the "same typography" requirement holds by
 * construction. The dark layer derives from the same builder over the dark
 * semantic/foundation inputs, so dark values are asserted from
 * `componentDark`, never re-declared here.
 */

const GEOMETRY: Record<string, Record<string, string>> = {
  diagramCard: {
    width: "460px",
    height: "200px",
    radius: "0",
    borderWidth: "2px",
    accentWidth: "8px",
    padding: "8px",
    headerInset: "16px",
    iconSize: "70px",
    iconTextGap: "6px",
    kickerFontSize: "22px",
    kickerFontWeight: "400",
    kickerLineHeight: "1.3",
    kickerLetterSpacing: "0.04em",
    kickerTextTransform: "uppercase",
    titleFontSize: "32px",
    titleFontWeight: "700",
    titleLineHeight: "1.3",
    gap: "6px",
    bodyFontSize: "24px",
    bodyFontWeight: "400",
    bodyLineHeight: "1.3",
    bodyInsetFromBar: "14px",
    ruleHeight: "1px",
    ruleMargin: "4px",
    ruleInsetStart: "16px",
    ruleInsetEnd: "10px",
    footerFontSize: "24px",
    footerFontWeight: "700",
    footerLineHeight: "1.3",
    footerBottomInset: "9.25px",
    toggleAllocation: "66px",
    toggleBoxSize: "32px",
    toggleInset: "8px",
    foldedHeaderTextWidth: "290px",
    proposedDashArray: "4 5",
    fontFamily: "var(--st-font-sans)",
    // DC-2a root gaps: aliases of the zone gaps.
    rootGapInline: "var(--st-component-diagramZone-childGapInline)",
    rootGapBlock: "var(--st-component-diagramZone-childGapBlock)",
  },
  diagramZone: {
    radius: "0",
    borderWidth: "1.5px",
    headerInset: "16px",
    iconSize: "70px",
    iconTextGap: "6px",
    kickerFontSize: "var(--st-component-diagramCard-kickerFontSize)",
    kickerFontWeight: "var(--st-component-diagramCard-kickerFontWeight)",
    kickerLineHeight: "var(--st-component-diagramCard-kickerLineHeight)",
    kickerLetterSpacing: "var(--st-component-diagramCard-kickerLetterSpacing)",
    kickerTextTransform: "var(--st-component-diagramCard-kickerTextTransform)",
    titleFontSize: "var(--st-component-diagramCard-titleFontSize)",
    titleFontWeight: "var(--st-component-diagramCard-titleFontWeight)",
    titleLineHeight: "var(--st-component-diagramCard-titleLineHeight)",
    subtitleFontSize: "24px",
    subtitleFontWeight: "400",
    subtitleLineHeight: "1.3",
    subtitleGap: "var(--st-component-diagramCard-gap)",
    headerRuleGap: "4px",
    contentInsetTop: "16px",
    contentInsetBottom: "16px",
    contentInsetInline: "16px",
    collapsedWidth: "460px",
    collapsedHeight: "200px",
    collapsedInset: "16px",
    collapsedSubtitleMarginInline: "16px",
    toggleAllocation: "var(--st-component-diagramCard-toggleAllocation)",
    toggleBoxSize: "var(--st-component-diagramCard-toggleBoxSize)",
    headerTextInset: "178px",
    toggleInset: "8px",
    toggleTopInset: "var(--st-component-diagramZone-toggleInset)",
    footerBottomInset: "var(--st-component-diagramCard-footerBottomInset)",
    proposedDashArray: "4 5",
    // DC-2a row-pack spacing (SPEC_EVOL_DC2A §3.5).
    childGapInline: "96px",
    childGapBlock: "72px",
    gapInlineMax: "240px",
    gapBlockMax: "240px",
    rowPackTargetAspect: "1.78",
  },
  // DC-2a scene camera, transition and edge-label typography (§5, §4.3).
  diagramScene: {
    maxDisplayScale: "0.62",
    minReadableScale: "0.45",
    transitionDuration: "240ms",
    gapMin: "96px",
    gapBase: "64px",
    trackSpacing: "14px",
    gapMinBlock: "72px",
    gapBaseBlock: "8px",
    trackSpacingBlock: "7px",
    labelBand: "30px",
    gapMax: "240px",
    bundleLabelMaxWidth: "320px",
    edgeLabelFontSize: "18px",
    edgeLabelLineHeight: "22px",
  },
  diagramIcon: {
    viewBox: "0 0 64 64",
    basePath: "M8 53L32 44L56 53L32 62Z",
    faceStrokeWidth: "1.5",
    lineStrokeWidth: "2.5",
    baseFill:
      "color-mix(in srgb, var(--st-semantic-feedback-info) 18%, var(--st-semantic-surface-raised))",
    faceFill:
      "color-mix(in srgb, var(--st-semantic-feedback-info) 75%, var(--st-semantic-surface-raised))",
    faceStroke: "var(--st-semantic-feedback-info)",
    lineStroke: "var(--st-semantic-surface-raised)",
    lineDarkStroke: "var(--st-semantic-feedback-info)",
  },
};

describe("diagram tokens — frozen Appendix A values", () => {
  for (const [group, leaves] of Object.entries(GEOMETRY)) {
    it(`${group} geometry leaves match the frozen values`, () => {
      const actual = component[group as keyof typeof component] as Record<string, unknown>;
      for (const [leaf, value] of Object.entries(leaves)) {
        expect(actual[leaf], `${group}.${leaf}`).toBe(value);
      }
    });
  }

  it("diagram colour leaves alias the semantic layer (no own raw value)", () => {
    expect(component.diagramCard.border).toBe(semantic.border.strong);
    expect(component.diagramCard.accent).toBe(semantic.border.strong);
    expect(component.diagramCard.surface).toBe(semantic.surface.raised);
    expect(component.diagramCard.text).toBe(semantic.text.primary);
    expect(component.diagramCard.secondaryText).toBe(semantic.text.secondary);
    expect(component.diagramCard.rule).toBe(semantic.border.subtle);
    expect(component.diagramZone.border).toBe(semantic.border.strong);
    expect(component.diagramZone.surface).toBe(semantic.surface.raised);
    expect(component.diagramZone.text).toBe(semantic.text.primary);
    expect(component.diagramZone.secondaryText).toBe(semantic.text.secondary);
    expect(component.diagramZone.rule).toBe(semantic.border.subtle);
  });

  it("dark layer carries the same geometry over the dark semantic inputs", () => {
    for (const [group, leaves] of Object.entries(GEOMETRY)) {
      const actual = componentDark[group as keyof typeof componentDark] as Record<string, unknown>;
      for (const [leaf, value] of Object.entries(leaves)) {
        expect(actual[leaf], `dark ${group}.${leaf}`).toBe(value);
      }
    }
    // Colours re-resolve through the dark semantic layer (no
    // white-forced surface, DIF-09): the dark tree is the same builder
    // over the dark inputs.
    expect(componentDark.diagramCard.border).toBe(semanticDark.border.strong);
    expect(componentDark.diagramCard.surface).toBe(semanticDark.surface.raised);
    expect(componentDark.diagramCard.text).toBe(semanticDark.text.primary);
    expect(componentDark.diagramCard.secondaryText).toBe(semanticDark.text.secondary);
    expect(componentDark.diagramCard.rule).toBe(semanticDark.border.subtle);
    expect(componentDark.diagramZone.surface).toBe(semanticDark.surface.raised);
  });

  it("compiled CSS exposes every frozen leaf as --st-component-*", () => {
    const css = toCssVariables({ component });
    for (const [group, leaves] of Object.entries(GEOMETRY)) {
      for (const [leaf, value] of Object.entries(leaves)) {
        expect(css).toContain(`--st-component-${group}-${leaf}: ${value};`);
      }
    }
    const darkCss = toCssVariables({ component: componentDark });
    expect(darkCss).toContain("--st-component-diagramCard-width: 460px;");
    expect(darkCss).toContain("--st-component-diagramZone-collapsedHeight: 200px;");
  });

  it("diagram leaves hold references, never their own literals", () => {
    // Every colour leaf is the semantic input itself (asserted above by
    // identity). Geometry leaves are the frozen literals of the table.
    // A theme that re-resolves the semantic layer therefore repaints the
    // card with no component change.
    const flat = flattenTokens({
      diagramCard: component.diagramCard,
      diagramZone: component.diagramZone,
      diagramIcon: component.diagramIcon,
    });
    expect(Object.keys(flat)).toContain("diagramCard-width");
    expect(Object.keys(flat)).toContain("diagramZone-collapsedHeight");
    expect(Object.keys(flat)).toContain("diagramIcon-basePath");
  });
});

describe("diagram tokens — foundation independence", () => {
  it("geometry does not move with the theme foundation", () => {
    // Frozen geometry is theme-independent: rebuilding over the same
    // semantic layer keeps every geometry leaf byte-identical.
    const rebuilt = createComponent(semantic, foundation);
    expect(rebuilt.diagramCard).toEqual(component.diagramCard);
    expect(rebuilt.diagramZone).toEqual(component.diagramZone);
    expect(rebuilt.diagramIcon).toEqual(component.diagramIcon);
  });
});
