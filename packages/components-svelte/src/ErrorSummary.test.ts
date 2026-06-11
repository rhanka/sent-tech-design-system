import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import ErrorSummary from "./lib/ErrorSummary.svelte";

describe("ErrorSummary", () => {
  it("renders the heading and one link per error", () => {
    const { container } = render(ErrorSummary, {
      props: {
        heading: "Il y a un problème",
        errors: [
          { href: "#nom", text: "Saisissez votre nom" },
          { href: "#courriel", text: "Courriel invalide" },
        ],
      },
    });
    const root = container.querySelector(".st-error-summary")!;
    expect(root).toBeTruthy();
    expect(root.tagName.toLowerCase()).toBe("section");
    expect(root.getAttribute("role")).toBe("alert");
    expect(screen.getByText("Il y a un problème")).toBeTruthy();
    const links = container.querySelectorAll(".st-error-summary__link");
    expect(links.length).toBe(2);
    expect((links[0] as HTMLAnchorElement).getAttribute("href")).toBe("#nom");
    expect(links[1].textContent).toBe("Courriel invalide");
  });

  it("uses a default heading and renders no list when there are no errors", () => {
    const { container } = render(ErrorSummary, { props: {} });
    expect(container.querySelector(".st-error-summary__heading")?.textContent).toBe(
      "There was a problem",
    );
    expect(container.querySelector(".st-error-summary__list")).toBeFalsy();
  });
});
