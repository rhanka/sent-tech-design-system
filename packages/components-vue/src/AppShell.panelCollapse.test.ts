import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it } from "vitest";
import { AppShell } from "./AppShell.js";

const panelSlots = {
  primaryRail: () => h("div", "rail-content"),
  navigationPanel: () => h("div", "nav-content"),
  main: () => h("div", "main-content"),
  contextPanel: () => h("div", "context-content"),
  utilityPanel: () => h("div", "utility-content"),
};

describe("AppShell — panelCollapse default (stack)", () => {
  it("renders no disclosure buttons and no panel-region wrappers when panelCollapse is omitted", () => {
    const wrapper = mount(AppShell, { props: { variant: "workspace" }, slots: panelSlots });
    expect(wrapper.findAll(".st-appShell__panelDisclosure").length).toBe(0);
    expect(wrapper.findAll(".st-appShell__panelRegion").length).toBe(0);
  });

  it("renders no disclosure buttons when panelCollapse is explicitly 'stack'", () => {
    const wrapper = mount(AppShell, { props: { variant: "workspace", panelCollapse: "stack" }, slots: panelSlots });
    expect(wrapper.findAll(".st-appShell__panelDisclosure").length).toBe(0);
  });

  it("still renders every panel's content directly inside its aside (unchanged desktop/stack markup)", () => {
    const wrapper = mount(AppShell, { props: { variant: "workspace" }, slots: panelSlots });
    expect(wrapper.find(".st-appShell__primaryRail").text()).toContain("rail-content");
    expect(wrapper.find(".st-appShell__navigationPanel").text()).toContain("nav-content");
    expect(wrapper.find(".st-appShell__main").text()).toContain("main-content");
    expect(wrapper.find(".st-appShell__contextPanel").text()).toContain("context-content");
    expect(wrapper.find(".st-appShell__utilityPanel").text()).toContain("utility-content");
  });

  it('sets data-panel-collapse="stack" on the root by default', () => {
    const wrapper = mount(AppShell, { props: { variant: "workspace" }, slots: panelSlots });
    expect(wrapper.find(".st-appShell").attributes("data-panel-collapse")).toBe("stack");
  });
});

describe("AppShell — panelCollapse='accordion'", () => {
  it("renders a disclosure button for each present panel, all initially collapsed", () => {
    const wrapper = mount(AppShell, { props: { variant: "workspace", panelCollapse: "accordion" }, slots: panelSlots });
    const buttons = wrapper.findAll(".st-appShell__panelDisclosure");
    expect(buttons.length).toBe(4);
    buttons.forEach((btn) => {
      expect(btn.attributes("aria-expanded")).toBe("false");
    });
  });

  it("wires aria-controls on each trigger to the id of its region, and the region is labelled by the trigger", () => {
    const wrapper = mount(AppShell, { props: { variant: "workspace", panelCollapse: "accordion" }, slots: panelSlots });
    const buttons = wrapper.findAll(".st-appShell__panelDisclosure");
    expect(buttons.length).toBeGreaterThan(0);
    for (const button of buttons) {
      const controlsId = button.attributes("aria-controls");
      expect(controlsId).toBeTruthy();
      const region = wrapper.find(`#${controlsId}`);
      expect(region.exists()).toBe(true);
      expect(region.attributes("role")).toBe("region");
      expect(region.attributes("aria-labelledby")).toBe(button.attributes("id"));
    }
  });

  it("toggles aria-expanded on click and reflects the collapsed state on the region", async () => {
    const wrapper = mount(AppShell, { props: { variant: "workspace", panelCollapse: "accordion" }, slots: panelSlots });
    const trigger = wrapper.find("#st-appShell-navigationPanel-trigger");
    const region = wrapper.find("#st-appShell-navigationPanel-region");
    expect(trigger.attributes("aria-expanded")).toBe("false");
    expect(region.classes()).toContain("st-appShell__panelRegion--collapsed");

    await trigger.trigger("click");
    expect(trigger.attributes("aria-expanded")).toBe("true");
    expect(region.classes()).not.toContain("st-appShell__panelRegion--collapsed");

    await trigger.trigger("click");
    expect(trigger.attributes("aria-expanded")).toBe("false");
    expect(region.classes()).toContain("st-appShell__panelRegion--collapsed");
  });

  it("toggles via the keyboard (Enter/Space activate a native button)", async () => {
    const wrapper = mount(AppShell, { props: { variant: "workspace", panelCollapse: "accordion" }, slots: panelSlots });
    const trigger = wrapper.find("#st-appShell-contextPanel-trigger");
    expect(trigger.attributes("aria-expanded")).toBe("false");
    // Native <button> activates on Enter/Space via its click event; assert the
    // handler is reachable through a synthesized click (jsdom does not
    // synthesize the keydown->click default action for us).
    await trigger.trigger("click");
    expect(trigger.attributes("aria-expanded")).toBe("true");
  });

  it("renders no disclosure for a panel that is not provided", () => {
    const wrapper = mount(AppShell, {
      props: { variant: "workspace", panelCollapse: "accordion" },
      slots: { navigationPanel: () => h("div", "nav-only"), main: panelSlots.main },
    });
    const buttons = wrapper.findAll(".st-appShell__panelDisclosure");
    expect(buttons.length).toBe(1);
    expect(wrapper.find(".st-appShell__primaryRail").exists()).toBe(false);
    expect(wrapper.find(".st-appShell__contextPanel").exists()).toBe(false);
    expect(wrapper.find(".st-appShell__utilityPanel").exists()).toBe(false);
  });

  it("keeps the panel content mounted in the DOM even while collapsed (no destroy/remount)", () => {
    const wrapper = mount(AppShell, { props: { variant: "workspace", panelCollapse: "accordion" }, slots: panelSlots });
    // Collapsed by default, yet content is present — collapse is a CSS
    // concern (sizing/hiding the region), never a conditional v-if.
    expect(wrapper.find("#st-appShell-utilityPanel-region").text()).toContain("utility-content");
  });

  it("desktop markup still contains the panel content (accordion mode never removes it)", () => {
    const wrapper = mount(AppShell, { props: { variant: "workspace", panelCollapse: "accordion" }, slots: panelSlots });
    // jsdom does not evaluate @media queries for layout, but the component
    // must not conditionally destroy content based on breakpoint — assert
    // every panel's content is present regardless.
    expect(wrapper.find(".st-appShell__primaryRail").text()).toContain("rail-content");
    expect(wrapper.find(".st-appShell__navigationPanel").text()).toContain("nav-content");
    expect(wrapper.find(".st-appShell__contextPanel").text()).toContain("context-content");
    expect(wrapper.find(".st-appShell__utilityPanel").text()).toContain("utility-content");
  });

  it("uses custom *Label props as the disclosure text, falling back to the existing aria-label props", () => {
    const wrapper = mount(AppShell, {
      props: {
        variant: "workspace",
        panelCollapse: "accordion",
        primaryRailLabel: "Rail perso",
        contextLabel: "Contexte",
        utilityPanelLabel: "Outils",
      },
      slots: panelSlots,
    });
    expect(wrapper.find("#st-appShell-primaryRail-trigger").text()).toContain("Rail perso");
    // contextPanelLabel not set -> falls back to contextLabel.
    expect(wrapper.find("#st-appShell-contextPanel-trigger").text()).toContain("Contexte");
    expect(wrapper.find("#st-appShell-utilityPanel-trigger").text()).toContain("Outils");
  });

  it('sets data-panel-collapse="accordion" on the root', () => {
    const wrapper = mount(AppShell, { props: { variant: "workspace", panelCollapse: "accordion" }, slots: panelSlots });
    expect(wrapper.find(".st-appShell").attributes("data-panel-collapse")).toBe("accordion");
  });
});
