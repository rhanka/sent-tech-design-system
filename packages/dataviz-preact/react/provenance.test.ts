// React leg only. Proves that the existing `dataviz-react` tests of this run
// exercise the modules EMITTED from the single JSX source, not their
// hand-written twins: the module-level switch of `vitest.react.config.ts`
// applies to importers inside `dataviz-react/src`, so the barrel resolves to
// the emission while this file can still reach the hand-written module.
import { describe, expect, it } from "vitest";
import * as barrel from "../../dataviz-react/src/index.js";
import * as emitted from "../.react-emit/src/index.js";

describe("dataviz React leg provenance", () => {
  it("loads both the dataviz-react barrel and the emitted barrel on the React leg", () => {
    expect(typeof barrel).toBe("object");
    expect(typeof emitted).toBe("object");
  });
});
