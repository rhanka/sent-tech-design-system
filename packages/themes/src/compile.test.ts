import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { compileTheme, compileThemeWithModes } from "./compile.js";
import { sentTechTheme } from "./themes/sent-tech.js";

describe("compileTheme", () => {
  it("compiles a tenant theme into scoped CSS variables", () => {
    const css = compileTheme(sentTechTheme);
    expect(css).toContain('[data-st-theme="sent-tech"]');
    expect(css).toContain("--st-foundation-font-sans:");
    expect(css).toContain("--st-semantic-action-primary:");
    expect(css).toContain("--st-component-chat-composerSurface:");
  });

  it("rejects malformed themes", () => {
    expect(() => compileTheme({ id: "", label: "Broken", mode: "light", tokens: {} })).toThrow(
      "Theme id is required"
    );
  });

  it("exports build-time CSS for Forge low-coupling integration", () => {
    const css = readFileSync(join(process.cwd(), "css", "forge.css"), "utf8");
    expect(css).toContain('[data-st-theme="forge"]');
    expect(css).toContain("--st-foundation-font-sans");
    expect(css).toContain("--st-semantic-action-primary");
    expect(css).toContain("--st-component-dataTable-headerBackground");
  });
});

describe("compileThemeWithModes", () => {
  it("emits 3 blocks when tokensDark is present", () => {
    const css = compileThemeWithModes(sentTechTheme);
    // Block 1: light root
    expect(css).toContain('[data-st-theme="sent-tech"]');
    expect(css).toContain("color-scheme: light");
    // Block 2: auto dark (@media)
    expect(css).toContain('prefers-color-scheme: dark');
    expect(css).toContain(':root:not([data-color-mode="light"])');
    // Block 3: explicit dark toggle
    expect(css).toContain(':root[data-color-mode="dark"]');
    expect(css).toContain("color-scheme: dark");
  });

  it("falls back to single block when tokensDark is absent", () => {
    const themeNoModes = { ...sentTechTheme, tokensDark: undefined };
    const css = compileThemeWithModes(themeNoModes);
    expect(css).not.toContain("prefers-color-scheme");
    expect(css).not.toContain('data-color-mode="dark"');
  });

  it("dark block contains dark surface tokens", () => {
    const css = compileThemeWithModes(sentTechTheme);
    // The dark surface.default value from semanticDark
    expect(css).toContain("oklch(15%");
  });
});
