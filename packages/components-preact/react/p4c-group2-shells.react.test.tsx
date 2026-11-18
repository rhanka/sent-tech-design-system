// React leg only. The emitted batch-A shells must behave like their
// hand-written twins: accessible names, collapse, item selection and the
// drawer variant (the Preact leg covers the signal edges in
// p4c-group2-edges).
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ContextPanel } from "../.react-emit/src/ContextPanel.js";
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
