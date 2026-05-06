import { describe, expect, it } from "vitest";
import { compileTheme } from "./compile.js";
import { sentTechTheme } from "./themes/sent-tech.js";

describe("compileTheme", () => {
  it("compiles a tenant theme into scoped CSS variables", () => {
    const css = compileTheme(sentTechTheme);
    expect(css).toContain('[data-st-theme="sent-tech"]');
    expect(css).toContain("--st-semantic-action-primary:");
    expect(css).toContain("--st-component-chat-composerSurface:");
  });

  it("rejects malformed themes", () => {
    expect(() => compileTheme({ id: "", label: "Broken", mode: "light", tokens: {} })).toThrow(
      "Theme id is required"
    );
  });
});
