import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { AppShell } from "./AppShell.js";

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

const panelProps = {
  primaryRail: <div>rail-content</div>,
  navigationPanel: <div>nav-content</div>,
  main: <div>main-content</div>,
  contextPanel: <div>context-content</div>,
  utilityPanel: <div>utility-content</div>,
};

describe("AppShell — panelCollapse default (stack)", () => {
  it("renders no disclosure buttons and no panel-region wrappers when panelCollapse is omitted", () => {
    const { container } = render(<AppShell variant="workspace" {...panelProps} />);
    expect(container.querySelectorAll(".st-appShell__panelDisclosure").length).toBe(0);
    expect(container.querySelectorAll(".st-appShell__panelRegion").length).toBe(0);
  });

  it("renders no disclosure buttons when panelCollapse is explicitly 'stack'", () => {
    const { container } = render(<AppShell variant="workspace" panelCollapse="stack" {...panelProps} />);
    expect(container.querySelectorAll(".st-appShell__panelDisclosure").length).toBe(0);
  });

  it("still renders every panel's content directly inside its aside (unchanged desktop/stack markup)", () => {
    const { container } = render(<AppShell variant="workspace" {...panelProps} />);
    expect(container.querySelector(".st-appShell__primaryRail")?.textContent).toContain("rail-content");
    expect(container.querySelector(".st-appShell__navigationPanel")?.textContent).toContain("nav-content");
    expect(container.querySelector(".st-appShell__main")?.textContent).toContain("main-content");
    expect(container.querySelector(".st-appShell__contextPanel")?.textContent).toContain("context-content");
    expect(container.querySelector(".st-appShell__utilityPanel")?.textContent).toContain("utility-content");
  });

  it('sets data-panel-collapse="stack" on the root by default', () => {
    const { container } = render(<AppShell variant="workspace" {...panelProps} />);
    expect(container.querySelector(".st-appShell")?.getAttribute("data-panel-collapse")).toBe("stack");
  });
});

describe("AppShell — panelCollapse='accordion'", () => {
  it("renders a disclosure button for each present panel, all initially collapsed", () => {
    const { container } = render(<AppShell variant="workspace" panelCollapse="accordion" {...panelProps} />);
    const buttons = container.querySelectorAll(".st-appShell__panelDisclosure");
    expect(buttons.length).toBe(4);
    buttons.forEach((btn) => {
      expect(btn.getAttribute("aria-expanded")).toBe("false");
    });
  });

  it("wires aria-controls on each trigger to the id of its region, and the region is labelled by the trigger", () => {
    const { container } = render(<AppShell variant="workspace" panelCollapse="accordion" {...panelProps} />);
    const buttons = Array.from(container.querySelectorAll<HTMLButtonElement>(".st-appShell__panelDisclosure"));
    expect(buttons.length).toBeGreaterThan(0);
    for (const button of buttons) {
      const controlsId = button.getAttribute("aria-controls");
      expect(controlsId).toBeTruthy();
      const region = container.querySelector(`#${controlsId}`);
      expect(region).toBeTruthy();
      expect(region?.getAttribute("role")).toBe("region");
      expect(region?.getAttribute("aria-labelledby")).toBe(button.id);
    }
  });

  it("toggles aria-expanded on click and reflects the collapsed state on the region", () => {
    const { container } = render(<AppShell variant="workspace" panelCollapse="accordion" {...panelProps} />);
    const trigger = container.querySelector("#st-appShell-navigationPanel-trigger") as HTMLButtonElement;
    const region = container.querySelector("#st-appShell-navigationPanel-region") as HTMLElement;
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(region.classList.contains("st-appShell__panelRegion--collapsed")).toBe(true);

    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(region.classList.contains("st-appShell__panelRegion--collapsed")).toBe(false);

    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(region.classList.contains("st-appShell__panelRegion--collapsed")).toBe(true);
  });

  it("toggles via the keyboard (Enter/Space activate a native button)", () => {
    const { container } = render(<AppShell variant="workspace" panelCollapse="accordion" {...panelProps} />);
    const trigger = container.querySelector("#st-appShell-contextPanel-trigger") as HTMLButtonElement;
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    trigger.focus();
    expect(document.activeElement).toBe(trigger);
    // Native <button> activates on Enter/Space via its click event; assert the
    // handler is reachable through a synthesized click (jsdom does not
    // synthesize the keydown->click default action for us).
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });

  it("renders no disclosure for a panel that is not provided", () => {
    const { container } = render(
      <AppShell variant="workspace" panelCollapse="accordion" navigationPanel={<div>nav-only</div>} main={panelProps.main} />,
    );
    const buttons = container.querySelectorAll(".st-appShell__panelDisclosure");
    expect(buttons.length).toBe(1);
    expect(container.querySelector(".st-appShell__primaryRail")).toBeNull();
    expect(container.querySelector(".st-appShell__contextPanel")).toBeNull();
    expect(container.querySelector(".st-appShell__utilityPanel")).toBeNull();
  });

  it("keeps the panel content mounted in the DOM even while collapsed (no destroy/remount)", () => {
    const { container } = render(<AppShell variant="workspace" panelCollapse="accordion" {...panelProps} />);
    // Collapsed by default, yet content is present — collapse is a CSS
    // concern (sizing/hiding the region), never a conditional render.
    expect(container.querySelector("#st-appShell-utilityPanel-region")?.textContent).toContain("utility-content");
  });

  it("desktop markup still contains the panel content (accordion mode never removes it)", () => {
    const { container } = render(<AppShell variant="workspace" panelCollapse="accordion" {...panelProps} />);
    // jsdom does not evaluate @media queries for layout, but the component
    // must not conditionally destroy content based on breakpoint — assert
    // every panel's content is present regardless.
    expect(container.querySelector(".st-appShell__primaryRail")?.textContent).toContain("rail-content");
    expect(container.querySelector(".st-appShell__navigationPanel")?.textContent).toContain("nav-content");
    expect(container.querySelector(".st-appShell__contextPanel")?.textContent).toContain("context-content");
    expect(container.querySelector(".st-appShell__utilityPanel")?.textContent).toContain("utility-content");
  });

  it("uses custom *Label props as the disclosure text, falling back to the existing aria-label props", () => {
    const { container } = render(
      <AppShell
        variant="workspace"
        panelCollapse="accordion"
        {...panelProps}
        primaryRailLabel="Rail perso"
        contextLabel="Contexte"
        utilityPanelLabel="Outils"
      />,
    );
    expect(container.querySelector("#st-appShell-primaryRail-trigger")?.textContent).toContain("Rail perso");
    // contextPanelLabel not set -> falls back to contextLabel.
    expect(container.querySelector("#st-appShell-contextPanel-trigger")?.textContent).toContain("Contexte");
    expect(container.querySelector("#st-appShell-utilityPanel-trigger")?.textContent).toContain("Outils");
  });

  it('sets data-panel-collapse="accordion" on the root', () => {
    const { container } = render(<AppShell variant="workspace" panelCollapse="accordion" {...panelProps} />);
    expect(container.querySelector(".st-appShell")?.getAttribute("data-panel-collapse")).toBe("accordion");
  });
});
