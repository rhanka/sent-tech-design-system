import { fireEvent, render, screen } from "@testing-library/svelte";
import { tick } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import AppShell from "./AppShell.svelte";
import type { SiteConfig } from "./site-config";

const baseConfig = (extra: Partial<SiteConfig> = {}): SiteConfig => ({
  schemaVersion: 1,
  brand: { name: "SENT-tech", logoSrc: "/logo.svg", href: "/" },
  nav: [
    { label: "Services", href: "/#services" },
    { label: "Blog", href: "/#blog" }
  ],
  theming: { themes: [], theme: "forge" },
  locale: {
    current: "fr",
    available: [
      { code: "fr", label: "FR" },
      { code: "en", label: "EN" }
    ],
    onChange: () => {}
  },
  ...extra
});

function setScrollY(value: number) {
  Object.defineProperty(window, "scrollY", { configurable: true, value });
  window.dispatchEvent(new Event("scroll"));
}

afterEach(() => setScrollY(0));

describe("AppShell site — headerBackground (additive SiteConfig v1)", () => {
  it("renders the historical solid header when the key is absent", () => {
    const { container } = render(AppShell, { props: { config: baseConfig() } });
    const header = container.querySelector("header.st-shell") as HTMLElement;
    expect(header).toBeTruthy();
    expect(header.classList.contains("st-header--sticky")).toBe(true);
    expect(header.classList.contains("st-shell--heroTransparent")).toBe(false);
    expect(header.classList.contains("st-shell--overHero")).toBe(false);
    expect(header.hasAttribute("data-st-header-background")).toBe(false);
  });

  it("starts over the hero, then switches to the solid layer past the threshold", async () => {
    const { container } = render(AppShell, {
      props: { config: baseConfig({ headerBackground: { mode: "hero-transparent" } }) }
    });
    const header = container.querySelector("header.st-shell") as HTMLElement;
    expect(header.classList.contains("st-shell--heroTransparent")).toBe(true);
    expect(header.classList.contains("st-shell--overHero")).toBe(true);
    expect(header.getAttribute("data-st-header-background")).toBe("hero-transparent");
    expect(header.getAttribute("data-st-header-over-hero")).toBe("true");

    setScrollY(40);
    await tick();
    expect(header.classList.contains("st-shell--overHero")).toBe(true);

    setScrollY(51);
    await tick();
    expect(header.classList.contains("st-shell--overHero")).toBe(false);
    expect(header.getAttribute("data-st-header-over-hero")).toBe("false");

    setScrollY(0);
    await tick();
    expect(header.classList.contains("st-shell--overHero")).toBe(true);
  });

  it("honours a custom scrollThreshold", async () => {
    const { container } = render(AppShell, {
      props: { config: baseConfig({ headerBackground: { mode: "hero-transparent", scrollThreshold: 200 } }) }
    });
    const header = container.querySelector("header.st-shell") as HTMLElement;
    setScrollY(120);
    await tick();
    expect(header.classList.contains("st-shell--overHero")).toBe(true);
    setScrollY(201);
    await tick();
    expect(header.classList.contains("st-shell--overHero")).toBe(false);
  });

  it("ignores an unknown mode (skew tolerance) and falls back to solid", () => {
    const config = baseConfig({ headerBackground: { mode: "glass" as never } });
    const { container } = render(AppShell, { props: { config } });
    const header = container.querySelector("header.st-shell") as HTMLElement;
    expect(header.classList.contains("st-shell--heroTransparent")).toBe(false);
  });
});

describe("AppShell site — mobileMenu (additive SiteConfig v1)", () => {
  it("renders no burger and no drawer when the key is absent", () => {
    const { container } = render(AppShell, { props: { config: baseConfig() } });
    expect(container.querySelector(".st-shell__burger")).toBeNull();
    expect(screen.queryByRole("button", { name: "Menu" })).toBeNull();
  });

  it("puts the burger last in the right-hand zone", () => {
    const { container } = render(AppShell, {
      props: { config: baseConfig({ mobileMenu: { enabled: true, label: "Ouvrir le menu" } }) }
    });
    const header = container.querySelector("header.st-shell") as HTMLElement;
    expect(header.classList.contains("st-shell--mobileMenu")).toBe(true);
    const actions = header.querySelector(".st-shell__actions") as HTMLElement;
    const burger = screen.getByRole("button", { name: "Ouvrir le menu" });
    expect(actions.lastElementChild).toBe(burger);
    expect(burger.getAttribute("aria-expanded")).toBe("false");
  });

  it("opens a right-side drawer with the nav items and the locale switch, outside the header", async () => {
    const onChange = vi.fn();
    const config = baseConfig({
      activePath: "/#blog",
      mobileMenu: { enabled: true, label: "Menu", title: "Navigation" },
      locale: {
        current: "fr",
        label: "Langue",
        available: [
          { code: "fr", label: "FR" },
          { code: "en", label: "EN" }
        ],
        onChange
      }
    });
    const { container } = render(AppShell, { props: { config } });
    await fireEvent.click(screen.getByRole("button", { name: "Menu" }));

    const dialog = screen.getByRole("dialog", { name: "Navigation" });
    expect(dialog.classList.contains("st-drawer--right")).toBe(true);
    expect(container.querySelector("header.st-shell")?.contains(dialog)).toBe(false);

    const links = Array.from(dialog.querySelectorAll("a.st-shell__drawerLink"));
    expect(links.map((a) => a.textContent)).toEqual(["Services", "Blog"]);
    expect(links[1].getAttribute("aria-current")).toBe("page");

    const group = dialog.querySelector('[role="group"][aria-label="Langue"]') as HTMLElement;
    expect(group).toBeTruthy();
    const fr = Array.from(group.querySelectorAll("button")).find((b) => b.textContent === "FR")!;
    const en = Array.from(group.querySelectorAll("button")).find((b) => b.textContent === "EN")!;
    expect(fr.getAttribute("aria-pressed")).toBe("true");
    expect(en.getAttribute("aria-pressed")).toBe("false");

    await fireEvent.click(en);
    expect(onChange).toHaveBeenCalledWith("en");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("closes the drawer when a nav link is followed", async () => {
    render(AppShell, { props: { config: baseConfig({ mobileMenu: { enabled: true } }) } });
    await fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    const dialog = screen.getByRole("dialog");
    const link = dialog.querySelector("a.st-shell__drawerLink") as HTMLAnchorElement;
    link.addEventListener("click", (event) => event.preventDefault());
    await fireEvent.click(link);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
