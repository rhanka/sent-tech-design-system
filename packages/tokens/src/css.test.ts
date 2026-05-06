import { describe, expect, it } from "vitest";
import { flattenTokens, toCssVariables } from "./css";

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
});
