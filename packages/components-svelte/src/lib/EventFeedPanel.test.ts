import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import EventFeedPanel from "./EventFeedPanel.svelte";

const events = [
  { at: 1_700_000_000_000, type: "deploy", severity: "info" as const, message: "Deployed v1.2.0" },
  { at: 1_700_000_300_000, type: "alert", severity: "error" as const, message: "5xx spike" },
  { at: 1_700_000_100_000, type: "scale", severity: "success" as const, message: "Scaled up" },
  { at: 1_700_000_200_000, type: "warn", severity: "warning" as const, message: "High latency" }
];

const items = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-eventFeedPanel__item"));

const structuralClass = (el: Element) => el.className.split(/\s+/)[0];

describe("EventFeedPanel", () => {
  it("renders a feed with one article per event", () => {
    const { container } = render(EventFeedPanel, { props: { data: events, label: "Activité" } });
    expect(container.querySelector('[role="feed"]')).toBeTruthy();
    expect(items(container).length).toBe(4);
    expect(container.querySelectorAll('[role="article"]').length).toBe(4);
  });

  it("sorts events by timestamp descending (newest first)", () => {
    const { container } = render(EventFeedPanel, { props: { data: events, label: "A" } });
    const messages = items(container).map(
      (li) => li.querySelector(".st-eventFeedPanel__message")?.textContent
    );
    expect(messages).toEqual(["5xx spike", "High latency", "Scaled up", "Deployed v1.2.0"]);
  });

  it("applies a severity tone class per item", () => {
    const { container } = render(EventFeedPanel, { props: { data: events, label: "A" } });
    expect(container.querySelector(".st-eventFeedPanel__item--info")).toBeTruthy();
    expect(container.querySelector(".st-eventFeedPanel__item--success")).toBeTruthy();
    expect(container.querySelector(".st-eventFeedPanel__item--warning")).toBeTruthy();
    expect(container.querySelector(".st-eventFeedPanel__item--error")).toBeTruthy();
  });

  it("falls back to the neutral tone for unknown severities", () => {
    const { container } = render(EventFeedPanel, {
      props: { data: [{ at: 1, type: "x", severity: "debug", message: "noise" }], label: "A" }
    });
    expect(container.querySelector(".st-eventFeedPanel__item--neutral")).toBeTruthy();
  });

  it("drops non-finite timestamps before rendering", () => {
    const { container } = render(EventFeedPanel, {
      props: {
        data: [
          { at: Number.NaN, type: "x", severity: "info", message: "bad" },
          { at: 2, type: "y", severity: "info", message: "good" }
        ],
        label: "A"
      }
    });
    expect(items(container).length).toBe(1);
    expect(container.querySelector(".st-eventFeedPanel__message")?.textContent).toBe("good");
  });

  it("constrains the scroll height when maxHeight is set", () => {
    const { container } = render(EventFeedPanel, { props: { data: events, maxHeight: 180 } });
    const list = container.querySelector(".st-eventFeedPanel__list") as HTMLElement;
    expect(list.getAttribute("style")).toContain("max-height: 180px");
  });

  it("accepts height as an alias of maxHeight", () => {
    const { container } = render(EventFeedPanel, { props: { data: events, height: 120 } });
    const list = container.querySelector(".st-eventFeedPanel__list") as HTMLElement;
    expect(list.getAttribute("style")).toContain("max-height: 120px");
  });

  it("merges a custom class onto the root", () => {
    const { container } = render(EventFeedPanel, { props: { data: events, class: "mine" } });
    const root = container.querySelector(".st-eventFeedPanel") as HTMLElement;
    expect(structuralClass(root)).toBe("st-eventFeedPanel");
    expect(root.classList.contains("mine")).toBe(true);
  });
});
