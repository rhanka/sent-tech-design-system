import { fireEvent, render } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { describe, expect, it } from "vitest";
import Collapsible from "./Collapsible.svelte";

const snippet = (html: string) => createRawSnippet(() => ({ render: () => `<span>${html}</span>` }));

// Svelte scopes component styles by appending a per-component hash class (e.g.
// "svelte-pav3x3") to every styled element's class list. Compare against the
// SEMANTIC class only (the first token) so the assertions are stable across
// builds and read the structural class, not the scope hash.
const structuralClass = (el: Element) => el.className.split(/\s+/)[0];

describe("Collapsible — base (byte-identity)", () => {
  it("renders the default trigger with no trailing span and the md density class", () => {
    const { container } = render(Collapsible, { props: { title: "Entities" } });
    const root = container.querySelector(".st-collapsible") as HTMLElement;
    expect(root).toBeTruthy();
    // Default density is md (additive class), and there is NO trailing span when
    // the slot is absent — the trigger keeps its original [title][chevron] shape.
    expect(root.classList.contains("st-collapsible--md")).toBe(true);
    expect(root.classList.contains("st-collapsible--sm")).toBe(false);
    expect(container.querySelector(".st-collapsible__trailing")).toBeNull();
    expect(container.querySelector(".st-collapsible__title")?.textContent).toBe("Entities");
    // Trigger order is preserved: only the title span then the chevron.
    const trigger = container.querySelector(".st-collapsible__trigger") as HTMLElement;
    const spans = Array.from(trigger.children).map(structuralClass);
    expect(spans).toEqual(["st-collapsible__title", "st-collapsible__icon"]);
  });
});

describe("Collapsible — size", () => {
  it("size=\"sm\" toggles st-collapsible--sm", () => {
    const { container } = render(Collapsible, { props: { title: "Type", size: "sm" } });
    const root = container.querySelector(".st-collapsible") as HTMLElement;
    expect(root.classList.contains("st-collapsible--sm")).toBe(true);
    expect(root.classList.contains("st-collapsible--md")).toBe(false);
  });

  it("size=\"lg\" toggles st-collapsible--lg", () => {
    const { container } = render(Collapsible, { props: { title: "Section", size: "lg" } });
    expect(
      (container.querySelector(".st-collapsible") as HTMLElement).classList.contains(
        "st-collapsible--lg",
      ),
    ).toBe(true);
  });
});

describe("Collapsible — trailing slot", () => {
  it("renders trailing content between the title and the chevron", () => {
    const { container } = render(Collapsible, {
      props: { title: "Entities", trailing: snippet("128") },
    });
    const trailing = container.querySelector(".st-collapsible__trailing");
    expect(trailing).toBeTruthy();
    expect(trailing?.textContent).toContain("128");
    // Order inside the trigger: title, trailing, chevron (chevron stays last).
    const trigger = container.querySelector(".st-collapsible__trigger") as HTMLElement;
    const order = Array.from(trigger.children).map(structuralClass);
    expect(order).toEqual([
      "st-collapsible__title",
      "st-collapsible__trailing",
      "st-collapsible__icon",
    ]);
  });
});

describe("Collapsible — a11y unchanged", () => {
  it("toggles aria-expanded on click with size + trailing set", async () => {
    const { container } = render(Collapsible, {
      props: { title: "Entities", size: "sm", trailing: snippet("7") },
    });
    const trigger = container.querySelector(".st-collapsible__trigger") as HTMLButtonElement;
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    await fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });
});
