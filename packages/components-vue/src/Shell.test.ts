import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { h } from "vue";
import { AppHeader, LanguageToggle, IdentityMenu, identityInitial } from "./index.js";

describe("AppHeader", () => {
  it("renders desktop nav + actions and hides the burger when not compact", () => {
    const wrapper = mount(AppHeader, {
      slots: {
        nav: () => h("a", { href: "/x" }, "nav-content"),
        logo: () => h("span", "SENT"),
        actions: () => h("span", "actions-content"),
      },
    });
    expect(wrapper.find(".st-appHeader").exists()).toBe(true);
    expect(wrapper.find(".st-appHeader__nav").text()).toContain("nav-content");
    expect(wrapper.find(".st-appHeader__logo").text()).toContain("SENT");
    expect(wrapper.find(".st-appHeader__actions").text()).toContain("actions-content");
    expect(wrapper.find(".st-appHeader__burger").exists()).toBe(false);
  });

  it("shows the burger on the LEFT (calque) in compact mode and toggles", async () => {
    const wrapper = mount(AppHeader, {
      props: { compact: true, menuLabel: "Menu" },
    });
    const bar = wrapper.find(".st-appHeader__bar");
    const burger = wrapper.find(".st-appHeader__burger");
    const button = burger.find("button");
    expect(button.attributes("aria-label")).toBe("Menu");
    expect(button.attributes("aria-expanded")).toBe("false");
    expect((bar.element.firstElementChild as HTMLElement).classList.contains("st-appHeader__burger")).toBe(true);
    expect(wrapper.find(".st-appHeader__nav").exists()).toBe(false);
    expect(wrapper.find(".st-appHeader__actions").exists()).toBe(false);
    await button.trigger("click");
    expect(wrapper.emitted("menuToggle")).toHaveLength(1);
  });

  it("renders the drawer when compact + menuOpen", () => {
    const wrapper = mount(AppHeader, {
      props: { compact: true, menuOpen: true },
      slots: { drawer: () => h("nav", "drawer-content") },
    });
    const drawer = wrapper.find(".st-appHeader__drawer");
    expect(drawer.exists()).toBe(true);
    expect(drawer.text()).toContain("drawer-content");
    expect(wrapper.find("button.st-appHeader__burgerButton").attributes("aria-expanded")).toBe("true");
  });
});

describe("LanguageToggle", () => {
  it("renders the <select> variant calquing the source", () => {
    const wrapper = mount(LanguageToggle, { props: { locale: "fr" } });
    const select = wrapper.find("select.st-languageToggle__select");
    expect(select.exists()).toBe(true);
    expect((select.element as HTMLSelectElement).value).toBe("fr");
    const options = wrapper.findAll("option").map((o) => o.attributes("value"));
    expect(options).toEqual(["fr", "en"]);
  });

  it("emits localeChange when the select changes", async () => {
    const wrapper = mount(LanguageToggle, { props: { locale: "fr" } });
    const select = wrapper.find("select");
    await select.setValue("en");
    expect(wrapper.emitted("localeChange")?.[0]).toEqual(["en"]);
  });

  it("emits localeChange from the accordion option buttons", async () => {
    const wrapper = mount(LanguageToggle, {
      props: { variant: "accordion", locale: "fr", accordionLabel: "Langue" },
    });
    await wrapper.find(".st-languageToggle__accordionTrigger").trigger("click");
    const options = wrapper.findAll(".st-languageToggle__option");
    await options[1].trigger("click");
    expect(wrapper.emitted("localeChange")?.[0]).toEqual(["en"]);
  });
});

describe("IdentityMenu", () => {
  const user = { displayName: "Ada Lovelace", email: "ada@example.com", id: "1" };

  it("derives the avatar initial from the displayName", () => {
    expect(identityInitial(user)).toBe("A");
    expect(identityInitial(null)).toBe("U");
  });

  it("renders the login button when not authenticated", async () => {
    const wrapper = mount(IdentityMenu, {
      props: { user: null, isAuthenticated: false, loginLabel: "Se connecter" },
    });
    expect(wrapper.find(".st-identityMenu__trigger").exists()).toBe(false);
    const login = wrapper.find(".st-identityMenu__login");
    expect(login.text()).toContain("Se connecter");
    await login.trigger("click");
    expect(wrapper.emitted("login")).toHaveLength(1);
  });

  it("renders the avatar + name trigger when authenticated", () => {
    const wrapper = mount(IdentityMenu, { props: { user, isAuthenticated: true } });
    const trigger = wrapper.find(".st-identityMenu__trigger");
    expect(trigger.exists()).toBe(true);
    expect(trigger.attributes("aria-haspopup")).toBe("menu");
    expect(trigger.attributes("aria-expanded")).toBe("false");
    expect(wrapper.find(".st-identityMenu__avatar").text()).toBe("A");
    expect(wrapper.find(".st-identityMenu__name").text()).toContain("Ada Lovelace");
    expect(wrapper.find("button.st-identityMenu__login").exists()).toBe(false);
  });

  it("opens the dropdown and emits logout from the danger item", async () => {
    const wrapper = mount(IdentityMenu, {
      props: { user, isAuthenticated: true, logoutLabel: "Se déconnecter" },
    });
    const trigger = wrapper.find(".st-identityMenu__trigger");
    await trigger.trigger("click");
    expect(trigger.attributes("aria-expanded")).toBe("true");
    expect(wrapper.find('[role="menu"]').exists()).toBe(true);
    const logout = wrapper.find(".st-identityMenu__item--danger");
    expect(logout.text()).toContain("Se déconnecter");
    await logout.trigger("click");
    expect(wrapper.emitted("logout")).toHaveLength(1);
    expect(trigger.attributes("aria-expanded")).toBe("false");
  });

  it("exposes devices/settings links with the provided hrefs", async () => {
    const wrapper = mount(IdentityMenu, {
      props: {
        user,
        isAuthenticated: true,
        devicesHref: "/auth/devices",
        settingsHref: "/settings",
        devicesLabel: "Appareils",
        settingsLabel: "Paramètres",
      },
    });
    await wrapper.find(".st-identityMenu__trigger").trigger("click");
    const links = wrapper.findAll('a[role="menuitem"]');
    expect(links.map((a) => a.attributes("href"))).toEqual(["/auth/devices", "/settings"]);
  });

  it("supports keyboard navigation (ArrowDown opens, Escape closes)", async () => {
    const wrapper = mount(IdentityMenu, { props: { user, isAuthenticated: true } });
    const trigger = wrapper.find(".st-identityMenu__trigger");
    await trigger.trigger("keydown", { key: "ArrowDown" });
    expect(trigger.attributes("aria-expanded")).toBe("true");
    await wrapper.find('[role="menu"]').trigger("keydown", { key: "Escape" });
    expect(trigger.attributes("aria-expanded")).toBe("false");
  });
});
