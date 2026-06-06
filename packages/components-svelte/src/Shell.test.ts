import { fireEvent, render } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { describe, expect, it, vi } from "vitest";
import AppHeader from "./lib/AppHeader.svelte";
import LanguageToggle from "./lib/LanguageToggle.svelte";
import IdentityMenu, { identityInitial } from "./lib/IdentityMenu.svelte";

const snippet = (html: string) =>
  createRawSnippet(() => ({ render: () => `<span>${html}</span>` }));

describe("AppHeader", () => {
  it("renders desktop nav + actions and hides the burger when not compact", () => {
    const { container } = render(AppHeader, {
      props: {
        nav: snippet("nav-content"),
        logo: snippet("SENT"),
        actions: snippet("actions-content"),
      },
    });
    expect(container.querySelector(".st-appHeader")).toBeTruthy();
    expect(container.querySelector(".st-appHeader__nav")?.textContent).toContain("nav-content");
    expect(container.querySelector(".st-appHeader__logo")?.textContent).toContain("SENT");
    expect(container.querySelector(".st-appHeader__actions")?.textContent).toContain("actions-content");
    expect(container.querySelector(".st-appHeader__burger")).toBeNull();
  });

  it("shows the burger on the LEFT (calque) in compact mode and toggles", async () => {
    const onMenuToggle = vi.fn();
    const { container } = render(AppHeader, {
      props: { compact: true, menuLabel: "Menu", onMenuToggle },
    });
    const bar = container.querySelector(".st-appHeader__bar") as HTMLElement;
    const burger = container.querySelector(".st-appHeader__burger") as HTMLElement;
    const button = burger.querySelector("button") as HTMLButtonElement;
    expect(button.getAttribute("aria-label")).toBe("Menu");
    expect(button.getAttribute("aria-expanded")).toBe("false");
    // Burger must be the FIRST child of the bar (i.e. on the left).
    expect(bar.firstElementChild).toBe(burger);
    // Desktop nav + actions are hidden in compact mode.
    expect(container.querySelector(".st-appHeader__nav")).toBeNull();
    expect(container.querySelector(".st-appHeader__actions")).toBeNull();
    await fireEvent.click(button);
    expect(onMenuToggle).toHaveBeenCalledTimes(1);
  });

  it("renders the drawer when compact + menuOpen", () => {
    const { container } = render(AppHeader, {
      props: { compact: true, menuOpen: true, drawer: snippet("drawer-content") },
    });
    const drawer = container.querySelector(".st-appHeader__drawer") as HTMLElement;
    expect(drawer).toBeTruthy();
    expect(drawer.textContent).toContain("drawer-content");
    expect(container.querySelector("button.st-appHeader__burgerButton")?.getAttribute("aria-expanded")).toBe("true");
  });
});

describe("LanguageToggle", () => {
  it("renders the <select> variant calquing the source", () => {
    const { container } = render(LanguageToggle, {
      props: { locale: "fr", frLabel: "FR", enLabel: "EN" },
    });
    const select = container.querySelector("select.st-languageToggle__select") as HTMLSelectElement;
    expect(select).toBeTruthy();
    expect(select.value).toBe("fr");
    const options = Array.from(select.querySelectorAll("option")).map((o) => o.value);
    expect(options).toEqual(["fr", "en"]);
  });

  it("calls onLocaleChange when the select changes", async () => {
    const onLocaleChange = vi.fn();
    const { container } = render(LanguageToggle, {
      props: { locale: "fr", onLocaleChange },
    });
    const select = container.querySelector("select") as HTMLSelectElement;
    await fireEvent.change(select, { target: { value: "en" } });
    expect(onLocaleChange).toHaveBeenCalledWith("en");
  });

  it("calls onLocaleChange from the accordion option buttons", async () => {
    const onLocaleChange = vi.fn();
    const { container, getByText } = render(LanguageToggle, {
      props: { variant: "accordion", locale: "fr", accordionLabel: "Langue", onLocaleChange },
    });
    // Open the accordion.
    await fireEvent.click(container.querySelector(".st-languageToggle__accordionTrigger") as HTMLButtonElement);
    await fireEvent.click(getByText("EN"));
    expect(onLocaleChange).toHaveBeenCalledWith("en");
  });
});

describe("IdentityMenu", () => {
  const user = { displayName: "Ada Lovelace", email: "ada@example.com", id: "1" };

  it("derives the avatar initial from the displayName", () => {
    expect(identityInitial(user)).toBe("A");
    expect(identityInitial(null)).toBe("U");
  });

  it("renders the login button when not authenticated", async () => {
    const onLogin = vi.fn();
    const { container, getByText } = render(IdentityMenu, {
      props: { user: null, isAuthenticated: false, loginLabel: "Se connecter", onLogin },
    });
    expect(container.querySelector(".st-identityMenu__trigger")).toBeNull();
    const login = getByText("Se connecter");
    await fireEvent.click(login);
    expect(onLogin).toHaveBeenCalledTimes(1);
  });

  it("renders the avatar + name trigger when authenticated", () => {
    const { container } = render(IdentityMenu, {
      props: { user, isAuthenticated: true },
    });
    const trigger = container.querySelector(".st-identityMenu__trigger") as HTMLButtonElement;
    expect(trigger).toBeTruthy();
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(container.querySelector(".st-identityMenu__avatar")?.textContent).toBe("A");
    expect(container.querySelector(".st-identityMenu__name")?.textContent).toContain("Ada Lovelace");
    expect(container.querySelector("button.st-identityMenu__login")).toBeNull();
  });

  it("opens the dropdown and fires onLogout from the danger item", async () => {
    const onLogout = vi.fn();
    const { container, getByRole } = render(IdentityMenu, {
      props: { user, isAuthenticated: true, logoutLabel: "Se déconnecter", onLogout },
    });
    const trigger = container.querySelector(".st-identityMenu__trigger") as HTMLButtonElement;
    await fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    const menu = getByRole("menu");
    expect(menu).toBeTruthy();
    const logout = container.querySelector(".st-identityMenu__item--danger") as HTMLButtonElement;
    expect(logout.textContent).toContain("Se déconnecter");
    await fireEvent.click(logout);
    expect(onLogout).toHaveBeenCalledTimes(1);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("exposes devices/settings links with the provided hrefs", async () => {
    const { container } = render(IdentityMenu, {
      props: {
        user,
        isAuthenticated: true,
        devicesHref: "/auth/devices",
        settingsHref: "/settings",
        devicesLabel: "Appareils",
        settingsLabel: "Paramètres",
      },
    });
    await fireEvent.click(container.querySelector(".st-identityMenu__trigger") as HTMLButtonElement);
    const links = Array.from(container.querySelectorAll<HTMLAnchorElement>('a[role="menuitem"]'));
    expect(links.map((a) => a.getAttribute("href"))).toEqual(["/auth/devices", "/settings"]);
  });

  it("supports keyboard navigation (ArrowDown opens + focuses, Escape closes)", async () => {
    const { container } = render(IdentityMenu, {
      props: { user, isAuthenticated: true },
    });
    const trigger = container.querySelector(".st-identityMenu__trigger") as HTMLButtonElement;
    await fireEvent.keyDown(trigger, { key: "ArrowDown" });
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    const menu = container.querySelector('[role="menu"]') as HTMLElement;
    await fireEvent.keyDown(menu, { key: "Escape" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });
});
