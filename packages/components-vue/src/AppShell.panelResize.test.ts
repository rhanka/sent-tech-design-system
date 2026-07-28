import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it, vi } from "vitest";
import { AppShell } from "./AppShell.js";

const panelSlots = {
  primaryRail: () => h("div", "rail-content"),
  navigationPanel: () => h("div", "nav-content"),
  main: () => h("div", "main-content"),
  contextPanel: () => h("div", "context-content"),
  utilityPanel: () => h("div", "utility-content"),
};

// `@vue/test-utils`' `trigger()` builds its PointerEvent by first constructing
// it (which correctly applies `clientX`/`pointerId` from the init dict) and
// THEN attempting a redundant `event[key] = value` re-assignment for every
// option key. That second step throws in this jsdom because `clientX` is a
// getter-only accessor inherited from `MouseEvent.prototype` — the property
// descriptor lookup in `trigger()` only checks the event's OWN prototype
// (`PointerEvent.prototype`), misses the inherited accessor, and wrongly
// concludes the property is writable. Dispatching the event directly (same
// pattern as `RangeSlider.test.ts`) avoids that redundant step entirely.
function dispatchPointer(el: Element, type: string, init: PointerEventInit) {
  return el.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, ...init }));
}

describe("AppShell — panelResize default (false)", () => {
  it("renders no resize handles", () => {
    const wrapper = mount(AppShell, { props: { variant: "workspace" }, slots: panelSlots });
    expect(wrapper.findAll(".st-appShell__resizeHandle").length).toBe(0);
  });

  it("does not set an inline style on the shell root (byte-identical to today)", () => {
    const wrapper = mount(AppShell, {
      props: { variant: "workspace", defaultPanelWidths: { navigationPanel: 400 } },
      slots: panelSlots,
    });
    const root = wrapper.find(".st-appShell").element as HTMLElement;
    // No `style` attribute at all — panelResize=false never touches width vars,
    // even if defaultPanelWidths is (pointlessly) supplied.
    expect(root.getAttribute("style")).toBeFalsy();
  });
});

describe("AppShell — panelResize=true", () => {
  it("renders exactly one resize handle per RESIZABLE present panel (navigation/context/utility)", () => {
    const wrapper = mount(AppShell, { props: { variant: "workspace", panelResize: true }, slots: panelSlots });
    const handles = wrapper.findAll(".st-appShell__resizeHandle");
    expect(handles.length).toBe(3);
    handles.forEach((handle) => {
      expect(handle.attributes("role")).toBe("separator");
      expect(handle.attributes("aria-orientation")).toBe("vertical");
      expect(handle.attributes("tabindex")).toBe("0");
    });
  });

  it("renders NO handle on primaryRail, even with panelResize=true and the primaryRail slot present", () => {
    const wrapper = mount(AppShell, { props: { variant: "workspace", panelResize: true }, slots: panelSlots });
    // `primaryRail` is a fixed-width icon rail (à la VS Code's activity bar),
    // not a resizable panel — it is not part of `AppShellPanelKey` and must
    // never receive a handle, regardless of panelResize/panelWidths.
    expect(wrapper.find(".st-appShell__primaryRail .st-appShell__resizeHandle").exists()).toBe(false);
    expect(wrapper.find(".st-appShell__primaryRail").exists()).toBe(true); // the rail itself still renders
  });

  it("labels each handle 'Resize {panel label}', falling back to the existing aria-label props", () => {
    const wrapper = mount(AppShell, { props: { variant: "workspace", panelResize: true }, slots: panelSlots });
    expect(wrapper.find(".st-appShell__navigationPanel .st-appShell__resizeHandle").attributes("aria-label")).toBe(
      "Resize Workspace navigation",
    );
    expect(wrapper.find(".st-appShell__contextPanel .st-appShell__resizeHandle").attributes("aria-label")).toBe(
      "Resize Context panel",
    );
    expect(wrapper.find(".st-appShell__utilityPanel .st-appShell__resizeHandle").attributes("aria-label")).toBe(
      "Resize Utility panel",
    );
  });

  it("defaults aria-valuemin/aria-valuemax to 180/640 and reports a clamped aria-valuenow", () => {
    const wrapper = mount(AppShell, { props: { variant: "workspace", panelResize: true }, slots: panelSlots });
    const handle = wrapper.find(".st-appShell__navigationPanel .st-appShell__resizeHandle");
    expect(handle.attributes("aria-valuemin")).toBe("180");
    expect(handle.attributes("aria-valuemax")).toBe("640");
    // No explicit/default width supplied — nominal 320px default is inside [180,640].
    expect(handle.attributes("aria-valuenow")).toBe("320");
  });

  it("honors custom panelMinWidth/panelMaxWidth on every handle", () => {
    const wrapper = mount(AppShell, {
      props: { variant: "workspace", panelResize: true, panelMinWidth: 200, panelMaxWidth: 300 },
      slots: panelSlots,
    });
    const handles = wrapper.findAll(".st-appShell__resizeHandle");
    expect(handles.length).toBe(3);
    handles.forEach((handle) => {
      expect(handle.attributes("aria-valuemin")).toBe("200");
      expect(handle.attributes("aria-valuemax")).toBe("300");
    });
  });

  it("renders no handle for a panel that is not provided", () => {
    const wrapper = mount(AppShell, {
      props: { variant: "workspace", panelResize: true },
      slots: { navigationPanel: panelSlots.navigationPanel, main: panelSlots.main },
    });
    expect(wrapper.findAll(".st-appShell__resizeHandle").length).toBe(1);
  });

  it("renders NO handle for utilityPanel when utilitySide='bottom', but keeps handles for the other resizable panels", () => {
    const wrapper = mount(AppShell, {
      props: { variant: "workspace", panelResize: true, utilitySide: "bottom" },
      slots: panelSlots,
    });
    expect(wrapper.find(".st-appShell__utilityPanel .st-appShell__resizeHandle").exists()).toBe(false);
    expect(wrapper.find(".st-appShell__navigationPanel .st-appShell__resizeHandle").exists()).toBe(true);
    expect(wrapper.find(".st-appShell__contextPanel .st-appShell__resizeHandle").exists()).toBe(true);
  });

  it("applies the width CSS custom properties to the shell root, one per explicitly-widthed panel", () => {
    const wrapper = mount(AppShell, {
      props: {
        variant: "workspace",
        panelResize: true,
        defaultPanelWidths: { navigationPanel: 300, contextPanel: 260, utilityPanel: 420 },
      },
      slots: panelSlots,
    });
    const root = wrapper.find(".st-appShell").element as HTMLElement;
    expect(root.style.getPropertyValue("--st-appShell-navigation-width")).toBe("300px");
    expect(root.style.getPropertyValue("--st-appShell-context-width")).toBe("260px");
    expect(root.style.getPropertyValue("--st-appShell-utility-width")).toBe("420px");
    // primaryRail is not resizable — no rail-width var is ever emitted, regardless of panelResize.
    expect(root.style.getPropertyValue("--st-appShell-rail-width")).toBe("");
  });

  it("does not set a width var for a panel with no explicit/default/controlled width (defers to the token default)", () => {
    const wrapper = mount(AppShell, {
      props: { variant: "workspace", panelResize: true, defaultPanelWidths: { navigationPanel: 300 } },
      slots: panelSlots,
    });
    const root = wrapper.find(".st-appShell").element as HTMLElement;
    expect(root.style.getPropertyValue("--st-appShell-navigation-width")).toBe("300px");
    expect(root.style.getPropertyValue("--st-appShell-context-width")).toBe("");
    expect(root.style.getPropertyValue("--st-appShell-utility-width")).toBe("");
  });
});

describe("AppShell — panelResize keyboard interaction (uncontrolled)", () => {
  it("ArrowRight grows a left-edge panel (navigationPanel) by 16px and fires onPanelResize", async () => {
    const onPanelResize = vi.fn();
    const wrapper = mount(AppShell, {
      props: { variant: "workspace", panelResize: true, defaultPanelWidths: { navigationPanel: 300 }, onPanelResize },
      slots: panelSlots,
    });
    const handle = wrapper.find(".st-appShell__navigationPanel .st-appShell__resizeHandle");
    await handle.trigger("keydown", { key: "ArrowRight" });
    expect(onPanelResize).toHaveBeenCalledTimes(1);
    expect(onPanelResize).toHaveBeenCalledWith("navigationPanel", 316);
    expect(handle.attributes("aria-valuenow")).toBe("316");
  });

  it("ArrowLeft shrinks a left-edge panel (navigationPanel) by 16px", async () => {
    const onPanelResize = vi.fn();
    const wrapper = mount(AppShell, {
      props: { variant: "workspace", panelResize: true, defaultPanelWidths: { navigationPanel: 300 }, onPanelResize },
      slots: panelSlots,
    });
    const handle = wrapper.find(".st-appShell__navigationPanel .st-appShell__resizeHandle");
    await handle.trigger("keydown", { key: "ArrowLeft" });
    expect(onPanelResize).toHaveBeenCalledWith("navigationPanel", 284);
  });

  it("ArrowRight SHRINKS a right-edge panel (contextPanel) — moving the splitter right moves toward main", async () => {
    const onPanelResize = vi.fn();
    const wrapper = mount(AppShell, {
      props: { variant: "workspace", panelResize: true, defaultPanelWidths: { contextPanel: 300 }, onPanelResize },
      slots: panelSlots,
    });
    const handle = wrapper.find(".st-appShell__contextPanel .st-appShell__resizeHandle");
    await handle.trigger("keydown", { key: "ArrowRight" });
    expect(onPanelResize).toHaveBeenCalledWith("contextPanel", 284);
    await handle.trigger("keydown", { key: "ArrowLeft" });
    expect(onPanelResize).toHaveBeenLastCalledWith("contextPanel", 300);
  });

  it("utilityPanel (default utilitySide='right') resizes like a right-edge panel", async () => {
    const onPanelResize = vi.fn();
    const wrapper = mount(AppShell, {
      props: { variant: "workspace", panelResize: true, defaultPanelWidths: { utilityPanel: 300 }, onPanelResize },
      slots: panelSlots,
    });
    const handle = wrapper.find(".st-appShell__utilityPanel .st-appShell__resizeHandle");
    await handle.trigger("keydown", { key: "ArrowRight" });
    expect(onPanelResize).toHaveBeenCalledWith("utilityPanel", 284);
  });

  it("utilityPanel with utilitySide='left' resizes like a left-edge panel", async () => {
    const onPanelResize = vi.fn();
    const wrapper = mount(AppShell, {
      props: {
        variant: "workspace",
        panelResize: true,
        utilitySide: "left",
        defaultPanelWidths: { utilityPanel: 300 },
        onPanelResize,
      },
      slots: panelSlots,
    });
    const handle = wrapper.find(".st-appShell__utilityPanel .st-appShell__resizeHandle");
    await handle.trigger("keydown", { key: "ArrowRight" });
    expect(onPanelResize).toHaveBeenCalledWith("utilityPanel", 316);
  });

  it("Home jumps to panelMinWidth and End jumps to panelMaxWidth, both firing onPanelResize", async () => {
    const onPanelResize = vi.fn();
    const wrapper = mount(AppShell, {
      props: {
        variant: "workspace",
        panelResize: true,
        defaultPanelWidths: { navigationPanel: 300 },
        panelMinWidth: 150,
        panelMaxWidth: 500,
        onPanelResize,
      },
      slots: panelSlots,
    });
    const handle = wrapper.find(".st-appShell__navigationPanel .st-appShell__resizeHandle");
    await handle.trigger("keydown", { key: "Home" });
    expect(onPanelResize).toHaveBeenCalledWith("navigationPanel", 150);
    expect(handle.attributes("aria-valuenow")).toBe("150");
    await handle.trigger("keydown", { key: "End" });
    expect(onPanelResize).toHaveBeenCalledWith("navigationPanel", 500);
    expect(handle.attributes("aria-valuenow")).toBe("500");
  });

  it("clamps at the upper bound: repeated ArrowRight never exceeds panelMaxWidth", async () => {
    const onPanelResize = vi.fn();
    const wrapper = mount(AppShell, {
      props: {
        variant: "workspace",
        panelResize: true,
        defaultPanelWidths: { navigationPanel: 495 },
        panelMinWidth: 180,
        panelMaxWidth: 500,
        onPanelResize,
      },
      slots: panelSlots,
    });
    const handle = wrapper.find(".st-appShell__navigationPanel .st-appShell__resizeHandle");
    await handle.trigger("keydown", { key: "ArrowRight" }); // 495 + 16 = 511 -> clamped to 500
    expect(onPanelResize).toHaveBeenCalledWith("navigationPanel", 500);
    await handle.trigger("keydown", { key: "ArrowRight" }); // stays clamped, still fires
    expect(onPanelResize).toHaveBeenLastCalledWith("navigationPanel", 500);
    expect(handle.attributes("aria-valuenow")).toBe("500");
  });

  it("clamps at the lower bound: repeated ArrowLeft never goes below panelMinWidth", async () => {
    const onPanelResize = vi.fn();
    const wrapper = mount(AppShell, {
      props: {
        variant: "workspace",
        panelResize: true,
        defaultPanelWidths: { navigationPanel: 190 },
        panelMinWidth: 180,
        onPanelResize,
      },
      slots: panelSlots,
    });
    const handle = wrapper.find(".st-appShell__navigationPanel .st-appShell__resizeHandle");
    await handle.trigger("keydown", { key: "ArrowLeft" }); // 190 - 16 = 174 -> clamped to 180
    expect(onPanelResize).toHaveBeenCalledWith("navigationPanel", 180);
  });

  it("ignores keys other than ArrowLeft/ArrowRight/Home/End", async () => {
    const onPanelResize = vi.fn();
    const wrapper = mount(AppShell, {
      props: { variant: "workspace", panelResize: true, onPanelResize },
      slots: panelSlots,
    });
    const handle = wrapper.find(".st-appShell__navigationPanel .st-appShell__resizeHandle");
    await handle.trigger("keydown", { key: "Tab" });
    await handle.trigger("keydown", { key: "Enter" });
    expect(onPanelResize).not.toHaveBeenCalled();
  });
});

describe("AppShell — panelResize pointer drag (uncontrolled)", () => {
  it("dragging a left-edge handle rightward grows the panel and fires onPanelResize on move", async () => {
    const onPanelResize = vi.fn();
    const wrapper = mount(AppShell, {
      props: { variant: "workspace", panelResize: true, defaultPanelWidths: { navigationPanel: 300 }, onPanelResize },
      slots: panelSlots,
    });
    const handle = wrapper.find(".st-appShell__navigationPanel .st-appShell__resizeHandle");
    // `@vue/test-utils`' `trigger()` cannot set read-only MouseEvent/PointerEvent
    // properties (clientX) on the inherited prototype in this jsdom — dispatch
    // real PointerEvents directly instead (same pattern as RangeSlider.test.ts).
    await dispatchPointer(handle.element, "pointerdown", { clientX: 100, pointerId: 1 });
    await dispatchPointer(handle.element, "pointermove", { clientX: 140, pointerId: 1 });
    expect(onPanelResize).toHaveBeenCalledWith("navigationPanel", 340);
    await dispatchPointer(handle.element, "pointerup", { clientX: 140, pointerId: 1 });
    // Further movement after pointerup is a no-op (drag ended).
    onPanelResize.mockClear();
    await dispatchPointer(handle.element, "pointermove", { clientX: 200, pointerId: 1 });
    expect(onPanelResize).not.toHaveBeenCalled();
  });

  it("dragging a right-edge handle rightward shrinks the panel", async () => {
    const onPanelResize = vi.fn();
    const wrapper = mount(AppShell, {
      props: { variant: "workspace", panelResize: true, defaultPanelWidths: { contextPanel: 300 }, onPanelResize },
      slots: panelSlots,
    });
    const handle = wrapper.find(".st-appShell__contextPanel .st-appShell__resizeHandle");
    await dispatchPointer(handle.element, "pointerdown", { clientX: 100, pointerId: 1 });
    await dispatchPointer(handle.element, "pointermove", { clientX: 140, pointerId: 1 });
    expect(onPanelResize).toHaveBeenCalledWith("contextPanel", 260);
  });
});

describe("AppShell — panelResize controlled mode (panelWidths)", () => {
  it("never mutates its own state: the rendered width stays exactly what panelWidths says, even after a commit-triggering interaction", async () => {
    const onPanelResize = vi.fn();
    const wrapper = mount(AppShell, {
      props: {
        variant: "workspace",
        panelResize: true,
        panelWidths: { navigationPanel: 250, contextPanel: 300, utilityPanel: 400 },
        onPanelResize,
      },
      slots: panelSlots,
    });
    const root = wrapper.find(".st-appShell").element as HTMLElement;
    const handle = wrapper.find(".st-appShell__navigationPanel .st-appShell__resizeHandle");

    expect(handle.attributes("aria-valuenow")).toBe("250");
    expect(root.style.getPropertyValue("--st-appShell-navigation-width")).toBe("250px");

    await handle.trigger("keydown", { key: "ArrowRight" });
    // onPanelResize told the consumer what the next width *should* be...
    expect(onPanelResize).toHaveBeenCalledWith("navigationPanel", 266);
    // ...but since the consumer (the test) never fed that back through the
    // `panelWidths` prop, the component itself must not have changed anything.
    expect(handle.attributes("aria-valuenow")).toBe("250");
    expect(root.style.getPropertyValue("--st-appShell-navigation-width")).toBe("250px");

    await dispatchPointer(handle.element, "pointerdown", { clientX: 0, pointerId: 2 });
    await dispatchPointer(handle.element, "pointermove", { clientX: 50, pointerId: 2 });
    expect(onPanelResize).toHaveBeenLastCalledWith("navigationPanel", 300);
    expect(handle.attributes("aria-valuenow")).toBe("250");
  });

  it("re-renders from a new panelWidths prop (the consumer driving the loop back)", async () => {
    const wrapper = mount(AppShell, {
      props: { variant: "workspace", panelResize: true, panelWidths: { navigationPanel: 250 } },
      slots: panelSlots,
    });
    const root = wrapper.find(".st-appShell").element as HTMLElement;
    expect(root.style.getPropertyValue("--st-appShell-navigation-width")).toBe("250px");
    await wrapper.setProps({ panelWidths: { navigationPanel: 400 } });
    expect(root.style.getPropertyValue("--st-appShell-navigation-width")).toBe("400px");
  });
});
