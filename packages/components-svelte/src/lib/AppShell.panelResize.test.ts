import { fireEvent, render } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { describe, expect, it, vi } from "vitest";
import AppShell from "./AppShell.svelte";

const snippet = (html: string) => createRawSnippet(() => ({ render: () => `<div>${html}</div>` }));

const panelProps = {
  primaryRail: snippet("rail-content"),
  navigationPanel: snippet("nav-content"),
  main: snippet("main-content"),
  contextPanel: snippet("context-content"),
  utilityPanel: snippet("utility-content"),
};

describe("AppShell — panelResize default (false)", () => {
  it("renders no resize handles", () => {
    const { container } = render(AppShell, { props: { variant: "workspace", ...panelProps } });
    expect(container.querySelectorAll(".st-appShell__resizeHandle").length).toBe(0);
  });

  it("does not set an inline style on the shell root (byte-identical to today)", () => {
    const { container } = render(AppShell, {
      props: { variant: "workspace", ...panelProps, defaultPanelWidths: { navigationPanel: 400 } },
    });
    const root = container.querySelector(".st-appShell") as HTMLElement;
    // No `style` attribute at all — panelResize=false never touches width vars,
    // even if defaultPanelWidths is (pointlessly) supplied.
    expect(root.getAttribute("style")).toBeFalsy();
  });
});

describe("AppShell — panelResize=true", () => {
  it("renders exactly one resize handle per RESIZABLE present panel (navigation/context/utility)", () => {
    const { container } = render(AppShell, { props: { variant: "workspace", panelResize: true, ...panelProps } });
    const handles = container.querySelectorAll(".st-appShell__resizeHandle");
    expect(handles.length).toBe(3);
    handles.forEach((handle) => {
      expect(handle.getAttribute("role")).toBe("separator");
      expect(handle.getAttribute("aria-orientation")).toBe("vertical");
      expect(handle.getAttribute("tabindex")).toBe("0");
    });
  });

  it("renders NO handle on primaryRail, even with panelResize=true and the primaryRail slot present", () => {
    const { container } = render(AppShell, { props: { variant: "workspace", panelResize: true, ...panelProps } });
    // `primaryRail` is a fixed-width icon rail (à la VS Code's activity bar),
    // not a resizable panel — it is not part of `AppShellPanelKey` and must
    // never receive a handle, regardless of panelResize/panelWidths.
    expect(container.querySelector(".st-appShell__primaryRail .st-appShell__resizeHandle")).toBeNull();
    expect(container.querySelector(".st-appShell__primaryRail")).not.toBeNull(); // the rail itself still renders
  });

  it("labels each handle 'Resize {panel label}', falling back to the existing aria-label props", () => {
    const { container } = render(AppShell, {
      props: { variant: "workspace", panelResize: true, ...panelProps },
    });
    expect(container.querySelector('.st-appShell__navigationPanel .st-appShell__resizeHandle')?.getAttribute("aria-label")).toBe(
      "Resize Workspace navigation"
    );
    expect(container.querySelector('.st-appShell__contextPanel .st-appShell__resizeHandle')?.getAttribute("aria-label")).toBe(
      "Resize Context panel"
    );
    expect(container.querySelector('.st-appShell__utilityPanel .st-appShell__resizeHandle')?.getAttribute("aria-label")).toBe(
      "Resize Utility panel"
    );
  });

  it("defaults aria-valuemin/aria-valuemax to 180/640 and reports a clamped aria-valuenow", () => {
    const { container } = render(AppShell, { props: { variant: "workspace", panelResize: true, ...panelProps } });
    const handle = container.querySelector('.st-appShell__navigationPanel .st-appShell__resizeHandle') as HTMLElement;
    expect(handle.getAttribute("aria-valuemin")).toBe("180");
    expect(handle.getAttribute("aria-valuemax")).toBe("640");
    // No explicit/default width supplied — nominal 320px default is inside [180,640].
    expect(handle.getAttribute("aria-valuenow")).toBe("320");
  });

  it("honors custom panelMinWidth/panelMaxWidth on every handle", () => {
    const { container } = render(AppShell, {
      props: { variant: "workspace", panelResize: true, ...panelProps, panelMinWidth: 200, panelMaxWidth: 300 },
    });
    const handles = container.querySelectorAll(".st-appShell__resizeHandle");
    expect(handles.length).toBe(3);
    handles.forEach((handle) => {
      expect(handle.getAttribute("aria-valuemin")).toBe("200");
      expect(handle.getAttribute("aria-valuemax")).toBe("300");
    });
  });

  it("renders no handle for a panel that is not provided", () => {
    const { container } = render(AppShell, {
      props: { variant: "workspace", panelResize: true, navigationPanel: panelProps.navigationPanel, main: panelProps.main },
    });
    expect(container.querySelectorAll(".st-appShell__resizeHandle").length).toBe(1);
  });

  it("renders NO handle for utilityPanel when utilitySide='bottom', but keeps handles for the other resizable panels", () => {
    const { container } = render(AppShell, {
      props: { variant: "workspace", panelResize: true, utilitySide: "bottom", ...panelProps },
    });
    expect(container.querySelector(".st-appShell__utilityPanel .st-appShell__resizeHandle")).toBeNull();
    expect(container.querySelector(".st-appShell__navigationPanel .st-appShell__resizeHandle")).not.toBeNull();
    expect(container.querySelector(".st-appShell__contextPanel .st-appShell__resizeHandle")).not.toBeNull();
  });

  it("applies the width CSS custom properties to the shell root, one per explicitly-widthed panel", () => {
    const { container } = render(AppShell, {
      props: {
        variant: "workspace",
        panelResize: true,
        ...panelProps,
        defaultPanelWidths: { navigationPanel: 300, contextPanel: 260, utilityPanel: 420 },
      },
    });
    const root = container.querySelector(".st-appShell") as HTMLElement;
    expect(root.style.getPropertyValue("--st-appShell-navigation-width")).toBe("300px");
    expect(root.style.getPropertyValue("--st-appShell-context-width")).toBe("260px");
    expect(root.style.getPropertyValue("--st-appShell-utility-width")).toBe("420px");
    // primaryRail is not resizable — no rail-width var is ever emitted, regardless of panelResize.
    expect(root.style.getPropertyValue("--st-appShell-rail-width")).toBe("");
  });

  it("does not set a width var for a panel with no explicit/default/controlled width (defers to the token default)", () => {
    const { container } = render(AppShell, {
      props: { variant: "workspace", panelResize: true, ...panelProps, defaultPanelWidths: { navigationPanel: 300 } },
    });
    const root = container.querySelector(".st-appShell") as HTMLElement;
    expect(root.style.getPropertyValue("--st-appShell-navigation-width")).toBe("300px");
    expect(root.style.getPropertyValue("--st-appShell-context-width")).toBe("");
    expect(root.style.getPropertyValue("--st-appShell-utility-width")).toBe("");
  });
});

describe("AppShell — panelResize keyboard interaction (uncontrolled)", () => {
  it("ArrowRight grows a left-edge panel (navigationPanel) by 16px and fires onPanelResize", async () => {
    const onPanelResize = vi.fn();
    const { container } = render(AppShell, {
      props: {
        variant: "workspace",
        panelResize: true,
        ...panelProps,
        defaultPanelWidths: { navigationPanel: 300 },
        onPanelResize,
      },
    });
    const handle = container.querySelector('.st-appShell__navigationPanel .st-appShell__resizeHandle') as HTMLElement;
    await fireEvent.keyDown(handle, { key: "ArrowRight" });
    expect(onPanelResize).toHaveBeenCalledWith("navigationPanel", 316);
    expect(handle.getAttribute("aria-valuenow")).toBe("316");
  });

  it("ArrowLeft shrinks a left-edge panel (navigationPanel) by 16px", async () => {
    const onPanelResize = vi.fn();
    const { container } = render(AppShell, {
      props: {
        variant: "workspace",
        panelResize: true,
        ...panelProps,
        defaultPanelWidths: { navigationPanel: 300 },
        onPanelResize,
      },
    });
    const handle = container.querySelector('.st-appShell__navigationPanel .st-appShell__resizeHandle') as HTMLElement;
    await fireEvent.keyDown(handle, { key: "ArrowLeft" });
    expect(onPanelResize).toHaveBeenCalledWith("navigationPanel", 284);
  });

  it("ArrowRight SHRINKS a right-edge panel (contextPanel) — moving the splitter right moves toward main", async () => {
    const onPanelResize = vi.fn();
    const { container } = render(AppShell, {
      props: {
        variant: "workspace",
        panelResize: true,
        ...panelProps,
        defaultPanelWidths: { contextPanel: 300 },
        onPanelResize,
      },
    });
    const handle = container.querySelector('.st-appShell__contextPanel .st-appShell__resizeHandle') as HTMLElement;
    await fireEvent.keyDown(handle, { key: "ArrowRight" });
    expect(onPanelResize).toHaveBeenCalledWith("contextPanel", 284);
    await fireEvent.keyDown(handle, { key: "ArrowLeft" });
    expect(onPanelResize).toHaveBeenLastCalledWith("contextPanel", 300);
  });

  it("utilityPanel (default utilitySide='right') resizes like a right-edge panel", async () => {
    const onPanelResize = vi.fn();
    const { container } = render(AppShell, {
      props: {
        variant: "workspace",
        panelResize: true,
        ...panelProps,
        defaultPanelWidths: { utilityPanel: 300 },
        onPanelResize,
      },
    });
    const handle = container.querySelector('.st-appShell__utilityPanel .st-appShell__resizeHandle') as HTMLElement;
    await fireEvent.keyDown(handle, { key: "ArrowRight" });
    expect(onPanelResize).toHaveBeenCalledWith("utilityPanel", 284);
  });

  it("utilityPanel with utilitySide='left' resizes like a left-edge panel", async () => {
    const onPanelResize = vi.fn();
    const { container } = render(AppShell, {
      props: {
        variant: "workspace",
        panelResize: true,
        utilitySide: "left",
        ...panelProps,
        defaultPanelWidths: { utilityPanel: 300 },
        onPanelResize,
      },
    });
    const handle = container.querySelector('.st-appShell__utilityPanel .st-appShell__resizeHandle') as HTMLElement;
    await fireEvent.keyDown(handle, { key: "ArrowRight" });
    expect(onPanelResize).toHaveBeenCalledWith("utilityPanel", 316);
  });

  it("Home jumps to panelMinWidth and End jumps to panelMaxWidth, both firing onPanelResize", async () => {
    const onPanelResize = vi.fn();
    const { container } = render(AppShell, {
      props: {
        variant: "workspace",
        panelResize: true,
        ...panelProps,
        defaultPanelWidths: { navigationPanel: 300 },
        panelMinWidth: 150,
        panelMaxWidth: 500,
        onPanelResize,
      },
    });
    const handle = container.querySelector('.st-appShell__navigationPanel .st-appShell__resizeHandle') as HTMLElement;
    await fireEvent.keyDown(handle, { key: "Home" });
    expect(onPanelResize).toHaveBeenCalledWith("navigationPanel", 150);
    expect(handle.getAttribute("aria-valuenow")).toBe("150");
    await fireEvent.keyDown(handle, { key: "End" });
    expect(onPanelResize).toHaveBeenCalledWith("navigationPanel", 500);
    expect(handle.getAttribute("aria-valuenow")).toBe("500");
  });

  it("clamps at the upper bound: repeated ArrowRight never exceeds panelMaxWidth", async () => {
    const onPanelResize = vi.fn();
    const { container } = render(AppShell, {
      props: {
        variant: "workspace",
        panelResize: true,
        ...panelProps,
        defaultPanelWidths: { navigationPanel: 495 },
        panelMinWidth: 180,
        panelMaxWidth: 500,
        onPanelResize,
      },
    });
    const handle = container.querySelector('.st-appShell__navigationPanel .st-appShell__resizeHandle') as HTMLElement;
    await fireEvent.keyDown(handle, { key: "ArrowRight" }); // 495 + 16 = 511 -> clamped to 500
    expect(onPanelResize).toHaveBeenCalledWith("navigationPanel", 500);
    await fireEvent.keyDown(handle, { key: "ArrowRight" }); // stays clamped, still fires
    expect(onPanelResize).toHaveBeenLastCalledWith("navigationPanel", 500);
    expect(handle.getAttribute("aria-valuenow")).toBe("500");
  });

  it("clamps at the lower bound: repeated ArrowLeft never goes below panelMinWidth", async () => {
    const onPanelResize = vi.fn();
    const { container } = render(AppShell, {
      props: {
        variant: "workspace",
        panelResize: true,
        ...panelProps,
        defaultPanelWidths: { navigationPanel: 190 },
        panelMinWidth: 180,
        onPanelResize,
      },
    });
    const handle = container.querySelector('.st-appShell__navigationPanel .st-appShell__resizeHandle') as HTMLElement;
    await fireEvent.keyDown(handle, { key: "ArrowLeft" }); // 190 - 16 = 174 -> clamped to 180
    expect(onPanelResize).toHaveBeenCalledWith("navigationPanel", 180);
  });

  it("ignores keys other than ArrowLeft/ArrowRight/Home/End", async () => {
    const onPanelResize = vi.fn();
    const { container } = render(AppShell, {
      props: { variant: "workspace", panelResize: true, ...panelProps, onPanelResize },
    });
    const handle = container.querySelector('.st-appShell__navigationPanel .st-appShell__resizeHandle') as HTMLElement;
    await fireEvent.keyDown(handle, { key: "Tab" });
    await fireEvent.keyDown(handle, { key: "Enter" });
    expect(onPanelResize).not.toHaveBeenCalled();
  });
});

describe("AppShell — panelResize pointer drag (uncontrolled)", () => {
  it("dragging a left-edge handle rightward grows the panel and fires onPanelResize on move", async () => {
    const onPanelResize = vi.fn();
    const { container } = render(AppShell, {
      props: {
        variant: "workspace",
        panelResize: true,
        ...panelProps,
        defaultPanelWidths: { navigationPanel: 300 },
        onPanelResize,
      },
    });
    const handle = container.querySelector('.st-appShell__navigationPanel .st-appShell__resizeHandle') as HTMLElement;
    await fireEvent.pointerDown(handle, { clientX: 100, pointerId: 1 });
    await fireEvent.pointerMove(handle, { clientX: 140, pointerId: 1 });
    expect(onPanelResize).toHaveBeenCalledWith("navigationPanel", 340);
    await fireEvent.pointerUp(handle, { clientX: 140, pointerId: 1 });
    // Further movement after pointerup is a no-op (drag ended).
    onPanelResize.mockClear();
    await fireEvent.pointerMove(handle, { clientX: 200, pointerId: 1 });
    expect(onPanelResize).not.toHaveBeenCalled();
  });

  it("dragging a right-edge handle rightward shrinks the panel", async () => {
    const onPanelResize = vi.fn();
    const { container } = render(AppShell, {
      props: {
        variant: "workspace",
        panelResize: true,
        ...panelProps,
        defaultPanelWidths: { contextPanel: 300 },
        onPanelResize,
      },
    });
    const handle = container.querySelector('.st-appShell__contextPanel .st-appShell__resizeHandle') as HTMLElement;
    await fireEvent.pointerDown(handle, { clientX: 100, pointerId: 1 });
    await fireEvent.pointerMove(handle, { clientX: 140, pointerId: 1 });
    expect(onPanelResize).toHaveBeenCalledWith("contextPanel", 260);
  });
});

describe("AppShell — panelResize controlled mode (panelWidths)", () => {
  it("never mutates its own state: the rendered width stays exactly what panelWidths says, even after a commit-triggering interaction", async () => {
    const onPanelResize = vi.fn();
    const { container } = render(AppShell, {
      props: {
        variant: "workspace",
        panelResize: true,
        ...panelProps,
        panelWidths: { navigationPanel: 250, contextPanel: 300, utilityPanel: 400 },
        onPanelResize,
      },
    });
    const root = container.querySelector(".st-appShell") as HTMLElement;
    const handle = container.querySelector('.st-appShell__navigationPanel .st-appShell__resizeHandle') as HTMLElement;

    expect(handle.getAttribute("aria-valuenow")).toBe("250");
    expect(root.style.getPropertyValue("--st-appShell-navigation-width")).toBe("250px");

    await fireEvent.keyDown(handle, { key: "ArrowRight" });
    // onPanelResize told the consumer what the next width *should* be...
    expect(onPanelResize).toHaveBeenCalledWith("navigationPanel", 266);
    // ...but since the consumer (the test) never fed that back through the
    // `panelWidths` prop, the component itself must not have changed anything.
    expect(handle.getAttribute("aria-valuenow")).toBe("250");
    expect(root.style.getPropertyValue("--st-appShell-navigation-width")).toBe("250px");

    await fireEvent.pointerDown(handle, { clientX: 0, pointerId: 2 });
    await fireEvent.pointerMove(handle, { clientX: 50, pointerId: 2 });
    expect(onPanelResize).toHaveBeenLastCalledWith("navigationPanel", 300);
    expect(handle.getAttribute("aria-valuenow")).toBe("250");
  });

  it("re-renders from a new panelWidths prop (the consumer driving the loop back)", async () => {
    const { container, rerender } = render(AppShell, {
      props: { variant: "workspace", panelResize: true, ...panelProps, panelWidths: { navigationPanel: 250 } },
    });
    const root = container.querySelector(".st-appShell") as HTMLElement;
    expect(root.style.getPropertyValue("--st-appShell-navigation-width")).toBe("250px");
    await rerender({ variant: "workspace", panelResize: true, ...panelProps, panelWidths: { navigationPanel: 400 } });
    expect(root.style.getPropertyValue("--st-appShell-navigation-width")).toBe("400px");
  });
});
