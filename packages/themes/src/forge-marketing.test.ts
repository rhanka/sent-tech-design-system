import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { compileTheme, compileThemeWithModes } from "./compile.js";
import { forgeTheme } from "./themes/forge.js";
import { sentTechTheme } from "./themes/sent-tech.js";

// Site marketing tokens of the Forge theme (public website): gradients at the
// semantic level, Hero / Section / Badge component tokens pointing at them.
describe("forge — site marketing tokens", () => {
  const light = compileTheme(forgeTheme);

  it("emits the website gradients as --st-semantic-gradient-*", () => {
    expect(light).toContain("--st-semantic-gradient-primary: linear-gradient(135deg, hsl(215 70% 25%), hsl(215 70% 35%));");
    expect(light).toContain("--st-semantic-gradient-accent: linear-gradient(135deg, hsl(185 85% 45%), hsl(195 85% 55%));");
    expect(light).toContain(
      "--st-semantic-gradient-hero: linear-gradient(135deg, hsl(215 70% 25%) 0%, hsl(215 60% 30%) 50%, hsl(185 70% 40%) 100%);"
    );
    expect(light).toContain("--st-semantic-gradient-subtle:");
  });

  it("points the Hero, Section and Badge tokens at the gradients", () => {
    expect(light).toContain("--st-component-hero-overlay: var(--st-semantic-gradient-hero);");
    expect(light).toContain("--st-component-hero-overlayOpacity: 0.9;");
    expect(light).toContain("--st-component-section-gradientBackground: var(--st-semantic-gradient-subtle);");
    expect(light).toContain("--st-component-section-inverseBackground: var(--st-semantic-gradient-primary);");
    expect(light).toContain("--st-component-badge-brandBackground: var(--st-semantic-gradient-accent);");
  });

  it("keeps the rest of the badge anatomy and ships dark gradients", () => {
    expect(light).toContain("--st-component-badge-radius:");
    const modes = compileThemeWithModes(forgeTheme);
    expect(modes).toContain("--st-semantic-gradient-hero: linear-gradient(135deg, hsl(215 60% 15%) 0%");
  });

  it("is forge-only: the base theme emits no gradient or marketing token", () => {
    const base = compileTheme(sentTechTheme);
    expect(base).not.toContain("--st-semantic-gradient-");
    expect(base).not.toContain("--st-component-hero-");
    expect(base).not.toContain("--st-component-section-");
  });

  it("the committed forge.css is the current build", () => {
    const css = readFileSync(join(process.cwd(), "css", "forge.css"), "utf8");
    expect(css).toContain(compileThemeWithModes(forgeTheme));
  });
});
