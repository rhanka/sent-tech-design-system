import { signal } from "@preact/signals";
import { cleanup, fireEvent, render, screen } from "@testing-library/preact";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppHeader } from "./AppHeader.js";
import { ContextPanel } from "./ContextPanel.js";
import { IdentityMenu, identityInitial } from "./IdentityMenu.js";
import { NavDrawer } from "./NavDrawer.js";
import { NavRail } from "./NavRail.js";
import { NavShell } from "./NavShell.js";
import { UtilityPanel } from "./UtilityPanel.js";

afterEach(cleanup);

describe("P4c group 2 batch A (shells: signals at the edges, post-mount mutation)", () => {
  it("accepts a Signal for className on every batch-A shell", () => {
    render(
      <>
        <ContextPanel data-testid="e-context" className={signal("x-context")} title="Ctx">
          Body
        </ContextPanel>
        <UtilityPanel data-testid="e-utility" className={signal("x-utility")} title="Util">
          Body
        </UtilityPanel>
        <NavRail data-testid="e-rail" className={signal("x-rail")} />
        <NavShell data-testid="e-shell" className={signal("x-shell")} title="Nav" />
      </>,
    );
    expect(screen.getByTestId("e-context").className).toContain("x-context");
    expect(screen.getByTestId("e-utility").className).toContain("x-utility");
    expect(screen.getByTestId("e-rail").className).toContain("x-rail");
    expect(screen.getByTestId("e-shell").className).toContain("x-shell");
  });

  it("follows className signals mutated after mount (DOM changes)", async () => {
    const contextClass = signal("x-context");
    const utilityClass = signal("x-utility");
    const railClass = signal("x-rail");
    const shellClass = signal("x-shell");
    render(
      <>
        <ContextPanel data-testid="m-context" className={contextClass} title="Ctx">
          Body
        </ContextPanel>
        <UtilityPanel data-testid="m-utility" className={utilityClass} title="Util">
          Body
        </UtilityPanel>
        <NavRail data-testid="m-rail" className={railClass} />
        <NavShell data-testid="m-shell" className={shellClass} title="Nav" />
      </>,
    );
    contextClass.value = "y-context";
    utilityClass.value = "y-utility";
    railClass.value = "y-rail";
    shellClass.value = "y-shell";
    await screen.findByTestId("m-context");
    expect(screen.getByTestId("m-context").className).toContain("y-context");
    expect(screen.getByTestId("m-context").className).not.toContain("x-context");
    expect(screen.getByTestId("m-utility").className).toContain("y-utility");
    expect(screen.getByTestId("m-utility").className).not.toContain("x-utility");
    expect(screen.getByTestId("m-rail").className).toContain("y-rail");
    expect(screen.getByTestId("m-rail").className).not.toContain("x-rail");
    expect(screen.getByTestId("m-shell").className).toContain("y-shell");
    expect(screen.getByTestId("m-shell").className).not.toContain("x-shell");
  });

  it("derives the ContextPanel accessible name from a string title", () => {
    const { container } = render(
      <ContextPanel title="Details" subtitle="Sub" actions={<button type="button">Act</button>} footer="Foot">
        Body
      </ContextPanel>,
    );
    const aside = container.querySelector(".st-contextPanel") as HTMLElement;
    expect(aside.getAttribute("aria-label")).toBe("Details");
    expect(container.querySelector(".st-contextPanel__title")?.textContent).toBe("Details");
    expect(container.querySelector(".st-contextPanel__actions")).toBeTruthy();
    expect(container.querySelector(".st-contextPanel__footer")?.textContent).toBe("Foot");
  });

  it("collapses the UtilityPanel body through a mutated signal", async () => {
    const collapsed = signal(false);
    const { container } = render(
      <UtilityPanel title="Util" collapsed={collapsed} footer="Foot">
        Body
      </UtilityPanel>,
    );
    expect(container.querySelector(".st-utilityPanel__body")).toBeTruthy();
    collapsed.value = true;
    await screen.findByText("Util");
    expect(container.querySelector(".st-utilityPanel--collapsed")).toBeTruthy();
    expect(container.querySelector(".st-utilityPanel__body")).toBeNull();
    expect(container.querySelector(".st-utilityPanel__footer")).toBeNull();
  });

  it("composes item clicks with the consumer onItemSelect and follows activeItemId", async () => {
    const onItemSelect = vi.fn();
    const activeItemId = signal("b");
    const { container } = render(
      <NavRail
        items={[
          { id: "a", label: "Alpha", href: "/a" },
          { id: "b", label: "Beta" },
          { id: "c", label: "Gamma", disabled: true },
        ]}
        activeItemId={activeItemId}
        onItemSelect={onItemSelect}
      />,
    );
    const items = container.querySelectorAll(".st-navRail__item");
    expect(items.length).toBe(3);
    expect(items[1].classList.contains("st-navRail__item--active")).toBe(true);
    fireEvent.click(items[0]);
    expect(onItemSelect).toHaveBeenCalledTimes(1);
    expect(onItemSelect).toHaveBeenCalledWith("a");
    fireEvent.click(items[2]);
    expect(onItemSelect).toHaveBeenCalledTimes(1);
    activeItemId.value = "a";
    await screen.findByText("Alpha");
    const moved = container.querySelectorAll(".st-navRail__item");
    expect(moved[0].classList.contains("st-navRail__item--active")).toBe(true);
    expect(moved[1].classList.contains("st-navRail__item--active")).toBe(false);
  });

  it("composes the NavShell back action with the consumer onBack", () => {
    const onBack = vi.fn();
    const { container } = render(
      <NavShell title="Nav" subtitle="Sub" back onBack={onBack} search={<input aria-label="search" />} footer="Foot">
        Body
      </NavShell>,
    );
    const back = container.querySelector(".st-navShell__back") as HTMLButtonElement;
    expect(back.getAttribute("aria-label")).toBe("Back");
    fireEvent.click(back);
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(container.querySelector(".st-navShell__search")).toBeTruthy();
    expect(container.querySelector(".st-navShell__footer")?.textContent).toBe("Foot");
  });

  it("renders the NavShell drawer variant through the Drawer host", () => {
    const { container } = render(
      <NavShell variant="drawer" title="Nav" open footer="Foot">
        Body
      </NavShell>,
    );
    expect(container.querySelector('[role="dialog"]')).toBeTruthy();
    expect(container.querySelector(".st-navShell--drawer")).toBeTruthy();
  });
});

describe("P4c group 2 batch B (shells: signals at the edges, post-mount mutation)", () => {
  it("accepts a Signal for className on every batch-B shell", () => {
    const { container } = render(
      <>
        <NavDrawer className={signal("x-drawer")} title="Nav" open>
          Body
        </NavDrawer>
        <AppHeader className={signal("x-header")} brandName="SENT" />
        <IdentityMenu
          className={signal("x-identity")}
          user={{ displayName: "Ada Lovelace" }}
          isAuthenticated
        />
      </>,
    );
    expect(container.querySelector(".st-navShell--drawer")?.className).toContain("x-drawer");
    expect(container.querySelector(".st-appHeader")?.className).toContain("x-header");
    expect(container.querySelector(".st-identityMenu")?.className).toContain("x-identity");
  });

  it("follows className signals mutated after mount (DOM changes)", async () => {
    const drawerClass = signal("x-drawer");
    const headerClass = signal("x-header");
    const identityClass = signal("x-identity");
    const { container } = render(
      <>
        <NavDrawer className={drawerClass} title="Nav" open>
          Body
        </NavDrawer>
        <AppHeader className={headerClass} brandName="SENT" />
        <IdentityMenu
          className={identityClass}
          user={{ displayName: "Ada Lovelace" }}
          isAuthenticated
        />
      </>,
    );
    drawerClass.value = "y-drawer";
    headerClass.value = "y-header";
    identityClass.value = "y-identity";
    await screen.findByText("Body");
    expect(container.querySelector(".st-navShell--drawer")?.className).toContain("y-drawer");
    expect(container.querySelector(".st-navShell--drawer")?.className).not.toContain("x-drawer");
    expect(container.querySelector(".st-appHeader")?.className).toContain("y-header");
    expect(container.querySelector(".st-appHeader")?.className).not.toContain("x-header");
    expect(container.querySelector(".st-identityMenu")?.className).toContain("y-identity");
    expect(container.querySelector(".st-identityMenu")?.className).not.toContain("x-identity");
  });

  it("composes the AppHeader burger with the consumer onMenuToggle and links the drawer", () => {
    const onMenuToggle = vi.fn();
    const { container } = render(
      <AppHeader compact onMenuToggle={onMenuToggle} menuLabel="Menu" drawerId="drawer-1" drawer={<nav>Content</nav>} />,
    );
    const button = container.querySelector("button.st-appHeader__burgerButton") as HTMLButtonElement;
    expect(button.getAttribute("aria-label")).toBe("Menu");
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(button.getAttribute("aria-controls")).toBe("drawer-1");
    fireEvent.click(button);
    expect(onMenuToggle).toHaveBeenCalledTimes(1);
    // The inline icons go through the SVG normaliser: kebab-case attributes
    // land on the DOM, camelCase literals never do.
    const svg = container.querySelector("svg") as SVGElement;
    expect(svg.getAttribute("stroke-width")).toBe("2");
    expect(svg.hasAttribute("strokeWidth")).toBe(false);
  });

  it("renders the AppHeader default brand and menu-open drawer", () => {
    const { container } = render(
      <AppHeader
        compact
        menuOpen
        brandName="SENT"
        productName="Design System"
        nav={<a href="/x">Nav</a>}
        drawer={<nav>Content</nav>}
      />,
    );
    expect(container.querySelector(".st-appHeader__brandName")?.textContent).toBe("SENT");
    expect(container.querySelector(".st-appHeader__drawer")?.textContent).toBe("Content");
    expect(container.querySelector("button.st-appHeader__burgerButton")?.getAttribute("aria-expanded")).toBe("true");
  });

  it("notifies onLogin from the IdentityMenu logged-out branch", () => {
    const onLogin = vi.fn();
    const { container } = render(<IdentityMenu onLogin={onLogin} />);
    fireEvent.click(container.querySelector(".st-identityMenu__login") as HTMLButtonElement);
    expect(onLogin).toHaveBeenCalledTimes(1);
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
    const trigger = container.querySelector(".st-identityMenu__trigger") as HTMLButtonElement;
    expect(trigger.getAttribute("aria-label")).toBe("Compte de Ada Lovelace");
    expect(container.querySelector('[role="menu"]')).toBeNull();
    fireEvent.click(trigger);
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    await screen.findByRole("menu");
    expect(container.querySelector(".st-identityMenu__name")?.textContent).toBe("Ada Lovelace");
  });

  it("notifies onLogout from the IdentityMenu logout item", async () => {
    const onLogout = vi.fn();
    const { container } = render(
      <IdentityMenu user={{ displayName: "Ada Lovelace" }} isAuthenticated onLogout={onLogout} />,
    );
    fireEvent.click(container.querySelector(".st-identityMenu__trigger") as HTMLButtonElement);
    await screen.findByRole("menu");
    const items = container.querySelectorAll('[role="menuitem"]');
    fireEvent.click(items[items.length - 1]);
    expect(onLogout).toHaveBeenCalledTimes(1);
    expect(container.querySelector('[role="menu"]')).toBeNull();
  });

  it("derives identity initials from the display name, email or fallback", () => {
    expect(identityInitial({ displayName: "Ada Lovelace" })).toBe("A");
    expect(identityInitial({ displayName: "", email: "grace@example.com" })).toBe("G");
    expect(identityInitial(null)).toBe("U");
    expect(identityInitial(undefined)).toBe("U");
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
