import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";

// React leg: the unmodified test files of `components-react` run against the
// React tree emitted from the single JSX source (`npm run emit:react`).
const here = dirname(fileURLToPath(import.meta.url));
const packagesDir = resolve(here, "..");
const handWritten = resolve(packagesDir, "components-react/src");
const emitted = resolve(here, ".react-emit/src");

/**
 * Module-level switch. Inside the hand-written React tree, an import of
 * `./<Module>.js` resolves to the emitted module whenever the emission holds
 * one of that name. `index.ts`, the tests and every hand-written dependent
 * (for example `SelectableList` reading the contexts of `SelectableRow`) then
 * share the emitted module, exactly as they would once the hand-written file
 * is deleted.
 */
function emittedReactModules(): Plugin {
  return {
    name: "st-emitted-react-modules",
    enforce: "pre",
    resolveId(source, importer) {
      if (!importer || dirname(importer.split("?")[0]) !== handWritten) return null;
      const match = /^\.\/([A-Za-z0-9_-]+)\.js$/.exec(source);
      // The barrel stays the hand-written one: it is the public surface under test.
      if (!match || match[1] === "index") return null;
      for (const extension of [".tsx", ".ts"]) {
        const candidate = resolve(emitted, match[1] + extension);
        if (existsSync(candidate)) return candidate;
      }
      return null;
    },
  };
}

/** Existing `components-react` test files that exercise an emitted module. */
const reactTests = [
  "ChoiceSearchExtensions", // emitted Checkbox (description/trailing) + Search (fluid)
  "behavior", // Tabs keyboard, Modal focus trap / scroll lock / Escape
  "catalog", // Tabs, Modal, ChatComposer, Button in the catalogue render
  "index", // DS class contract of every component, the six included
  "svelte-api-parity", // Tabs `onchange` alias
  "SelectableRow", // forwardRef + context witness
  "SelectableList", // hand-written list driving the emitted row through context
  "Positioning", // Portal (emitted) and Popper (hand-written, on the emitted Portal)
  "GroupsIdentity", // ButtonGroup around the emitted Button
  "NavActionStack", // hand-written dependent of Button
  "NavItem", // hand-written dependent of SelectableRow
  "TimeRangePicker", // hand-written dependent of Button, Input, SelectableRow
  "TimeRangePicker.states",
  "MenuPopover", // hand-written menus on the emitted Portal + emitted P3 host (children mode) of the emitted TimeRangePicker
  "Layout", // Flex, Stack, Inline, Container, Row, Col, Grid, Hidden, Divider
  "ErrorSummary", // emitted P1 feedback module
  "FieldCard", // emitted P1 layout module
  "StatusDot", // emitted P1 feedback module
  "Timeline", // emitted P1 feedback module
  "PanelStack", // emitted PanelStack + PanelSection pair (P4c dependency of P1)
  "Specialized", // emitted Rating + Autosave (sole components-react suite for both)
  "NavSection", // hand-written dependent of the emitted Collapsible (trailing, open, aria-label)
  "parity-0.3.0", // emitted Notification via the parity suite (onDismiss)
  "RangeSlider", // emitted P2 form module
  "MenuCascade", // emitted Menu cascade, hover-intent and safe-triangle behaviour
  "Shell", // emitted Menu exercised through the Shell suite
  "ColorSwatch", // emitted P3 data module (chip sizing / aria-label derivation)
  "TreeViewSelect", // emitted P3 TreeView selection payloads
  "TreeViewAccessibleName", // emitted P3 TreeView accessible-name precedence
];

/** `components-react` suites whose test file is `.test.ts` (not `.test.tsx`). */
const reactTestTs = [
  "menu-cascade", // pure solver of the emitted menu-cascade helper (Svelte parity)
];

export default defineConfig({
  root: packagesDir,
  cacheDir: resolve(here, "node_modules/.vite-react-leg"),
  plugins: [emittedReactModules()],
  resolve: { dedupe: ["react", "react-dom"] },
  test: {
    environment: "jsdom",
    testTimeout: 20000,
    include: [
      ...reactTests.map((name) => `components-react/src/${name}.test.tsx`),
      ...reactTestTs.map((name) => `components-react/src/${name}.test.ts`),
      // React-leg checks of this package: provenance, and the adapter paths that
      // no `components-react` test reaches (text input, focus inside a row).
      "components-preact/react/*.test.{ts,tsx}",
    ],
  },
});
