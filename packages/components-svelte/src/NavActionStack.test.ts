import { render, screen } from "@testing-library/svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import NavActionStack from "./lib/NavActionStack.svelte";
import type { NavAction } from "./lib/NavActionStack.svelte";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("NavActionStack", () => {
  it("renders every action as a control", () => {
    const actions: NavAction[] = [
      { label: "Exporter", kind: "primary" },
      { label: "Importer", kind: "secondary" },
      { label: "Éditeur", kind: "ghost" }
    ];
    render(NavActionStack, { props: { actions, label: "Actions du drawer" } });

    expect(screen.getByRole("button", { name: "Exporter" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Importer" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Éditeur" })).toBeTruthy();
    expect(screen.getByRole("group", { name: "Actions du drawer" })).toBeTruthy();
  });

  it("maps kind to the matching Button variant", () => {
    const actions: NavAction[] = [
      { label: "Primaire", kind: "primary" },
      { label: "Secondaire", kind: "secondary" },
      { label: "Discret", kind: "ghost" }
    ];
    render(NavActionStack, { props: { actions } });

    expect(screen.getByRole("button", { name: "Primaire" }).className).toContain("st-button--primary");
    expect(screen.getByRole("button", { name: "Secondaire" }).className).toContain("st-button--secondary");
    expect(screen.getByRole("button", { name: "Discret" }).className).toContain("st-button--ghost");
  });

  it("defaults actions without a kind to secondary (never a stray primary)", () => {
    render(NavActionStack, { props: { actions: [{ label: "Sans kind" }] } });
    expect(screen.getByRole("button", { name: "Sans kind" }).className).toContain("st-button--secondary");
  });

  it("keeps only one primary: extra primaries are degraded to secondary and warned", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const actions: NavAction[] = [
      { label: "Premier", kind: "primary" },
      { label: "Second", kind: "primary" }
    ];
    render(NavActionStack, { props: { actions } });

    expect(screen.getByRole("button", { name: "Premier" }).className).toContain("st-button--primary");
    const second = screen.getByRole("button", { name: "Second" });
    expect(second.className).toContain("st-button--secondary");
    expect(second.className).not.toContain("st-button--primary");
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain("primary");
  });

  it("renders the dangerZone separately, in danger tone, under its overline label", () => {
    render(NavActionStack, {
      props: {
        actions: [{ label: "Exporter", kind: "primary" }],
        dangerZone: { label: "Supprimer le bien" }
      }
    });

    const danger = screen.getByRole("button", { name: "Supprimer le bien" });
    expect(danger.className).toContain("st-button--danger");
    // The dangerZone lives in its own labelled group, separate from the action stack.
    expect(screen.getByRole("group", { name: "Zone sensible" })).toBeTruthy();
    expect(screen.getByText("Zone sensible")).toBeTruthy();
  });

  it("honours a custom dangerLabel", () => {
    render(NavActionStack, {
      props: { dangerZone: { label: "Purger" }, dangerLabel: "Irréversible" }
    });
    expect(screen.getByRole("group", { name: "Irréversible" })).toBeTruthy();
    expect(screen.getByText("Irréversible")).toBeTruthy();
  });

  it("renders an action with an href as a link, not a button", () => {
    render(NavActionStack, {
      props: { actions: [{ label: "Ouvrir l'éditeur", href: "/editor", kind: "secondary" }] }
    });
    const link = screen.getByRole("link", { name: "Ouvrir l'éditeur" });
    expect(link.getAttribute("href")).toBe("/editor");
    expect(link.className).toContain("st-button--secondary");
  });

  it("applies the orientation modifier on the root", () => {
    const { container } = render(NavActionStack, {
      props: { actions: [{ label: "A", kind: "primary" }], orientation: "horizontal" }
    });
    expect(container.querySelector(".st-navActionStack--horizontal")).toBeTruthy();

    const vertical = render(NavActionStack, {
      props: { actions: [{ label: "B", kind: "primary" }], orientation: "vertical" }
    });
    expect(vertical.container.querySelector(".st-navActionStack--vertical")).toBeTruthy();
  });
});
