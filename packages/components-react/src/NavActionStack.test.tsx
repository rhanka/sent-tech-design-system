import React from "react";
import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NavActionStack } from "./NavActionStack.js";

describe("NavActionStack", () => {
  it("renders a labelled group; unspecified kind defaults to secondary", () => {
    const { container } = render(
      <NavActionStack label="Compte" actions={[{ label: "Profil" }]} />,
    );
    const root = container.querySelector(".st-navActionStack");
    expect(root?.getAttribute("role")).toBe("group");
    expect(root?.getAttribute("aria-label")).toBe("Compte");
    const btn = container.querySelector(".st-navActionStack__item");
    expect(btn?.classList.contains("st-button--secondary")).toBe(true);
  });

  it("reflects orientation on the root", () => {
    const { container } = render(
      <NavActionStack orientation="horizontal" actions={[{ label: "A" }]} />,
    );
    expect(container.querySelector(".st-navActionStack--horizontal")).toBeTruthy();
  });

  it("renders an href action as an anchor carrying the button classes", () => {
    const { container } = render(
      <NavActionStack actions={[{ label: "Aide", href: "/help", kind: "ghost" }]} />,
    );
    const a = container.querySelector<HTMLAnchorElement>("a.st-button--ghost");
    expect(a?.getAttribute("href")).toBe("/help");
    expect(a?.classList.contains("st-navActionStack__item")).toBe(true);
  });

  it("renders a disabled action as a disabled button (not a link)", () => {
    const { container } = render(
      <NavActionStack actions={[{ label: "Off", href: "/x", disabled: true }]} />,
    );
    expect(container.querySelector("a")).toBeNull();
    const btn = container.querySelector<HTMLButtonElement>("button.st-navActionStack__item");
    expect(btn?.disabled).toBe(true);
  });

  describe("single-primary rule", () => {
    beforeEach(() => {
      vi.spyOn(console, "warn").mockImplementation(() => {});
    });
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("keeps the first primary, degrades the rest to secondary and warns", () => {
      const { container } = render(
        <NavActionStack
          actions={[
            { label: "Enregistrer", kind: "primary" },
            { label: "Publier", kind: "primary" },
          ]}
        />,
      );
      const buttons = container.querySelectorAll(".st-navActionStack__item");
      expect(buttons[0].classList.contains("st-button--primary")).toBe(true);
      expect(buttons[1].classList.contains("st-button--secondary")).toBe(true);
      expect(console.warn).toHaveBeenCalledTimes(1);
    });
  });

  it("renders the dangerZone separately with its overline label in danger tone", () => {
    const { container } = render(
      <NavActionStack
        actions={[{ label: "Profil" }]}
        dangerZone={{ label: "Supprimer le compte" }}
      />,
    );
    const danger = container.querySelector(".st-navActionStack__danger");
    expect(danger?.getAttribute("role")).toBe("group");
    expect(danger?.getAttribute("aria-label")).toBe("Zone sensible");
    expect(container.querySelector(".st-navActionStack__dangerLabel")?.textContent).toBe(
      "Zone sensible",
    );
    const action = container.querySelector(".st-navActionStack__dangerAction");
    expect(action?.classList.contains("st-button--danger")).toBe(true);
  });

  it("honours a custom dangerLabel and renders an href danger action as an anchor", () => {
    const { container } = render(
      <NavActionStack dangerZone={{ label: "Quitter", href: "/leave" }} dangerLabel="Irréversible" />,
    );
    expect(container.querySelector(".st-navActionStack__dangerLabel")?.textContent).toBe(
      "Irréversible",
    );
    const a = container.querySelector<HTMLAnchorElement>("a.st-navActionStack__dangerAction");
    expect(a?.getAttribute("href")).toBe("/leave");
    expect(a?.classList.contains("st-button--danger")).toBe(true);
  });

  it("omits the danger zone when none is provided", () => {
    const { container } = render(<NavActionStack actions={[{ label: "A" }]} />);
    expect(container.querySelector(".st-navActionStack__danger")).toBeNull();
  });
});
