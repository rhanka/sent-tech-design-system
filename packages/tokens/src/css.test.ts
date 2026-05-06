import { describe, expect, it } from "vitest";
import { component } from "./component.js";
import { flattenTokens, toCssVariables } from "./css.js";

describe("token CSS serialization", () => {
  it("flattens nested tokens with dash-separated paths", () => {
    expect(flattenTokens({ color: { brand: "#123456" } })).toEqual({
      "color-brand": "#123456"
    });
  });

  it("serializes CSS variables in a scoped selector", () => {
    expect(toCssVariables({ action: { primary: "#123456" } }, "[data-theme='x']")).toBe(
      "[data-theme='x'] {\n  --st-action-primary: #123456;\n}\n"
    );
  });

  it("contains stable chat component tokens", () => {
    expect(component.chat).toMatchObject({
      userBubbleBackground: expect.any(String),
      userBubbleText: expect.any(String),
      assistantBubbleBackground: expect.any(String),
      assistantBubbleText: expect.any(String),
      composerSurface: expect.any(String),
      toolCallSurface: expect.any(String)
    });
  });
});
