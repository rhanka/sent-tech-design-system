import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { FieldCard } from "./FieldCard.js";

afterEach(cleanup);

describe("FieldCard", () => {
  it("renders the label and body in a section, bordered by default", () => {
    const { container } = render(
      <FieldCard label="Coordonnées">
        <p>Corps</p>
      </FieldCard>,
    );
    const root = container.querySelector(".st-fieldCard")!;
    expect(root.tagName.toLowerCase()).toBe("section");
    expect(root.className).toContain("st-fieldCard--bordered");
    expect(container.querySelector(".st-fieldCard__label")?.textContent).toBe("Coordonnées");
    expect(container.querySelector(".st-fieldCard__body")?.textContent).toContain("Corps");
  });

  it("applies the variant modifier class", () => {
    const { container } = render(<FieldCard label="Plain" variant="plain" />);
    expect(container.querySelector(".st-fieldCard--plain")).toBeTruthy();
  });

  it("accent variant applies the categorical tone class for a token-only accent", () => {
    const { container } = render(
      <FieldCard label="Accent" variant="accent" tone="category4" />,
    );
    const root = container.querySelector(".st-fieldCard")!;
    expect(root.className).toContain("st-fieldCard--accent");
    expect(root.className).toContain("st-fieldCard--category4");
  });

  it("does not apply a tone class on non-accent variants", () => {
    const { container } = render(
      <FieldCard label="Bordered" variant="bordered" tone="category4" />,
    );
    expect(container.querySelector(".st-fieldCard--category4")).toBeFalsy();
  });

  it("hides the comment badge when count is 0 and no handler is provided", () => {
    const { container } = render(<FieldCard label="Sans" />);
    expect(container.querySelector(".st-fieldCard__comments")).toBeFalsy();
  });

  it("renders a static comment count badge when count > 0 without a handler", () => {
    const { container } = render(<FieldCard label="Avec" commentCount={3} />);
    expect(container.querySelector(".st-fieldCard__comments--static")).toBeTruthy();
    expect(container.querySelector(".st-fieldCard__commentCount")?.textContent).toBe("3");
  });

  it("renders an interactive comment button that calls onOpenComments", () => {
    const onOpenComments = vi.fn();
    const { container } = render(
      <FieldCard label="Fil" commentCount={2} onOpenComments={onOpenComments} />,
    );
    const btn = container.querySelector("button.st-fieldCard__comments") as HTMLButtonElement;
    expect(btn).toBeTruthy();
    expect(btn.getAttribute("aria-label")).toBe("Commentaires (2)");
    fireEvent.click(btn);
    expect(onOpenComments).toHaveBeenCalledTimes(1);
  });
});
