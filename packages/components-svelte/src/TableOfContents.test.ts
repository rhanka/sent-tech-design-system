import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import TableOfContents from "./lib/TableOfContents.svelte";

describe("TableOfContents", () => {
  it("renders a navigation list and marks current item", () => {
    render(
      TableOfContents,
      {
        props: {
          title: "Sommaire",
          activeId: "section-2",
          items: [
            { id: "section-1", label: "Section 1", level: 1 },
            { id: "section-2", label: "Section 2", level: 2 },
            { id: "#section-3", label: "Section 3", level: 1 }
          ]
        }
      }
    );

    const active = screen.getByRole("link", { name: "Section 2" });
    const third = screen.getByRole("link", { name: "Section 3" });
    expect(active.getAttribute("aria-current")).toBe("location");
    expect(third.getAttribute("href")).toContain("#section-3");
    expect(screen.getByText("Sommaire")).toBeTruthy();
  });
});
