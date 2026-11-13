import { describe, expect, it } from "vitest";
import { DEFAULT_FLOW_TOKENS } from "../../src/layout/flows.js";
import { component } from "../../../tokens/dist/component.js";
import { componentDark } from "../../../tokens/dist/component.dark.js";

describe("DC-2c A14 frozen geometry", () => {
  it("keeps engine defaults aligned with component tokens in both modes", () => {
    for (const tokens of [component, componentDark]) {
      for (const [key, value] of Object.entries(DEFAULT_FLOW_TOKENS)) {
        expect(tokens.diagramScene[key as keyof typeof tokens.diagramScene]).toBe(String(value));
      }
    }
  });
});
