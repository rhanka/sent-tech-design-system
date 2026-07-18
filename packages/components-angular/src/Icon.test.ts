import "@angular/compiler";
import { describe, expect, it } from "vitest";

import { Icon, ICON_NAMES, type IconName } from "../dist/Icon.js";

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
