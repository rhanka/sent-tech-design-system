import "@angular/compiler";
import { describe, expect, it } from "vitest";

import { AppShell } from "../dist/AppShell.js";

describe("AppShell — panelCollapse default (stack)", () => {
  it("defaults panelCollapse to 'stack'", () => {
    const component = new AppShell();
    expect(component.panelCollapse).toBe("stack");
  });

  it("defaults primaryRailLabel to 'Primary rail'", () => {
    const component = new AppShell();
    expect(component.primaryRailLabel).toBe("Primary rail");
  });

  it("keeps every panel region reported as not-collapsed in stack mode, regardless of open state", () => {
    const component = new AppShell();
    // Stack mode never reads the per-panel open state — the region is never
    // collapsed via CSS in this mode, matching today's always-expanded stack.
    expect(component.primaryRailRegionCollapsed).toBe(false);
    expect(component.navigationPanelRegionCollapsed).toBe(false);
    expect(component.contextPanelRegionCollapsed).toBe(false);
    expect(component.utilityPanelRegionCollapsed).toBe(false);

    component.primaryRailPanelOpen = true;
    component.navigationPanelOpen = true;
    expect(component.primaryRailRegionCollapsed).toBe(false);
    expect(component.navigationPanelRegionCollapsed).toBe(false);
  });

  it("starts every panel's disclosure state closed", () => {
    const component = new AppShell();
    expect(component.primaryRailPanelOpen).toBe(false);
    expect(component.navigationPanelOpen).toBe(false);
    expect(component.contextPanelOpen).toBe(false);
    expect(component.utilityPanelOpen).toBe(false);
  });
});

describe("AppShell — panelCollapse='accordion' disclosure wiring", () => {
  it("exposes stable, distinct trigger/region ids for every panel", () => {
    const component = new AppShell();
    component.panelCollapse = "accordion";

    const ids = [
      component.primaryRailTriggerId,
      component.primaryRailRegionId,
      component.navigationPanelTriggerId,
      component.navigationPanelRegionId,
      component.contextPanelTriggerId,
      component.contextPanelRegionId,
      component.utilityPanelTriggerId,
      component.utilityPanelRegionId,
    ];
    expect(new Set(ids).size).toBe(ids.length);

    expect(component.primaryRailTriggerId).toBe("st-appShell-primaryRail-trigger");
    expect(component.primaryRailRegionId).toBe("st-appShell-primaryRail-region");
    expect(component.navigationPanelTriggerId).toBe("st-appShell-navigationPanel-trigger");
    expect(component.navigationPanelRegionId).toBe("st-appShell-navigationPanel-region");
    expect(component.contextPanelTriggerId).toBe("st-appShell-contextPanel-trigger");
    expect(component.contextPanelRegionId).toBe("st-appShell-contextPanel-region");
    expect(component.utilityPanelTriggerId).toBe("st-appShell-utilityPanel-trigger");
    expect(component.utilityPanelRegionId).toBe("st-appShell-utilityPanel-region");
  });

  it("reports every panel region collapsed by default in accordion mode", () => {
    const component = new AppShell();
    component.panelCollapse = "accordion";
    expect(component.primaryRailRegionCollapsed).toBe(true);
    expect(component.navigationPanelRegionCollapsed).toBe(true);
    expect(component.contextPanelRegionCollapsed).toBe(true);
    expect(component.utilityPanelRegionCollapsed).toBe(true);
  });

  it("togglePrimaryRailPanel flips open state and region-collapsed reflects it, independent of other panels", () => {
    const component = new AppShell();
    component.panelCollapse = "accordion";

    expect(component.primaryRailPanelOpen).toBe(false);
    component.togglePrimaryRailPanel();
    expect(component.primaryRailPanelOpen).toBe(true);
    expect(component.primaryRailRegionCollapsed).toBe(false);
    // Untouched panels stay collapsed.
    expect(component.navigationPanelRegionCollapsed).toBe(true);

    component.togglePrimaryRailPanel();
    expect(component.primaryRailPanelOpen).toBe(false);
    expect(component.primaryRailRegionCollapsed).toBe(true);
  });

  it("toggleNavigationPanel / toggleContextPanel / toggleUtilityPanel each flip only their own panel", () => {
    const component = new AppShell();
    component.panelCollapse = "accordion";

    component.toggleNavigationPanel();
    expect(component.navigationPanelOpen).toBe(true);
    expect(component.contextPanelOpen).toBe(false);
    expect(component.utilityPanelOpen).toBe(false);

    component.toggleContextPanel();
    expect(component.contextPanelOpen).toBe(true);
    expect(component.utilityPanelOpen).toBe(false);

    component.toggleUtilityPanel();
    expect(component.utilityPanelOpen).toBe(true);

    // All three now open and un-collapsed.
    expect(component.navigationPanelRegionCollapsed).toBe(false);
    expect(component.contextPanelRegionCollapsed).toBe(false);
    expect(component.utilityPanelRegionCollapsed).toBe(false);
  });
});

describe("AppShell — disclosure label resolution", () => {
  it("falls back navigationPanelLabelResolved to navigationLabel when navigationPanelLabel is unset", () => {
    const component = new AppShell();
    component.navigationLabel = "Navigation personnalisée";
    expect(component.navigationPanelLabelResolved).toBe("Navigation personnalisée");
  });

  it("prefers navigationPanelLabel over navigationLabel when both are set", () => {
    const component = new AppShell();
    component.navigationLabel = "Navigation personnalisée";
    component.navigationPanelLabel = "Nav perso";
    expect(component.navigationPanelLabelResolved).toBe("Nav perso");
  });

  it("falls back contextPanelLabelResolved to contextLabel when contextPanelLabel is unset", () => {
    const component = new AppShell();
    component.contextLabel = "Contexte";
    expect(component.contextPanelLabelResolved).toBe("Contexte");
  });

  it("falls back utilityPanelLabelResolved to utilityLabel when utilityPanelLabel is unset", () => {
    const component = new AppShell();
    component.utilityLabel = "Outils";
    expect(component.utilityPanelLabelResolved).toBe("Outils");
  });

  it("prefers utilityPanelLabel over utilityLabel when both are set", () => {
    const component = new AppShell();
    component.utilityLabel = "Outils";
    component.utilityPanelLabel = "Outils perso";
    expect(component.utilityPanelLabelResolved).toBe("Outils perso");
  });

  it("uses default labels ('Workspace navigation' / 'Context panel' / 'Utility panel') with no input set", () => {
    const component = new AppShell();
    expect(component.navigationPanelLabelResolved).toBe("Workspace navigation");
    expect(component.contextPanelLabelResolved).toBe("Context panel");
    expect(component.utilityPanelLabelResolved).toBe("Utility panel");
  });
});

describe("AppShell — hostClass composition", () => {
  it("composes the st-appShell + variant + consumer class", () => {
    const component = new AppShell();
    component.variant = "workspace";
    component.classInput = "app-shell-consumer";
    expect(component.hostClass).toBe("st-appShell st-appShell--workspace app-shell-consumer");
  });
});
