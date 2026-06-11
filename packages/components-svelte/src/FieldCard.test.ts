import { render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import { createRawSnippet } from "svelte";
import FieldCard from "./lib/FieldCard.svelte";

const body = createRawSnippet(() => ({ render: () => `<p>Corps</p>` }));

describe("FieldCard", () => {
  it("renders the label and body in a section, bordered by default", () => {
    const { container } = render(FieldCard, {
      props: { label: "Coordonnées", children: body },
    });
    const root = container.querySelector(".st-fieldCard");
    expect(root).toBeTruthy();
    expect(root?.tagName.toLowerCase()).toBe("section");
    expect(root?.className).toContain("st-fieldCard--bordered");
    expect(screen.getByText("Coordonnées")).toBeTruthy();
    expect(container.querySelector(".st-fieldCard__body")?.textContent).toContain("Corps");
  });

  it("applies the variant modifier class", () => {
    const { container } = render(FieldCard, {
      props: { label: "Plain", variant: "plain", children: body },
    });
    expect(container.querySelector(".st-fieldCard--plain")).toBeTruthy();
  });

  it("accent variant applies the categorical tone class for a token-only accent", () => {
    const { container } = render(FieldCard, {
      props: { label: "Accent", variant: "accent", tone: "category4", children: body },
    });
    const root = container.querySelector(".st-fieldCard");
    expect(root?.className).toContain("st-fieldCard--accent");
    expect(root?.className).toContain("st-fieldCard--category4");
  });

  it("does not apply a tone class on non-accent variants", () => {
    const { container } = render(FieldCard, {
      props: { label: "Bordered", variant: "bordered", tone: "category4", children: body },
    });
    expect(container.querySelector(".st-fieldCard--category4")).toBeFalsy();
  });

  it("hides the comment badge when count is 0 and no handler is provided", () => {
    const { container } = render(FieldCard, { props: { label: "Sans", children: body } });
    expect(container.querySelector(".st-fieldCard__comments")).toBeFalsy();
  });

  it("renders a static comment count badge when count > 0 without a handler", () => {
    const { container } = render(FieldCard, {
      props: { label: "Avec", commentCount: 3, children: body },
    });
    const badge = container.querySelector(".st-fieldCard__comments--static");
    expect(badge).toBeTruthy();
    expect(container.querySelector(".st-fieldCard__commentCount")?.textContent).toBe("3");
  });

  it("renders an interactive comment button that calls onOpenComments", () => {
    const onOpenComments = vi.fn();
    const { container } = render(FieldCard, {
      props: { label: "Fil", commentCount: 2, onOpenComments, children: body },
    });
    const btn = container.querySelector("button.st-fieldCard__comments") as HTMLButtonElement;
    expect(btn).toBeTruthy();
    expect(btn.getAttribute("aria-label")).toBe("Commentaires (2)");
    btn.click();
    expect(onOpenComments).toHaveBeenCalledTimes(1);
  });
});
