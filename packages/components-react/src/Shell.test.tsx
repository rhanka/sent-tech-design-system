import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AppHeader, LanguageToggle, IdentityMenu, identityInitial } from "./index.js";

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

describe("AppHeader", () => {
  it("renders desktop nav + actions and hides the burger when not compact", () => {
    const { container } = render(
      <AppHeader nav={<a href="/x">nav-content</a>} logo={<span>SENT</span>} actions={<span>actions-content</span>} />,
    );
    expect(container.querySelector(".st-appHeader")).toBeTruthy();
    expect(container.querySelector(".st-appHeader__nav")?.textContent).toContain("nav-content");
    expect(container.querySelector(".st-appHeader__logo")?.textContent).toContain("SENT");
    expect(container.querySelector(".st-appHeader__actions")?.textContent).toContain("actions-content");
    expect(container.querySelector(".st-appHeader__burger")).toBeNull();
  });

  it("shows the burger on the RIGHT in compact mode and toggles", () => {
    const onMenuToggle = vi.fn();
    const { container } = render(<AppHeader compact menuLabel="Menu" logo={<span>SENT</span>} onMenuToggle={onMenuToggle} />);
    const bar = container.querySelector(".st-appHeader__bar") as HTMLElement;
    const burger = container.querySelector(".st-appHeader__burger") as HTMLElement;
    const button = burger.querySelector("button") as HTMLButtonElement;
    expect(button.getAttribute("aria-label")).toBe("Menu");
    expect(button.getAttribute("aria-expanded")).toBe("false");
    // Burger must be the LAST child of the bar (i.e. on the right), logo first.
    expect(bar.lastElementChild).toBe(burger);
    expect(bar.firstElementChild).toBe(container.querySelector(".st-appHeader__logo"));
    expect(container.querySelector(".st-appHeader__nav")).toBeNull();
    expect(container.querySelector(".st-appHeader__actions")).toBeNull();
    fireEvent.click(button);
    expect(onMenuToggle).toHaveBeenCalledTimes(1);
  });

  it("renders the drawer when compact + menuOpen", () => {
    const { container } = render(<AppHeader compact menuOpen drawer={<nav>drawer-content</nav>} />);
    const drawer = container.querySelector(".st-appHeader__drawer") as HTMLElement;
    expect(drawer).toBeTruthy();
    expect(drawer.textContent).toContain("drawer-content");
    expect(container.querySelector("button.st-appHeader__burgerButton")?.getAttribute("aria-expanded")).toBe("true");
  });

  it("wires aria-controls (burger) to the drawer id (a11y)", () => {
    const { container } = render(<AppHeader compact menuOpen drawer={<nav>drawer-content</nav>} />);
    const button = container.querySelector("button.st-appHeader__burgerButton") as HTMLButtonElement;
    const drawer = container.querySelector(".st-appHeader__drawer") as HTMLElement;
    const controls = button.getAttribute("aria-controls");
    expect(controls).toBeTruthy();
    expect(drawer.id).toBe(controls);
  });

  it("honours a provided drawerId on both burger and drawer", () => {
    const { container } = render(<AppHeader compact menuOpen drawerId="my-drawer" drawer={<nav>x</nav>} />);
    expect(container.querySelector("button.st-appHeader__burgerButton")?.getAttribute("aria-controls")).toBe("my-drawer");
    expect((container.querySelector(".st-appHeader__drawer") as HTMLElement).id).toBe("my-drawer");
  });
});

describe("LanguageToggle", () => {
  it("renders the <select> variant calquing the source", () => {
    const { container } = render(<LanguageToggle locale="fr" />);
    const select = container.querySelector("select.st-languageToggle__select") as HTMLSelectElement;
    expect(select).toBeTruthy();
    expect(select.value).toBe("fr");
    const options = Array.from(select.querySelectorAll("option")).map((o) => o.value);
    expect(options).toEqual(["fr", "en"]);
  });

  it("calls onLocaleChange when the select changes", () => {
    const onLocaleChange = vi.fn();
    const { container } = render(<LanguageToggle locale="fr" onLocaleChange={onLocaleChange} />);
    const select = container.querySelector("select") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "en" } });
    expect(onLocaleChange).toHaveBeenCalledWith("en");
  });

  it("calls onLocaleChange from the accordion option buttons", () => {
    const onLocaleChange = vi.fn();
    const { container } = render(<LanguageToggle variant="accordion" locale="fr" accordionLabel="Langue" onLocaleChange={onLocaleChange} />);
    fireEvent.click(container.querySelector(".st-languageToggle__accordionTrigger") as HTMLButtonElement);
    fireEvent.click(screen.getByText("EN"));
    expect(onLocaleChange).toHaveBeenCalledWith("en");
  });

  it("associates a <label htmlFor> with the <select> (a11y)", () => {
    const { container } = render(<LanguageToggle locale="fr" label="Choisir la langue" />);
    const select = container.querySelector("select.st-languageToggle__select") as HTMLSelectElement;
    const label = container.querySelector("label.st-languageToggle__srLabel") as HTMLLabelElement;
    expect(select.id).toBeTruthy();
    expect(label).toBeTruthy();
    expect(label.getAttribute("for")).toBe(select.id);
    expect(label.textContent).toBe("Choisir la langue");
  });

  it("honours a provided selectId on both label and select", () => {
    const { container } = render(<LanguageToggle locale="fr" selectId="lang-sel" />);
    expect((container.querySelector("select") as HTMLSelectElement).id).toBe("lang-sel");
    expect((container.querySelector("label.st-languageToggle__srLabel") as HTMLLabelElement).getAttribute("for")).toBe("lang-sel");
  });
});

describe("IdentityMenu", () => {
  const user = { displayName: "Ada Lovelace", email: "ada@example.com", id: "1" };

  it("derives the avatar initial from the displayName", () => {
    expect(identityInitial(user)).toBe("A");
    expect(identityInitial(null)).toBe("U");
  });

  it("renders the login button when not authenticated", () => {
    const onLogin = vi.fn();
    const { container } = render(<IdentityMenu user={null} isAuthenticated={false} loginLabel="Se connecter" onLogin={onLogin} />);
    expect(container.querySelector(".st-identityMenu__trigger")).toBeNull();
    fireEvent.click(screen.getByText("Se connecter"));
    expect(onLogin).toHaveBeenCalledTimes(1);
  });

  it("renders the avatar + name trigger when authenticated", () => {
    const { container } = render(<IdentityMenu user={user} isAuthenticated />);
    const trigger = container.querySelector(".st-identityMenu__trigger") as HTMLButtonElement;
    expect(trigger).toBeTruthy();
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(container.querySelector(".st-identityMenu__avatar")?.textContent).toBe("A");
    expect(container.querySelector(".st-identityMenu__name")?.textContent).toContain("Ada Lovelace");
    expect(container.querySelector("button.st-identityMenu__login")).toBeNull();
  });

  it("opens the dropdown and fires onLogout from the danger item", () => {
    const onLogout = vi.fn();
    const { container } = render(<IdentityMenu user={user} isAuthenticated logoutLabel="Se déconnecter" onLogout={onLogout} />);
    const trigger = container.querySelector(".st-identityMenu__trigger") as HTMLButtonElement;
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("menu")).toBeTruthy();
    const logout = container.querySelector(".st-identityMenu__item--danger") as HTMLButtonElement;
    expect(logout.textContent).toContain("Se déconnecter");
    fireEvent.click(logout);
    expect(onLogout).toHaveBeenCalledTimes(1);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("exposes devices/settings links with the provided hrefs", () => {
    const { container } = render(
      <IdentityMenu user={user} isAuthenticated devicesHref="/auth/devices" settingsHref="/settings" devicesLabel="Appareils" settingsLabel="Paramètres" />,
    );
    fireEvent.click(container.querySelector(".st-identityMenu__trigger") as HTMLButtonElement);
    const links = Array.from(container.querySelectorAll<HTMLAnchorElement>('a[role="menuitem"]'));
    expect(links.map((a) => a.getAttribute("href"))).toEqual(["/auth/devices", "/settings"]);
  });

  it("supports keyboard navigation (ArrowDown opens, Escape closes)", () => {
    const { container } = render(<IdentityMenu user={user} isAuthenticated />);
    const trigger = container.querySelector(".st-identityMenu__trigger") as HTMLButtonElement;
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    const menu = container.querySelector('[role="menu"]') as HTMLElement;
    fireEvent.keyDown(menu, { key: "Escape" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("focuses the first item on open (ArrowDown)", async () => {
    const { container } = render(<IdentityMenu user={user} isAuthenticated />);
    const trigger = container.querySelector(".st-identityMenu__trigger") as HTMLButtonElement;
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    const items = Array.from(container.querySelectorAll<HTMLElement>('[role="menuitem"]'));
    await waitFor(() => expect(document.activeElement).toBe(items[0]));
  });

  it.each(["Enter", " "])("activates a link item with %s (Space too)", (key) => {
    const { container } = render(<IdentityMenu user={user} isAuthenticated devicesHref="/auth/devices" />);
    fireEvent.click(container.querySelector(".st-identityMenu__trigger") as HTMLButtonElement);
    const devices = container.querySelector('a[role="menuitem"]') as HTMLAnchorElement;
    const clicked = vi.fn();
    devices.addEventListener("click", clicked);
    fireEvent.keyDown(devices, { key });
    expect(clicked).toHaveBeenCalledTimes(1);
  });

  it("traps focus with Tab / Shift+Tab inside the menu", () => {
    const { container } = render(<IdentityMenu user={user} isAuthenticated />);
    fireEvent.click(container.querySelector(".st-identityMenu__trigger") as HTMLButtonElement);
    const menu = container.querySelector('[role="menu"]') as HTMLElement;
    const items = Array.from(container.querySelectorAll<HTMLElement>('[role="menuitem"]'));
    items[items.length - 1].focus();
    fireEvent.keyDown(menu, { key: "Tab" });
    expect(document.activeElement).toBe(items[0]);
    fireEvent.keyDown(menu, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(items[items.length - 1]);
  });

  it("closes from the trigger with Escape (global to the open component)", () => {
    const { container } = render(<IdentityMenu user={user} isAuthenticated />);
    const trigger = container.querySelector(".st-identityMenu__trigger") as HTMLButtonElement;
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("restores focus to the trigger when closing via Escape", () => {
    const { container } = render(<IdentityMenu user={user} isAuthenticated />);
    const trigger = container.querySelector(".st-identityMenu__trigger") as HTMLButtonElement;
    fireEvent.click(trigger);
    const menu = container.querySelector('[role="menu"]') as HTMLElement;
    fireEvent.keyDown(menu, { key: "Escape" });
    expect(document.activeElement).toBe(trigger);
  });

  it("restores focus to the trigger after selecting an item", () => {
    const { container } = render(<IdentityMenu user={user} isAuthenticated />);
    const trigger = container.querySelector(".st-identityMenu__trigger") as HTMLButtonElement;
    fireEvent.click(trigger);
    const devices = container.querySelector('a[role="menuitem"]') as HTMLAnchorElement;
    fireEvent.click(devices);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(trigger);
  });

  it("closes on outside click and restores focus to the trigger", () => {
    const { container } = render(<IdentityMenu user={user} isAuthenticated />);
    const trigger = container.querySelector(".st-identityMenu__trigger") as HTMLButtonElement;
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    fireEvent.pointerDown(document.body);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(trigger);
  });

  it("supports a controlled open + onOpenChange (controlled/uncontrolled pattern)", () => {
    const onOpenChange = vi.fn();
    const { container } = render(<IdentityMenu user={user} isAuthenticated open={false} onOpenChange={onOpenChange} />);
    const trigger = container.querySelector(".st-identityMenu__trigger") as HTMLButtonElement;
    expect(container.querySelector('[role="menu"]')).toBeNull();
    fireEvent.click(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("reflects a controlled open=true by rendering the menu", () => {
    const { container } = render(<IdentityMenu user={user} isAuthenticated open />);
    expect(container.querySelector('[role="menu"]')).toBeTruthy();
    expect(container.querySelector(".st-identityMenu__trigger")?.getAttribute("aria-expanded")).toBe("true");
  });
});
