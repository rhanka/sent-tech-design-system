// React leg only. The emitted batch-A shells must behave like their
// hand-written twins: accessible names, collapse, item selection and the
// drawer variant (the Preact leg covers the signal edges in
// p4c-group2-edges).
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppHeader } from "../.react-emit/src/AppHeader.js";
import { ContextPanel } from "../.react-emit/src/ContextPanel.js";
import { IdentityMenu } from "../.react-emit/src/IdentityMenu.js";
import { NavDrawer } from "../.react-emit/src/NavDrawer.js";
import { NavRail } from "../.react-emit/src/NavRail.js";
import { NavShell } from "../.react-emit/src/NavShell.js";
import { UtilityPanel } from "../.react-emit/src/UtilityPanel.js";

afterEach(cleanup);

describe("P4c group 2 batch A (emitted shells)", () => {
  it("renders the ContextPanel accessible name and regions", () => {
    const { container } = render(
      <ContextPanel title="Details" actions={<button type="button">Act</button>} footer="Foot">
        Body
      </ContextPanel>,
    );
    expect(container.querySelector(".st-contextPanel")?.getAttribute("aria-label")).toBe("Details");
    expect(container.querySelector(".st-contextPanel__title")?.textContent).toBe("Details");
    expect(container.querySelector(".st-contextPanel__body")?.textContent).toBe("Body");
    expect(container.querySelector(".st-contextPanel__footer")?.textContent).toBe("Foot");
  });

  it("hides the UtilityPanel body when collapsed", () => {
    const { container, rerender } = render(
      <UtilityPanel title="Util" footer="Foot">
        Body
      </UtilityPanel>,
    );
    expect(container.querySelector(".st-utilityPanel__body")).toBeTruthy();
    rerender(
      <UtilityPanel title="Util" footer="Foot" collapsed>
        Body
      </UtilityPanel>,
    );
    expect(container.querySelector(".st-utilityPanel--collapsed")).toBeTruthy();
    expect(container.querySelector(".st-utilityPanel__body")).toBeNull();
  });

  it("composes NavRail item clicks with the consumer onSelect", () => {
    const onItemSelect = vi.fn();
    const { container } = render(
      <NavRail
        items={[
          { id: "a", label: "Alpha", href: "/a" },
          { id: "b", label: "Beta" },
          { id: "c", label: "Gamma", disabled: true },
        ]}
        activeItemId="b"
        onItemSelect={onItemSelect}
      />,
    );
    const items = container.querySelectorAll(".st-navRail__item");
    expect(items[1].classList.contains("st-navRail__item--active")).toBe(true);
    fireEvent.click(items[0]);
    expect(onItemSelect).toHaveBeenCalledTimes(1);
    expect(onItemSelect).toHaveBeenCalledWith("a");
    fireEvent.click(items[2]);
    expect(onItemSelect).toHaveBeenCalledTimes(1);
  });

  it("composes the NavShell back action and drawer variant", () => {
    const onBack = vi.fn();
    const { container } = render(
      <NavShell title="Nav" back onBack={onBack}>
        Body
      </NavShell>,
    );
    fireEvent.click(container.querySelector(".st-navShell__back") as HTMLElement);
    expect(onBack).toHaveBeenCalledTimes(1);
    const { container: drawer } = render(
      <NavShell variant="drawer" title="Nav" open>
        Body
      </NavShell>,
    );
    expect(drawer.querySelector('[role="dialog"]')).toBeTruthy();
    expect(drawer.querySelector(".st-navShell--drawer")).toBeTruthy();
  });
});

describe("P4c group 2 batch B (emitted shells)", () => {
  it("composes the AppHeader burger with the consumer onMenuToggle and links the drawer", () => {
    const onMenuToggle = vi.fn();
    const { container } = render(
      <AppHeader compact onMenuToggle={onMenuToggle} menuLabel="Menu" drawerId="drawer-1" drawer={<nav>Content</nav>} />,
    );
    const button = container.querySelector("button.st-appHeader__burgerButton") as HTMLButtonElement;
    expect(button.getAttribute("aria-controls")).toBe("drawer-1");
    fireEvent.click(button);
    expect(onMenuToggle).toHaveBeenCalledTimes(1);
    const svg = container.querySelector("svg") as SVGElement;
    expect(svg.getAttribute("stroke-width")).toBe("2");
    expect(svg.hasAttribute("strokeWidth")).toBe(false);
  });

  it("composes the IdentityMenu trigger with open state and onOpenChange", async () => {
    const onOpenChange = vi.fn();
    const { container } = render(
      <IdentityMenu
        user={{ displayName: "Ada Lovelace", email: "ada@example.com" }}
        isAuthenticated
        onOpenChange={onOpenChange}
      />,
    );
    fireEvent.click(container.querySelector(".st-identityMenu__trigger") as HTMLButtonElement);
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    await screen.findByRole("menu");
    expect(container.querySelector(".st-identityMenu__name")?.textContent).toBe("Ada Lovelace");
  });

  it("forces the NavDrawer through the drawer variant", () => {
    const { container } = render(
      <NavDrawer title="Nav" open>
        Body
      </NavDrawer>,
    );
    expect(container.querySelector('[role="dialog"]')).toBeTruthy();
    expect(container.querySelector(".st-navShell--drawer")).toBeTruthy();
  });
});
