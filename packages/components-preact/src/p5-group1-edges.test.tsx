import { signal } from "@preact/signals";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_TIME_RANGE_PRESETS } from "./index.js";
import { NavSection } from "./NavSection.js";
import {
  Popper,
  computePosition,
  joinPlacement,
  splitPlacement,
  type PopperPlacement,
  type PopperStrategy,
} from "./Popper.js";

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

function mockAnchor(rect: Partial<DOMRect> = {}): HTMLElement {
  const full = {
    top: 100,
    left: 50,
    right: 150,
    bottom: 120,
    width: 100,
    height: 20,
    x: 50,
    y: 100,
    toJSON: () => ({}),
  };
  return {
    getBoundingClientRect: () => ({ ...full, ...rect }) as DOMRect,
  } as unknown as HTMLElement;
}

describe("P5 group 1 Popper (Preact + Signals)", () => {
  it("computes geometry helpers (splitPlacement, joinPlacement, computePosition)", () => {
    expect(splitPlacement("bottom")).toEqual({ side: "bottom", align: "center" });
    expect(splitPlacement("right-start")).toEqual({ side: "right", align: "start" });
    expect(joinPlacement("top", "center")).toBe("top");
    expect(joinPlacement("left", "end")).toBe("left-end");

    const anchor = { top: 100, left: 100, right: 200, bottom: 140, width: 100, height: 40 };
    const base = { offset: 8, flip: false, shift: false, viewportWidth: 1000, viewportHeight: 800 };
    expect(computePosition(anchor, 80, 30, { ...base, placement: "bottom" })).toEqual({
      placement: "bottom",
      top: 148,
      left: 110,
    });
    expect(computePosition(anchor, 80, 30, { ...base, placement: "top-start" })).toEqual({
      placement: "top-start",
      top: 62,
      left: 100,
    });
    // Flip when bottom overflows and top fits.
    expect(
      computePosition(
        { top: 120, left: 100, right: 200, bottom: 150, width: 100, height: 30 },
        80,
        60,
        { ...base, flip: true, placement: "bottom", viewportHeight: 180 },
      ).placement,
    ).toBe("top");
    // Shift clamps along cross axis.
    const shifted = computePosition(
      { top: 10, left: 980, right: 1080, bottom: 50, width: 100, height: 40 },
      120,
      30,
      { ...base, shift: true, placement: "bottom", viewportWidth: 1000 },
    );
    expect(shifted.left).toBe(880);
  });

  it("renders nothing while closed or anchorless without measuring anchor", () => {
    const getBoundingClientRect = vi.fn();
    const anchor = { getBoundingClientRect } as unknown as HTMLElement;
    render(
      <>
        <Popper anchor={anchor} open={false}>
          <span>hidden</span>
        </Popper>
        <Popper anchor={null} open>
          <span>also-hidden</span>
        </Popper>
      </>,
    );
    expect(document.querySelector(".st-popper")).toBeNull();
    expect(getBoundingClientRect).not.toHaveBeenCalled();
  });

  it("follows post-mount signal mutations for open, anchor, className, placement, offset, strategy, arrow and portal", async () => {
    const anchorEl = mockAnchor({ top: 100, left: 50, right: 150, bottom: 120, width: 100, height: 20 });
    const open = signal(false);
    const anchor = signal<HTMLElement | null>(anchorEl);
    const cls = signal("p-before");
    const placement = signal<PopperPlacement>("bottom");
    const offset = signal(8);
    const strategy = signal<PopperStrategy>("absolute");
    const arrow = signal(false);
    const portal = signal(false);
    const onPlacementChange = vi.fn();

    const { container } = render(
      <Popper
        anchor={anchor}
        open={open}
        className={cls}
        placement={placement}
        offset={offset}
        flip={false}
        shift={false}
        strategy={strategy}
        arrow={arrow}
        portal={portal}
        onPlacementChange={onPlacementChange}
      >
        <span data-testid="popper-body">Panel</span>
      </Popper>,
    );

    expect(container.querySelector(".st-popper")).toBeNull();

    // open: false -> true
    open.value = true;
    await waitFor(() => expect(container.querySelector(".st-popper")).toBeTruthy());
    const panel = () => document.querySelector(".st-popper") as HTMLElement;
    await waitFor(() => expect(panel().getAttribute("style")).toContain("top: 128px"));
    expect(panel().className).toBe("st-popper p-before");
    expect(panel().getAttribute("data-popper-placement")).toBe("bottom");
    expect(panel().getAttribute("style")).toContain("position: absolute");
    expect(panel().querySelector(".st-popper__arrow")).toBeNull();

    // className signal mutation
    cls.value = "p-after";
    await waitFor(() => expect(panel().className).toBe("st-popper p-after"));

    // offset signal mutation (8 -> 24 => top 128 -> 144)
    offset.value = 24;
    await waitFor(() => expect(panel().getAttribute("style")).toContain("top: 144px"));

    // strategy signal mutation (absolute -> fixed)
    strategy.value = "fixed";
    await waitFor(() => expect(panel().getAttribute("style")).toContain("position: fixed"));

    // arrow signal mutation (false -> true)
    arrow.value = true;
    await waitFor(() => expect(panel().querySelector(".st-popper__arrow")?.getAttribute("data-popper-side")).toBe("bottom"));

    // placement signal mutation (bottom -> right-start)
    placement.value = "right-start";
    await waitFor(() => expect(panel().getAttribute("data-popper-placement")).toBe("right-start"));
    expect(panel().querySelector(".st-popper__arrow")?.getAttribute("data-popper-side")).toBe("right");
    expect(onPlacementChange).toHaveBeenCalledWith("right-start");

    // portal signal mutation (false -> true moves out of container under document.body)
    portal.value = true;
    await waitFor(() => {
      const tp = document.body.querySelector('[data-st-portal="teleported"]');
      expect(tp?.querySelector(".st-popper")).toBeTruthy();
      expect(container.querySelector(".st-popper")).toBeNull();
    });

    // anchor -> null hides panel
    anchor.value = null;
    await waitFor(() => expect(document.querySelector(".st-popper")).toBeNull());
  });

  it("follows trapFocus and closeOnEscape signals post-mount, cycles Tab and restores focus on close", async () => {
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.textContent = "Trigger";
    document.body.appendChild(trigger);
    trigger.focus();

    const open = signal(true);
    const trapFocus = signal(false);
    const closeOnEscape = signal(false);
    const onClose = vi.fn();

    render(
      <Popper
        anchor={trigger}
        open={open}
        trapFocus={trapFocus}
        closeOnEscape={closeOnEscape}
        onClose={onClose}
        portal={false}
      >
        <button type="button" data-testid="btn-a">
          A
        </button>
        <button type="button" data-testid="btn-b">
          B
        </button>
      </Popper>,
    );

    const panel = () => document.querySelector(".st-popper") as HTMLElement;
    expect(panel().getAttribute("tabindex")).toBeNull();

    // closeOnEscape=false ignores Escape; flipping to true activates it.
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();

    closeOnEscape.value = true;
    await waitFor(() => {
      fireEvent.keyDown(document, { key: "Escape" });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    // trapFocus=true focuses first button and cycles Tab / Shift+Tab.
    trapFocus.value = true;
    const btnA = screen.getByTestId("btn-a") as HTMLButtonElement;
    const btnB = screen.getByTestId("btn-b") as HTMLButtonElement;
    await waitFor(() => expect(document.activeElement).toBe(btnA));
    expect(panel().getAttribute("tabindex")).toBe("-1");

    fireEvent.keyDown(panel(), { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(btnB);
    fireEvent.keyDown(panel(), { key: "Tab", shiftKey: false });
    expect(document.activeElement).toBe(btnA);

    // Closing restores focus to the trigger captured when trapFocus activated.
    open.value = false;
    await waitFor(() => expect(document.querySelector(".st-popper")).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it("follows flip and shift signals mutated post-mount", async () => {
    const prevW = window.innerWidth;
    const prevH = window.innerHeight;
    Object.defineProperty(window, "innerWidth", { value: 200, configurable: true });
    Object.defineProperty(window, "innerHeight", { value: 200, configurable: true });
    try {
      // Anchor near bottom-right: bottom overflows (195 + 8 > 200), right overflows (210 > 200).
      const anchor = mockAnchor({ top: 175, left: 210, right: 250, bottom: 195, width: 40, height: 20 });
      const flip = signal(false);
      const shift = signal(false);
      render(
        <Popper anchor={anchor} open placement="bottom-start" offset={8} flip={flip} shift={shift} portal={false}>
          <span>Edge</span>
        </Popper>,
      );
      const panel = () => document.querySelector(".st-popper") as HTMLElement;
      await waitFor(() => expect(panel().getAttribute("style")).toContain("left: 210px"));
      expect(panel().getAttribute("data-popper-placement")).toBe("bottom-start");

      // Mutating flip: false -> true flips from bottom-start to top-start.
      flip.value = true;
      await waitFor(() => expect(panel().getAttribute("data-popper-placement")).toBe("top-start"));

      // Mutating shift: false -> true clamps left from 210px into viewport (<= 200px).
      shift.value = true;
      await waitFor(() => expect(panel().getAttribute("style")).toContain("left: 200px"));
    } finally {
      Object.defineProperty(window, "innerWidth", { value: prevW, configurable: true });
      Object.defineProperty(window, "innerHeight", { value: prevH, configurable: true });
    }
  });
});

describe("P5 group 1 NavSection (Preact + Signals)", () => {
  it("renders static section with Overline, heading tag, action slot and zero count", () => {
    const { container } = render(
      <NavSection
        label="DOCUMENTATION"
        as="h2"
        count={0}
        action={
          <button type="button" className="x-action">
            Ajouter
          </button>
        }
      >
        <div className="x-body">contenu</div>
      </NavSection>,
    );
    expect(screen.getByRole("group", { name: /DOCUMENTATION/ })).toBeTruthy();
    expect(container.querySelector("h2.st-overline")?.textContent).toContain("DOCUMENTATION");
    expect(container.querySelector(".st-badge--circle")?.textContent).toBe("0");
    expect(container.querySelector(".st-navSection__action .x-action")?.textContent).toBe("Ajouter");
    expect(container.querySelector(".x-body")?.textContent).toBe("contenu");
  });

  it("follows post-mount signal mutations for className, count, collapsible and open", async () => {
    const cls = signal("ns-before");
    const count = signal(3);
    const collapsible = signal(false);
    const open = signal(false);

    const { container } = render(
      <NavSection
        label="SIGNAUX"
        className={cls}
        count={count}
        collapsible={collapsible}
        open={open}
      >
        <div className="x-body">liste</div>
      </NavSection>,
    );

    // Static initial state
    expect(container.querySelector(".st-navSection--static")?.className).toContain("ns-before");
    expect(container.querySelector(".st-badge--circle")?.textContent).toBe("3");

    // className mutation
    cls.value = "ns-after";
    await waitFor(() => {
      const root = container.querySelector(".st-navSection") as HTMLElement;
      expect(root.className).toContain("ns-after");
      expect(root.className).not.toContain("ns-before");
    });

    // count mutation (3 -> 12 -> 0)
    count.value = 12;
    await waitFor(() => expect(container.querySelector(".st-badge--circle")?.textContent).toBe("12"));
    count.value = 0;
    await waitFor(() => expect(container.querySelector(".st-badge--circle")?.textContent).toBe("0"));

    // collapsible: false -> true (starts closed because open=false)
    count.value = 7;
    collapsible.value = true;
    await waitFor(() => expect(container.querySelector(".st-navSection--collapsible")).toBeTruthy());
    const trigger = () => screen.getByRole("button");
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
    expect(container.querySelector(".x-body")).toBeNull();
    expect(container.querySelector(".st-badge--circle")?.textContent).toBe("7");

    // open signal mutation: false -> true -> false
    open.value = true;
    await waitFor(() => expect(trigger().getAttribute("aria-expanded")).toBe("true"));
    expect(container.querySelector(".x-body")).toBeTruthy();

    // User click still toggles locally
    fireEvent.click(trigger());
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
    expect(container.querySelector(".x-body")).toBeNull();

    // Switching back to static removes the collapsible trigger
    collapsible.value = false;
    await waitFor(() => expect(container.querySelector(".st-navSection--static")).toBeTruthy());
    expect(container.querySelector(".st-collapsible__trigger")).toBeNull();
  });

  it("re-exports DEFAULT_TIME_RANGE_PRESETS from the package barrel", () => {
    expect(DEFAULT_TIME_RANGE_PRESETS).toEqual(["30m", "1h", "3h", "6h", "12h", "24h", "3d", "7d", "30d"]);
  });
});
