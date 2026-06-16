import { fireEvent, render, screen } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { describe, expect, it } from "vitest";
import NavSection from "./lib/NavSection.svelte";

// Snippet helpers mirroring the other component tests.
const body = (text = "contenu de section") =>
  createRawSnippet(() => ({ render: () => `<div class="x-body">${text}</div>` }));

const actionSnippet = (label = "Ajouter") =>
  createRawSnippet(() => ({
    render: () => `<button type="button" class="x-action">${label}</button>`
  }));

describe("NavSection", () => {
  it("renders the label via Overline (small-caps section heading)", () => {
    const { container } = render(NavSection, {
      props: { label: "DOCUMENTATION", children: body() }
    });
    const overline = container.querySelector(".st-overline");
    expect(overline).toBeTruthy();
    expect(overline?.textContent).toContain("DOCUMENTATION");
  });

  it("renders the slotted children content", () => {
    const { container } = render(NavSection, {
      props: { label: "SIGNAUX", children: body("liste de signaux") }
    });
    expect(container.querySelector(".x-body")?.textContent).toContain("liste de signaux");
  });

  it("renders a circle count badge when count is provided", () => {
    const { container } = render(NavSection, {
      props: { label: "COMMUNITIES", count: 12, children: body() }
    });
    const badge = container.querySelector(".st-badge");
    expect(badge).toBeTruthy();
    expect(badge?.classList.contains("st-badge--circle")).toBe(true);
    expect(badge?.textContent).toContain("12");
  });

  it("omits the count badge when count is undefined", () => {
    const { container } = render(NavSection, {
      props: { label: "Pastilles", children: body() }
    });
    expect(container.querySelector(".st-badge")).toBeNull();
  });

  it("renders a count of 0 (falsy but present)", () => {
    const { container } = render(NavSection, {
      props: { label: "Zonage", count: 0, children: body() }
    });
    const badge = container.querySelector(".st-badge");
    expect(badge).toBeTruthy();
    expect(badge?.textContent).toContain("0");
  });

  it("non-collapsible: renders a group titled by the Overline", () => {
    render(NavSection, { props: { label: "Zonage / Potentiel", children: body() } });
    // The Overline carries the heading id referenced by aria-labelledby.
    const group = screen.getByRole("group", { name: "Zonage / Potentiel" });
    expect(group).toBeTruthy();
  });

  it("non-collapsible: renders the Overline as the requested heading tag", () => {
    const { container } = render(NavSection, {
      props: { label: "DOCUMENTATION", as: "h2", children: body() }
    });
    const heading = container.querySelector("h2.st-overline");
    expect(heading).toBeTruthy();
    expect(heading?.textContent).toContain("DOCUMENTATION");
  });

  it("renders the action snippet in the section header (foyer of the local action)", () => {
    const { container } = render(NavSection, {
      props: { label: "Pastilles", action: actionSnippet("Ajouter une pastille"), children: body() }
    });
    const action = container.querySelector(".st-navSection__action .x-action");
    expect(action).toBeTruthy();
    expect(action?.textContent).toContain("Ajouter une pastille");
  });

  it("collapsible: renders a trigger with aria-expanded that toggles the content", async () => {
    const { container } = render(NavSection, {
      props: { label: "SIGNAUX", collapsible: true, open: true, children: body("signaux ouverts") }
    });

    const trigger = screen.getByRole("button");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(container.querySelector(".x-body")).toBeTruthy();

    await fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(container.querySelector(".x-body")).toBeNull();

    await fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(container.querySelector(".x-body")).toBeTruthy();
  });

  it("collapsible: starts closed when open is false", () => {
    const { container } = render(NavSection, {
      props: { label: "SIGNAUX", collapsible: true, open: false, children: body() }
    });
    expect(screen.getByRole("button").getAttribute("aria-expanded")).toBe("false");
    expect(container.querySelector(".x-body")).toBeNull();
  });

  it("collapsible: surfaces the count in the trigger", () => {
    const { container } = render(NavSection, {
      props: { label: "SIGNAUX", count: 7, collapsible: true, open: true, children: body() }
    });
    const badge = container.querySelector(".st-badge--circle");
    expect(badge).toBeTruthy();
    expect(badge?.textContent).toContain("7");
  });

  it("merges a consumer class onto the root", () => {
    const { container } = render(NavSection, {
      props: { label: "DOCUMENTATION", class: "x-extra", children: body() }
    });
    const root = container.querySelector(".st-navSection");
    expect(root).toBeTruthy();
    expect(root?.classList.contains("x-extra")).toBe(true);
  });
});
