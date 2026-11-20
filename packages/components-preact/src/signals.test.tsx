import { computed, signal } from "@preact/signals";
import { cleanup, render, screen, waitFor } from "@testing-library/preact";
import { afterEach, describe, expect, it } from "vitest";
import { isSignal, unwrap, useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

afterEach(cleanup);

describe("signals adapter (Preact)", () => {
  it("isSignal distinguishes signals and computeds from plain values and signal-shaped objects", () => {
    const count = signal(1);
    const doubled = computed(() => count.value * 2);
    expect(isSignal(count)).toBe(true);
    expect(isSignal(doubled)).toBe(true);
    expect(isSignal(42)).toBe(false);
    expect(isSignal("text")).toBe(false);
    expect(isSignal(null)).toBe(false);
    expect(isSignal(undefined)).toBe(false);
    expect(isSignal({ value: 1 })).toBe(false);
  });

  it("useValue reads plain values and subscribes to both signal and computed mutations post-mount", async () => {
    const base = signal(2);
    const doubled = computed(() => base.value * 2);
    function View({ plain, live, derived }: { plain: MaybeSignal<string>; live: MaybeSignal<number>; derived: MaybeSignal<number> }) {
      return (
        <output data-testid="out">
          {useValue(plain)}:{useValue(live)}:{useValue(derived)}
        </output>
      );
    }
    render(<View plain="ok" live={base} derived={doubled} />);
    expect(screen.getByTestId("out").textContent).toBe("ok:2:4");

    base.value = 5;
    await waitFor(() => expect(screen.getByTestId("out").textContent).toBe("ok:5:10"));
  });

  it("unwrap reads current values without subscribing the component to later mutations", async () => {
    const live = signal("before");
    const derived = computed(() => live.value.toUpperCase());
    let renders = 0;
    function Unsubscribed() {
      renders += 1;
      return (
        <output data-testid="untracked">
          {unwrap("plain")}:{unwrap(live)}:{unwrap(derived)}
        </output>
      );
    }
    render(<Unsubscribed />);
    expect(screen.getByTestId("untracked").textContent).toBe("plain:before:BEFORE");
    expect(renders).toBe(1);

    live.value = "after";
    await new Promise((resolve) => setTimeout(resolve, 25));
    expect(renders).toBe(1);
    expect(screen.getByTestId("untracked").textContent).toBe("plain:before:BEFORE");
    expect(unwrap(live)).toBe("after");
    expect(unwrap(derived)).toBe("AFTER");
  });
});
