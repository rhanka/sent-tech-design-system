import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import WindBarbChart from "./WindBarbChart.svelte";

const series = [
  { at: 0, speed: 5, direction: 0 },
  { at: 1, speed: 15, direction: 90 },
  { at: 2, speed: 30, direction: 180 },
  { at: 3, speed: 65, direction: 270 }
];

const barbs = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-windBarbChart__barb"));

const listItems = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

const structuralClass = (el: Element) => el.className.split(/\s+/)[0];

describe("WindBarbChart", () => {
  it("renders an img role and one barb per datum", () => {
    const { container } = render(WindBarbChart, { props: { data: series, label: "Vent" } });
    expect(container.querySelector('[role="img"]')).toBeTruthy();
    expect(barbs(container).length).toBe(4);
  });

  it("draws a shaft per barb", () => {
    const { container } = render(WindBarbChart, { props: { data: series, label: "W" } });
    expect(container.querySelectorAll(".st-windBarbChart__shaft").length).toBe(4);
  });

  it("draws feather symbols encoding the speed (half / full / flag)", () => {
    // 65 kt = 1 fanion (50) + 1 barbule pleine (10) + 1 demi (5) = 2 + 1 + 1 = 4 traits.
    const { container } = render(WindBarbChart, {
      props: { data: [{ at: 0, speed: 65, direction: 0 }], label: "W" }
    });
    expect(container.querySelectorAll(".st-windBarbChart__feather").length).toBe(4);
  });

  it("colours barbs by speed bin (largest speed → category8)", () => {
    const { container } = render(WindBarbChart, { props: { data: series, label: "W" } });
    const last = barbs(container).at(-1) as Element;
    expect(last.classList.contains("st-windBarbChart__barb--category8")).toBe(true);
  });

  it("renders a graduated time axis with nice ticks", () => {
    const { container } = render(WindBarbChart, { props: { data: series, label: "W" } });
    expect(container.querySelectorAll(".st-windBarbChart__axis").length).toBe(1);
    expect(container.querySelectorAll(".st-windBarbChart__tick").length).toBeGreaterThan(0);
  });

  it("lists every datum in the accessible data list", () => {
    const { container } = render(WindBarbChart, {
      props: { data: [{ at: 2, speed: 10, direction: 45 }], label: "W" }
    });
    expect(listItems(container)[0]).toBe("2 · 10 kt @ 45°");
  });

  it("drops non-finite or negative-speed points before rendering", () => {
    const { container } = render(WindBarbChart, {
      props: {
        data: [
          { at: Number.NaN, speed: 5, direction: 0 },
          { at: 0, speed: -1, direction: 0 },
          { at: 1, speed: 10, direction: 0 }
        ],
        label: "W"
      }
    });
    expect(barbs(container).length).toBe(1);
  });

  it("merges a custom class onto the root", () => {
    const { container } = render(WindBarbChart, { props: { data: series, class: "mine" } });
    const root = container.querySelector(".st-windBarbChart") as HTMLElement;
    expect(structuralClass(root)).toBe("st-windBarbChart");
    expect(root.classList.contains("mine")).toBe(true);
  });
});
