import { compileTheme, createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { influnifiedTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

// WCAG 2.x relative luminance + contrast ratio (sRGB, gamma-encoded — the same
// space `color-mix(in srgb, …)` interpolates in, so the mixed badge
// backgrounds below match the rendered CSS exactly).
function luminance(hex: string): number {
  const c = hex.replace("#", "");
  const channel = (i: number): number => {
    const v = parseInt(c.substr(i, 2), 16) / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

function ratio(a: string, b: string): number {
  const x = luminance(a);
  const y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

// Badge CSS mixes each feedback tone at 14% over white:
// `color-mix(in srgb, <tone> 14%, white)`.
function badgeMix(tone: string): string {
  const c = tone.replace("#", "");
  const channel = (i: number): string =>
    Math.round(parseInt(c.substr(i, 2), 16) * 0.14 + 255 * 0.86)
      .toString(16)
      .padStart(2, "0");
  return `#${channel(0)}${channel(2)}${channel(4)}`;
}

interface SemanticLeaves {
  surface: { default: string; subtle: string };
  text: { link: string; inverse: string };
  action: { primary: string; primaryHover: string; primaryText: string; danger: string };
  feedback: { success: string; warning: string; error: string };
}

interface FoundationLeaves {
  focus: { color: string };
}

const tokens = influnifiedTheme.tokens as unknown as {
  semantic: SemanticLeaves;
  foundation: FoundationLeaves;
  component: ThemeComponent;
};
const { semantic, foundation } = tokens;
const built = tokens.component;

const WHITE = "#ffffff";
const PAGE = semantic.surface.default; // #fffaf5
const SUBTLE = semantic.surface.subtle; // #fdf6f6

describe("influnifiedTheme contrast (sol review)", () => {
  it("primary text-bearing surfaces reach 4.5:1 (finding 1)", () => {
    // Primary buttons (rest + hover share the primary text leaf).
    expect(ratio(built.button.primaryText, built.button.primaryBackground)).toBeGreaterThanOrEqual(4.5);
    const hoverBg = built.button.anatomy.states?.hover?.bg;
    expect(hoverBg).toBeDefined();
    expect(ratio(built.button.primaryText, hoverBg as string)).toBeGreaterThanOrEqual(4.5);
    // Active pagination page.
    expect(ratio(built.pagination.activeText, built.pagination.activeBackground)).toBeGreaterThanOrEqual(4.5);
    // Info badge (explicit fill, not the feedback mix).
    expect(ratio(built.badge.infoText, built.badge.infoBackground)).toBeGreaterThanOrEqual(4.5);
  });

  it("focus outline reaches 3:1 on every surface it can sit on (finding 2)", () => {
    const focus = foundation.focus.color;
    for (const surface of [WHITE, PAGE, SUBTLE, semantic.action.primary, semantic.action.primaryHover]) {
      expect(ratio(focus, surface)).toBeGreaterThanOrEqual(3);
    }
  });

  it("status badge text reaches 4.5:1 on its rendered 14% mix (finding 3)", () => {
    for (const tone of [semantic.feedback.success, semantic.feedback.warning, semantic.feedback.error]) {
      expect(ratio(tone, badgeMix(tone))).toBeGreaterThanOrEqual(4.5);
    }
    // The info badge uses the explicit primary fill, not a mix.
    expect(ratio(built.badge.infoText, built.badge.infoBackground)).toBeGreaterThanOrEqual(4.5);
  });

  it("link and secondary-button states reach 4.5:1 (finding 4)", () => {
    // Resting and hover links on white, page and subtle surfaces.
    for (const surface of [WHITE, PAGE, SUBTLE]) {
      expect(ratio(semantic.text.link, surface)).toBeGreaterThanOrEqual(4.5);
      expect(ratio(built.link.hoverText, surface)).toBeGreaterThanOrEqual(4.5);
    }
    // Secondary button: text on the resting fill and on the hover tint.
    expect(ratio(built.button.secondaryText, built.button.secondaryBackground)).toBeGreaterThanOrEqual(4.5);
    expect(ratio(built.button.secondaryText, built.button.secondaryHoverBackground)).toBeGreaterThanOrEqual(4.5);
  });

  it("danger button text stays at 4.5:1 on the measured error fill", () => {
    expect(ratio(semantic.text.inverse, semantic.action.danger)).toBeGreaterThanOrEqual(4.5);
  });

  it("field anatomy carries the measured corners, stroke and density (finding 5)", () => {
    const field = built.control.anatomy.field;
    expect(field?.radiusTop).toBe("0.75rem");
    expect(field?.radiusBottom).toBe("0.75rem");
    expect(field?.borderTop).toBe("1px solid #ddd7e6");
    expect(field?.borderBottom).toBe("1px solid #ddd7e6");
    // Field density (shared scale) is separated from the button density.
    expect(built.control.anatomy.density?.md?.paddingBlock).toBe("0.75rem");
    expect(built.control.anatomy.density?.md?.paddingInline).toBe("1rem");
    expect(built.button.anatomy.density?.md?.paddingBlock).toBe("0.85rem");
    expect(built.button.anatomy.density?.md?.paddingInline).toBe("1.75rem");
    // The corrections are emitted as component tokens the components consume.
    const css = compileTheme(influnifiedTheme);
    expect(css).toContain("--st-component-link-hoverText: #a83a44;");
    expect(css).toContain("--st-component-control-anatomy-field-borderTop: 1px solid #ddd7e6;");
  });
});
