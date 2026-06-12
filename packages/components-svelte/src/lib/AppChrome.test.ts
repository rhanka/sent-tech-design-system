import { fireEvent, render } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { describe, expect, it, vi } from "vitest";
import AppChrome from "./AppChrome.svelte";

const snippet = (html: string) => createRawSnippet(() => ({ render: () => `<span>${html}</span>` }));

const themes = [
  { id: "sent-tech", label: "Sentropic" },
  { id: "forge", label: "Forge" },
  { id: "entropic", label: "Entropic" },
  { id: "carbon", label: "Carbon" },
  { id: "dsfr", label: "DSFR" },
  { id: "airbus", label: "Airbus" },
];

const nav = [
  { label: "Vues", href: "/views", active: true },
  { label: "Données", href: "/data" },
  { label: "Réglages", href: "/settings" },
];

describe("AppChrome — marque", () => {
  it("renders the canonical brand block (logo + name + product)", () => {
    const { container } = render(AppChrome, {
      props: { brandName: "Sentropic", productName: "dataviz", logoSrc: "/SENT-logo-squared.svg", brandHref: "/home" },
    });
    const brand = container.querySelector("a.st-appChrome__brand") as HTMLAnchorElement;
    expect(brand).toBeTruthy();
    expect(brand.getAttribute("href")).toBe("/home");
    expect(brand.getAttribute("aria-label")).toBe("Sentropic dataviz");
    expect((container.querySelector("img.st-appChrome__brandMark") as HTMLImageElement).getAttribute("src")).toBe(
      "/SENT-logo-squared.svg",
    );
    expect(container.querySelector(".st-appChrome__brandName")?.textContent).toBe("Sentropic");
    expect(container.querySelector(".st-appChrome__brandProduct")?.textContent).toBe("dataviz");
  });

  it("defaults brandName to Sentropic", () => {
    const { container } = render(AppChrome, { props: { productName: "dataviz" } });
    expect(container.querySelector(".st-appChrome__brandName")?.textContent).toBe("Sentropic");
  });
});

describe("AppChrome — navigation", () => {
  it("renders nav links and marks the active one with aria-current", () => {
    const { container } = render(AppChrome, { props: { nav } });
    const links = Array.from(container.querySelectorAll<HTMLAnchorElement>(".st-appChrome__navLink"));
    expect(links.map((a) => a.textContent?.trim())).toEqual(["Vues", "Données", "Réglages"]);
    expect(links[0].getAttribute("aria-current")).toBe("page");
    expect(links[1].getAttribute("aria-current")).toBeNull();
    expect(links[0].classList.contains("st-appHeader__navLink")).toBe(true);
  });
});

describe("AppChrome — contrôle thème", () => {
  it("shows the active theme label and fires onThemeChange on selection", async () => {
    const onThemeChange = vi.fn();
    const { container } = render(AppChrome, { props: { themes, theme: "sent-tech", onThemeChange } });
    const trigger = container.querySelector(".st-appChrome__themeWrap button") as HTMLButtonElement;
    expect(trigger.textContent).toContain("Sentropic");
    await fireEvent.click(trigger);
    expect(container.querySelector('[role="menu"]')).toBeTruthy();
    const carbon = Array.from(container.querySelectorAll<HTMLButtonElement>(".st-appChrome__menuItem")).find((b) =>
      b.textContent?.includes("Carbon"),
    )!;
    await fireEvent.click(carbon);
    expect(onThemeChange).toHaveBeenCalledWith("carbon");
  });

  it("hides the theme selector when themes is empty", () => {
    const { container } = render(AppChrome);
    expect(container.querySelector(".st-appChrome__themeWrap")).toBeNull();
  });
});

describe("AppChrome — mode couleur", () => {
  it("cycles light -> dark -> auto via onColorModeChange", async () => {
    const onColorModeChange = vi.fn();
    const { container, rerender } = render(AppChrome, { props: { colorMode: "light", onColorModeChange } });
    await fireEvent.click(container.querySelector(".st-appChrome__iconControl") as HTMLButtonElement);
    expect(onColorModeChange).toHaveBeenCalledWith("dark");
    await rerender({ colorMode: "dark", onColorModeChange });
    await fireEvent.click(container.querySelector(".st-appChrome__iconControl") as HTMLButtonElement);
    expect(onColorModeChange).toHaveBeenLastCalledWith("auto");
    await rerender({ colorMode: "auto", onColorModeChange });
    await fireEvent.click(container.querySelector(".st-appChrome__iconControl") as HTMLButtonElement);
    expect(onColorModeChange).toHaveBeenLastCalledWith("light");
  });

  it("hides the color-mode toggle when colorMode is undefined", () => {
    const { container } = render(AppChrome, { props: { nav } });
    expect(container.querySelector(".st-appChrome__iconControl")).toBeNull();
  });
});

describe("AppChrome — langue", () => {
  it("shows the active locale and fires onLocaleChange on selection", async () => {
    const onLocaleChange = vi.fn();
    const { container } = render(AppChrome, { props: { locale: "fr", onLocaleChange } });
    const trigger = container.querySelector(".st-appChrome__localeWrap button") as HTMLButtonElement;
    expect(trigger.textContent).toContain("FR");
    await fireEvent.click(trigger);
    const en = Array.from(container.querySelectorAll<HTMLButtonElement>(".st-appChrome__menuItem")).find((b) =>
      b.textContent?.includes("English"),
    )!;
    await fireEvent.click(en);
    expect(onLocaleChange).toHaveBeenCalledWith("en");
  });
});

describe("AppChrome — github + identité", () => {
  it("renders the github link with the provided href", () => {
    const { container } = render(AppChrome, { props: { githubHref: "https://github.com/x/y" } });
    const link = container.querySelector('.st-appChrome__utilityNav a[target="_blank"]') as HTMLAnchorElement;
    expect(link.getAttribute("href")).toBe("https://github.com/x/y");
  });

  it("renders the identity snippet content", () => {
    const { container } = render(AppChrome, { props: { identity: snippet("account-zone") } });
    expect(container.querySelector(".st-appChrome__identity")?.textContent).toContain("account-zone");
  });
});

describe("AppChrome — mobile burger + tiroir", () => {
  it("wires the burger aria-controls to the drawer id and renders the drawer when open", () => {
    const { container } = render(AppChrome, { props: { nav, mobileMenuOpen: true } });
    const burger = container.querySelector(".st-appChrome__burgerTrigger") as HTMLButtonElement;
    const drawer = container.querySelector(".st-appChrome__drawer") as HTMLElement;
    expect(drawer).toBeTruthy();
    expect(burger.getAttribute("aria-expanded")).toBe("true");
    expect(burger.getAttribute("aria-controls")).toBe(drawer.id);
    expect(drawer.querySelectorAll(".st-appChrome__drawerLink").length).toBeGreaterThanOrEqual(3);
  });

  it("does not render the drawer when closed and toggles via callback", async () => {
    const onMobileMenuToggle = vi.fn();
    const { container } = render(AppChrome, { props: { nav, onMobileMenuToggle } });
    expect(container.querySelector(".st-appChrome__drawer")).toBeNull();
    await fireEvent.click(container.querySelector(".st-appChrome__burgerTrigger") as HTMLButtonElement);
    expect(onMobileMenuToggle).toHaveBeenCalledTimes(1);
  });
});

describe("AppChrome — extraSelectors", () => {
  it("renders extraSelectors snippet content in the utility nav", () => {
    const { container } = render(AppChrome, { props: { extraSelectors: snippet("extra-ctrl") } });
    expect(container.querySelector(".st-appChrome__extraSelectors")?.textContent).toContain("extra-ctrl");
  });

  it("does not render extraSelectors div when not provided", () => {
    const { container } = render(AppChrome);
    expect(container.querySelector(".st-appChrome__extraSelectors")).toBeNull();
  });
});
