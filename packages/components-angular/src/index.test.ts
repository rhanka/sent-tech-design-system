import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import "@angular/compiler";

import * as angular from "../dist/index.js";

const svelteIndex = readFileSync(resolve("../components-svelte/src/lib/index.ts"), "utf8");
const componentNames = [
  ...svelteIndex.matchAll(/export \{ default as (\w+)(?:,| \})/g),
].map((match) => match[1]);

describe("Angular public surface", () => {
  it.each(componentNames)("exports standalone %s component", (name) => {
    const value = angular[name];
    expect(typeof value).toBe("function");
    expect((value as { stComponentName?: string }).stComponentName).toBe(name);
  });

  it("exports Svelte-canonical runtime helpers", () => {
    expect(angular.identityInitial({ displayName: "Ada Lovelace" })).toBe("A");
    expect(angular.deriveInitials("Ada Lovelace")).toBe("AL");
    expect(angular.edgeDashArray("dotted")).toBe("1 4");
    expect(angular.nodeShapePath("diamond", 4)).toContain("L");
  });
});
