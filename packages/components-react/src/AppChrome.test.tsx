import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { AppChrome } from "./AppChrome.js";

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

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
    const { container } = render(
      <AppChrome brandName="Sentropic" productName="dataviz" logoSrc="/SENT-logo-squared.svg" brandHref="/home" />,
    );
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
    const { container } = render(<AppChrome productName="dataviz" />);
    expect(container.querySelector(".st-appChrome__brandName")?.textContent).toBe("Sentropic");
  });
});

describe("AppChrome — navigation", () => {
  it("renders nav links and marks the active one with aria-current", () => {
    const { container } = render(<AppChrome nav={nav} />);
    const links = Array.from(container.querySelectorAll<HTMLAnchorElement>(".st-appChrome__navLink"));
    expect(links.map((a) => a.textContent)).toEqual(["Vues", "Données", "Réglages"]);
    expect(links[0].getAttribute("aria-current")).toBe("page");
    expect(links[1].getAttribute("aria-current")).toBeNull();
    // Classe publiée AppHeader réutilisée pour le style canonique.
    expect(links[0].classList.contains("st-appHeader__navLink")).toBe(true);
  });
});

describe("AppChrome — contrôle thème", () => {
  it("shows the active theme label and fires onThemeChange on selection", () => {
    const onThemeChange = vi.fn();
    const { container } = render(<AppChrome themes={themes} theme="sent-tech" onThemeChange={onThemeChange} />);
    const trigger = container.querySelector(".st-appChrome__themeWrap button") as HTMLButtonElement;
    expect(trigger.textContent).toContain("Sentropic");
    fireEvent.click(trigger);
    expect(screen.getByRole("menu")).toBeTruthy();
    fireEvent.click(screen.getByText("Carbon"));
    expect(onThemeChange).toHaveBeenCalledWith("carbon");
  });

  it("hides the theme selector when themes is empty", () => {
    const { container } = render(<AppChrome />);
    expect(container.querySelector(".st-appChrome__themeWrap")).toBeNull();
  });
});

describe("AppChrome — mode couleur", () => {
  it("cycles light -> dark -> auto via onColorModeChange", () => {
    const onColorModeChange = vi.fn();
    const { container, rerender } = render(<AppChrome colorMode="light" onColorModeChange={onColorModeChange} />);
    const btn = container.querySelector(".st-appChrome__iconControl") as HTMLButtonElement;
    fireEvent.click(btn);
    expect(onColorModeChange).toHaveBeenCalledWith("dark");
    rerender(<AppChrome colorMode="dark" onColorModeChange={onColorModeChange} />);
    fireEvent.click(container.querySelector(".st-appChrome__iconControl") as HTMLButtonElement);
    expect(onColorModeChange).toHaveBeenLastCalledWith("auto");
    rerender(<AppChrome colorMode="auto" onColorModeChange={onColorModeChange} />);
    fireEvent.click(container.querySelector(".st-appChrome__iconControl") as HTMLButtonElement);
    expect(onColorModeChange).toHaveBeenLastCalledWith("light");
  });

  it("hides the color-mode toggle when colorMode is undefined", () => {
    const { container } = render(<AppChrome nav={nav} />);
    expect(container.querySelector(".st-appChrome__iconControl")).toBeNull();
  });
});

describe("AppChrome — langue", () => {
  it("shows the active locale and fires onLocaleChange on selection", () => {
    const onLocaleChange = vi.fn();
    const { container } = render(<AppChrome locale="fr" onLocaleChange={onLocaleChange} />);
    const trigger = container.querySelector(".st-appChrome__localeWrap button") as HTMLButtonElement;
    expect(trigger.textContent).toContain("FR");
    fireEvent.click(trigger);
    fireEvent.click(screen.getByText("English"));
    expect(onLocaleChange).toHaveBeenCalledWith("en");
  });
});

describe("AppChrome — github + identité", () => {
  it("renders the github link with the provided href", () => {
    const { container } = render(<AppChrome githubHref="https://github.com/x/y" />);
    const link = container.querySelector('.st-appChrome__utilityNav a[target="_blank"]') as HTMLAnchorElement;
    expect(link.getAttribute("href")).toBe("https://github.com/x/y");
  });

  it("renders the identity slot/prop content", () => {
    const { container } = render(<AppChrome identity={<span>account-zone</span>} />);
    expect(container.querySelector(".st-appChrome__identity")?.textContent).toContain("account-zone");
  });
});

describe("AppChrome — mobile burger + tiroir", () => {
  it("wires the burger aria-controls to the drawer id and renders the drawer when open", () => {
    const { container } = render(<AppChrome nav={nav} mobileMenuOpen />);
    const burger = container.querySelector(".st-appChrome__burgerTrigger") as HTMLButtonElement;
    const drawer = container.querySelector(".st-appChrome__drawer") as HTMLElement;
    expect(drawer).toBeTruthy();
    expect(burger.getAttribute("aria-expanded")).toBe("true");
    expect(burger.getAttribute("aria-controls")).toBe(drawer.id);
    expect(drawer.querySelectorAll(".st-appChrome__drawerLink").length).toBeGreaterThanOrEqual(3);
  });

  it("does not render the drawer when closed and toggles via callback", () => {
    const onMobileMenuToggle = vi.fn();
    const { container } = render(<AppChrome nav={nav} onMobileMenuToggle={onMobileMenuToggle} />);
    expect(container.querySelector(".st-appChrome__drawer")).toBeNull();
    fireEvent.click(container.querySelector(".st-appChrome__burgerTrigger") as HTMLButtonElement);
    expect(onMobileMenuToggle).toHaveBeenCalledTimes(1);
  });
});
