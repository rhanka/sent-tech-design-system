import { signal } from "@preact/signals";
import { cleanup, fireEvent, render, screen } from "@testing-library/preact";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ContextPanel } from "./ContextPanel.js";
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
