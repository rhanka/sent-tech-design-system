import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import BackToTop from "./lib/BackToTop.svelte";

describe("BackToTop", () => {
  it("renders and reflects target label", () => {
    render(BackToTop, { props: { label: "Monter en haut", autoHide: false } });
    expect(screen.getByRole("button", { name: "Monter en haut" })).toBeTruthy();
  });

  it("uses smooth scroll by default", async () => {
    const scrollIntoView = vi.fn();
    const original = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = scrollIntoView;

    const target = document.createElement("div");
    target.id = "top";
    target.style.position = "absolute";
    target.style.top = "0";
    document.body.appendChild(target);

    render(BackToTop, {
      props: { autoHide: false, smooth: true, threshold: 200, targetId: "top" }
    });
    const button = screen.getByRole("button", { name: "Retour en haut" });
    await fireEvent.click(button);

    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start"
    });

    Element.prototype.scrollIntoView = original;
    document.body.removeChild(target);
  });
});
