// React leg only. Proves that the existing `components-react` tests of this
// run exercise the modules EMITTED from the single JSX source, not their
// hand-written twins: the module-level switch of `vitest.react.config.ts`
// applies to importers inside `components-react/src`, so the barrel resolves
// to the emission while this file can still reach the hand-written module.
import { describe, expect, it } from "vitest";
import * as barrel from "../../components-react/src/index.js";
import * as handWrittenButton from "../../components-react/src/Button.js";
import * as handWrittenCatalog from "../../components-react/src/catalog.js";
import * as handWrittenInput from "../../components-react/src/Input.js";
import * as handWrittenPortal from "../../components-react/src/Portal.js";
import * as handWrittenRow from "../../components-react/src/SelectableRow.js";
import * as handWrittenTheme from "../../components-react/src/ThemeProvider.js";
import * as emitted from "../.react-emit/src/index.js";

const switched = ["Button", "Input", "Modal", "Tabs", "SelectableRow", "ChatComposer", "Portal", "ThemeProvider"] as const;

const handWritten: Record<(typeof switched)[number], unknown> = {
  Button: handWrittenButton.Button,
  Input: handWrittenInput.Input,
  Modal: handWrittenCatalog.Modal,
  Tabs: handWrittenCatalog.Tabs,
  SelectableRow: handWrittenRow.SelectableRow,
  ChatComposer: handWrittenCatalog.ChatComposer,
  Portal: handWrittenPortal.Portal,
  ThemeProvider: handWrittenTheme.ThemeProvider,
};

describe("React leg provenance", () => {
  for (const name of switched) {
    it(`the components-react barrel serves the emitted ${name}`, () => {
      expect(emitted[name]).toBeTruthy();
      expect(barrel[name]).toBe(emitted[name]);
      expect(barrel[name]).not.toBe(handWritten[name]);
    });
  }

  it("hand-written dependents share the contexts of the emitted SelectableRow", () => {
    expect(barrel.SelectableListContext).toBe(emitted.SelectableListContext);
    expect(barrel.SelectableListContext).not.toBe(handWrittenRow.SelectableListContext);
  });
});
