import { describe, expect, it } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { loadDeclarationProgram } from "../../src/generator/contracts/loader.js";
import { declarationPathForSource, followExportChain } from "../../src/generator/contracts/resolve.js";

describe("K1b declaration resolution (spec 6.1 step 2)", () => {
  it("maps source files to declaration files by package layout", () => {
    expect(declarationPathForSource("packages/components-svelte/src/lib/Button.svelte")).toBe(
      "packages/components-svelte/dist/Button.svelte.d.ts",
    );
    expect(declarationPathForSource("packages/components-react/src/Button.tsx")).toBe(
      "packages/components-react/dist/Button.d.ts",
    );
    expect(declarationPathForSource("packages/components-vue/src/Modal.ts")).toBe(
      "packages/components-vue/dist/Modal.d.ts",
    );
    expect(declarationPathForSource("packages/components-vue/src/DiagramCard.vue")).toBe(
      "packages/components-vue/dist/DiagramCard.vue.d.ts",
    );
    expect(declarationPathForSource("packages/components-angular/src/Modal.ts")).toBe(
      "packages/components-angular/dist/Modal.d.ts",
    );
    expect(declarationPathForSource("packages/dataviz-svelte/src/lib/WebFrame.svelte")).toBe(
      "packages/dataviz-svelte/dist/lib/WebFrame.svelte.d.ts",
    );
    expect(declarationPathForSource("packages/components-react/src/styles.css")).toBeNull();
  });

  it("follows re-export chains and fails loudly when unresolved", () => {
    const scratch = mkdtempSync(join(tmpdir(), "k1b-resolve-"));
    try {
      const start = join(scratch, "start.d.ts");
      const target = join(scratch, "target.d.ts");
      writeFileSync(start, `export { Widget } from "./target.js";\n`, "utf8");
      writeFileSync(target, `export interface Widget { label?: string }\n`, "utf8");
      const loaded = loadDeclarationProgram([start, target]);
      const resolved = followExportChain(loaded.program, start, "Widget");
      expect(resolved?.endsWith("target.d.ts")).toBe(true);
      expect(followExportChain(loaded.program, start, "Missing")).toBeNull();
    } finally {
      rmSync(scratch, { recursive: true, force: true });
    }
  });
});
