import "@angular/compiler";
import { describe, expect, it } from "vitest";

import { Icon, ICON_NAMES, type IconGlyph, type IconName } from "../dist/Icon.js";

describe("Icon (angular)", () => {
  it("resolves node data for every canonical name", () => {
    for (const name of ICON_NAMES) {
      const component = new Icon();
      component.name = name as IconName;
      expect(component.nodes, `expected node data for icon "${name}"`).toBeTruthy();
      expect((component.nodes ?? []).length).toBeGreaterThan(0);
    }
  });

  it("returns null nodes for an unknown name", () => {
    const component = new Icon();
    component.name = "does-not-exist" as IconName;
    expect(component.nodes).toBeNull();
  });

  it("composes the canonical st-icon host class with a consumer class", () => {
    const component = new Icon();
    component.name = "settings";
    component.classInput = "app-gear";
    expect(component.hostClass).toContain("st-icon");
    expect(component.hostClass).toContain("app-gear");
  });

  it("exposes settings as a path + circle glyph (lucide stroke-24 parity)", () => {
    const component = new Icon();
    component.name = "settings";
    const tags = (component.nodes ?? []).map((n) => n[0]);
    expect(tags).toEqual(["path", "circle"]);
  });
});

describe("Icon glyph input (any lucide icon)", () => {
  // Rocket nodes, verbatim from the vanilla `lucide` package (0.562.0):
  // `import { Rocket } from "lucide"` is exactly this IconNode value, which a
  // consumer passes as `glyph`. Inlined here because this package must not
  // depend on lucide.
  const ROCKET: IconGlyph = [
    ["path", { d: "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" }],
    ["path", { d: "m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" }],
    ["path", { d: "M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" }],
    ["path", { d: "M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" }],
  ];

  // EyeOff nodes from the same source, for the glyph-vs-name check below.
  const EYE_OFF: IconGlyph = [
    ["path", { d: "M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" }],
    ["path", { d: "M14.084 14.158a3 3 0 0 1-4.242-4.242" }],
    ["path", { d: "M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" }],
    ["path", { d: "m2 2 20 20" }],
  ];

  it("resolves nodes from a glyph passed directly", () => {
    const component = new Icon();
    component.glyph = ROCKET;
    expect(component.nodes).toBe(ROCKET);
  });

  it("resolves the same nodes for glyph as for the name mapping to the same lucide icon", () => {
    const viaName = new Icon();
    viaName.name = "eye-off";
    const viaGlyph = new Icon();
    viaGlyph.glyph = EYE_OFF;
    // Same rendering code path (the template iterates `nodes`), so equal
    // node data renders an identical svg.
    expect(viaGlyph.nodes).toEqual(viaName.nodes);
  });

  it("lets glyph win when both name and glyph are set", () => {
    const component = new Icon();
    component.name = "eye";
    component.glyph = EYE_OFF;
    const eyeOnly = new Icon();
    eyeOnly.name = "eye";
    expect(component.nodes).not.toEqual(eyeOnly.nodes);
    const eyeOffOnly = new Icon();
    eyeOffOnly.name = "eye-off";
    expect(component.nodes).toEqual(eyeOffOnly.nodes);
  });

  it("returns null nodes when neither name nor glyph is set", () => {
    expect(new Icon().nodes).toBeNull();
  });

  it("composes the canonical st-icon host class with a consumer class for a glyph", () => {
    const component = new Icon();
    component.glyph = ROCKET;
    component.classInput = "app-gear";
    expect(component.hostClass).toContain("st-icon");
    expect(component.hostClass).toContain("app-gear");
  });
});
