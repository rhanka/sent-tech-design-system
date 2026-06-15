import { render, screen } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { describe, expect, it } from "vitest";
import Checkbox from "./lib/Checkbox.svelte";

describe("Checkbox additions (description + trailing)", () => {
  it("stays byte-identical (no description/trailing DOM) when the new props are unused", () => {
    const { container } = render(Checkbox, { props: { label: "Actif", checked: true } });
    expect(screen.getByLabelText("Actif")).toHaveProperty("checked", true);
    expect(container.querySelector(".st-choice__description")).toBeNull();
    expect(container.querySelector(".st-choice__trailing")).toBeNull();
    expect(container.querySelector(".st-choice--described")).toBeNull();
    // No aria-describedby is added when there is no description.
    expect(screen.getByLabelText("Actif").getAttribute("aria-describedby")).toBeNull();
  });

  it("renders a secondary description and links it via aria-describedby", () => {
    const { container } = render(Checkbox, {
      props: { label: "Hausse de prix", description: "Variation > 5% sur 30 jours" }
    });
    const input = screen.getByRole("checkbox");
    const desc = container.querySelector(".st-choice__description");
    expect(desc).not.toBeNull();
    expect(desc?.textContent).toBe("Variation > 5% sur 30 jours");

    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    // The id referenced by aria-describedby must point at the description node.
    expect(desc?.getAttribute("id")).toBe(describedBy);
  });

  it("merges the description id with a consumer-provided aria-describedby", () => {
    const { container } = render(Checkbox, {
      props: {
        label: "Signal",
        description: "Hint",
        "aria-describedby": "external-help"
      }
    });
    const input = screen.getByRole("checkbox");
    const describedBy = input.getAttribute("aria-describedby");
    const descId = container.querySelector(".st-choice__description")?.getAttribute("id");
    expect(describedBy).toContain("external-help");
    expect(describedBy).toContain(descId as string);
  });

  it("renders the trailing snippet (e.g. a count bubble) at the row end", () => {
    const trailing = createRawSnippet(() => ({
      render: () => '<span class="count">33</span>'
    }));
    const { container } = render(Checkbox, {
      props: { label: "Ventes récentes", trailing }
    });
    const slot = container.querySelector(".st-choice__trailing");
    expect(slot).not.toBeNull();
    expect(slot?.textContent).toContain("33");
    // The row switches to the 3-column layout when a trailing slot is present.
    expect(container.querySelector(".st-choice:has(.st-choice__trailing)")).not.toBeNull();
  });

  it("keeps the existing helperText and invalid behaviour intact", () => {
    render(Checkbox, {
      props: { label: "Erreur", helperText: "aide", invalid: true }
    });
    const input = screen.getByRole("checkbox");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByText("aide")).toBeTruthy();
    expect(screen.getByText("Erreur")).toBeTruthy();
  });
});
