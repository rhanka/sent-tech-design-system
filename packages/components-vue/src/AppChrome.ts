import { defineComponent, h, onBeforeUnmount, onMounted, ref, type PropType, type VNode } from "vue";
import { AppHeader } from "./AppHeader.js";
import { classNames } from "./classNames.js";

export interface AppChromeNavItem {
  label: string;
  href: string;
  /** Marqué actif (souligné, aria-current=page). */
  active?: boolean;
}

export interface AppChromeThemeOption {
  id: string;
  label: string;
}

export type AppChromeColorMode = "light" | "dark" | "auto";
export type AppChromeLocale = "fr" | "en";

export type AppChromeProps = {
  brandName?: string;
  productName?: string;
  logoSrc?: string;
  logoAlt?: string;
  brandHref?: string;
  brandLabel?: string;
  nav?: AppChromeNavItem[];
  navLabel?: string;
  themes?: AppChromeThemeOption[];
  theme?: string;
  onThemeChange?: (id: string) => void;
  themeLabel?: string;
  colorMode?: AppChromeColorMode;
  onColorModeChange?: (mode: AppChromeColorMode) => void;
  colorModeLabels?: { light: string; dark: string; auto: string };
  locale?: AppChromeLocale;
  onLocaleChange?: (locale: AppChromeLocale) => void;
  localeLabel?: string;
  githubHref?: string;
  githubLabel?: string;
  mobileMenuOpen?: boolean;
  onMobileMenuToggle?: () => void;
  menuLabel?: string;
  class?: string;
};

let appChromeIdCounter = 0;

// Icônes lucide reproduites en SVG inline (mêmes paths que @lucide/svelte).
function svgIcon(size: number, strokeWidth: number, paths: VNode[], style?: Record<string, string>) {
  return h(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": strokeWidth,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
      focusable: "false",
      style,
    },
    paths,
  );
}
function PaletteIcon() {
  return svgIcon(14, 2, [
    h("path", { d: "M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.6z" }),
    h("circle", { cx: 13.5, cy: 6.5, r: 0.5, fill: "currentColor" }),
    h("circle", { cx: 17.5, cy: 10.5, r: 0.5, fill: "currentColor" }),
    h("circle", { cx: 6.5, cy: 12.5, r: 0.5, fill: "currentColor" }),
    h("circle", { cx: 8.5, cy: 7.5, r: 0.5, fill: "currentColor" }),
  ]);
}
function GlobeIcon() {
  return svgIcon(14, 2, [
    h("circle", { cx: 12, cy: 12, r: 10 }),
    h("path", { d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" }),
    h("path", { d: "M2 12h20" }),
  ]);
}
function ChevronDownIcon(cls: string) {
  return h(
    "svg",
    {
      width: 12,
      height: 12,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": 2,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
      focusable: "false",
      class: cls,
    },
    [h("path", { d: "m6 9 6 6 6-6" })],
  );
}
function SunIcon(strokeWidth = 2, style?: Record<string, string>) {
  return svgIcon(
    16,
    strokeWidth,
    [
      h("circle", { cx: 12, cy: 12, r: 4 }),
      h("path", { d: "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" }),
    ],
    style,
  );
}
function MoonIcon() {
  return svgIcon(16, 2, [h("path", { d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9" })]);
}
function GithubIcon() {
  return svgIcon(16, 2.1, [
    h("path", { d: "M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 4 5 4 5 4c-.3 1.15-.3 2.35 0 3.5a5.4 5.4 0 0 0-1 3.5c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" }),
    h("path", { d: "M9 18c-4.51 2-5-2-7-2" }),
  ]);
}
function MenuIcon() {
  return h(
    "svg",
    {
      width: 20,
      height: 20,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": 2,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
      focusable: "false",
    },
    [
      h("line", { x1: 4, x2: 20, y1: 6, y2: 6 }),
      h("line", { x1: 4, x2: 20, y1: 12, y2: 12 }),
      h("line", { x1: 4, x2: 20, y1: 18, y2: 18 }),
    ],
  );
}

export const AppChrome = defineComponent({
  name: "AppChrome",
  props: {
    brandName: { type: String, default: "Sentropic" },
    productName: { type: String, default: undefined },
    logoSrc: { type: String, default: undefined },
    logoAlt: { type: String, default: "" },
    brandHref: { type: String, default: "/" },
    brandLabel: { type: String, default: undefined },
    nav: { type: Array as PropType<AppChromeNavItem[]>, default: () => [] },
    navLabel: { type: String, default: "Primary" },
    themes: { type: Array as PropType<AppChromeThemeOption[]>, default: () => [] },
    theme: { type: String, default: undefined },
    onThemeChange: { type: Function as PropType<(id: string) => void>, default: undefined },
    themeLabel: { type: String, default: "Change theme" },
    colorMode: { type: String as PropType<AppChromeColorMode>, default: undefined },
    onColorModeChange: { type: Function as PropType<(mode: AppChromeColorMode) => void>, default: undefined },
    colorModeLabels: {
      type: Object as PropType<{ light: string; dark: string; auto: string }>,
      default: () => ({ light: "Light mode", dark: "Dark mode", auto: "Auto mode" }),
    },
    locale: { type: String as PropType<AppChromeLocale>, default: undefined },
    onLocaleChange: { type: Function as PropType<(locale: AppChromeLocale) => void>, default: undefined },
    localeLabel: { type: String, default: "Change language" },
    githubHref: { type: String, default: undefined },
    githubLabel: { type: String, default: "GitHub" },
    mobileMenuOpen: { type: Boolean, default: false },
    onMobileMenuToggle: { type: Function as PropType<() => void>, default: undefined },
    menuLabel: { type: String, default: "Menu" },
    class: { type: String, default: undefined },
  },
  setup(props, { slots }) {
    const drawerId = `st-appChrome-drawer-${++appChromeIdCounter}`;
    const isThemeOpen = ref(false);
    const isLocaleOpen = ref(false);

    function onDocClick(e: MouseEvent) {
      const target = e.target as Element | null;
      if (isThemeOpen.value && target && !target.closest(".st-appChrome__themeWrap")) isThemeOpen.value = false;
      if (isLocaleOpen.value && target && !target.closest(".st-appChrome__localeWrap")) isLocaleOpen.value = false;
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        isThemeOpen.value = false;
        isLocaleOpen.value = false;
      }
    }
    onMounted(() => {
      document.addEventListener("click", onDocClick);
      document.addEventListener("keydown", onKey);
    });
    onBeforeUnmount(() => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    });

    function cycleColorMode() {
      const next: AppChromeColorMode =
        props.colorMode === "light" ? "dark" : props.colorMode === "dark" ? "auto" : "light";
      props.onColorModeChange?.(next);
    }

    return () => {
      const activeTheme = props.themes.find((t) => t.id === props.theme) ?? props.themes[0];
      const showThemeSelector = props.themes.length > 0;
      const showColorMode = props.colorMode !== undefined;
      const showLocaleSelector = props.locale !== undefined;
      const showGithub = Boolean(props.githubHref);
      const identitySlot = slots.identity;
      // Note : extraSelectors est un slot Vue, pas une prop.
      const extraSelectorsSlot = slots.extraSelectors;

      const colorModeAriaLabel =
        props.colorMode === "light"
          ? props.colorModeLabels.dark
          : props.colorMode === "dark"
            ? props.colorModeLabels.auto
            : props.colorModeLabels.light;

      const brand = h(
        "a",
        {
          class: "st-appChrome__brand",
          href: props.brandHref,
          "aria-label": props.brandLabel ?? ([props.brandName, props.productName].filter(Boolean).join(" ") || undefined),
        },
        [
          props.logoSrc
            ? h("img", {
                class: "st-appChrome__brandMark",
                src: props.logoSrc,
                alt: props.logoAlt,
                "aria-hidden": props.logoAlt ? undefined : "true",
              })
            : null,
          props.brandName || props.productName
            ? h("span", { class: "st-appChrome__brandCopy" }, [
                props.brandName ? h("span", { class: "st-appChrome__brandName" }, props.brandName) : null,
                props.productName ? h("span", { class: "st-appChrome__brandProduct" }, props.productName) : null,
              ])
            : null,
        ],
      );

      const navContent = props.nav.map((item) =>
        h(
          "a",
          {
            key: item.href,
            class: "st-appChrome__navLink st-appHeader__navLink",
            href: item.href,
            "aria-current": item.active ? "page" : undefined,
          },
          item.label,
        ),
      );

      const utilityNav = h("div", { class: "st-appChrome__utilityNav" }, [
        showThemeSelector
          ? h("div", { class: "st-appChrome__themeWrap st-appChrome__menuWrap" }, [
              h(
                "button",
                {
                  type: "button",
                  class: "st-appChrome__control st-appHeader__control",
                  onClick: () => (isThemeOpen.value = !isThemeOpen.value),
                  "aria-expanded": isThemeOpen.value ? "true" : "false",
                  "aria-haspopup": "true",
                  "aria-label": props.themeLabel,
                },
                [
                  PaletteIcon(),
                  h("span", activeTheme?.label),
                  ChevronDownIcon(classNames("st-appChrome__chevron", isThemeOpen.value ? "is-rotated" : undefined)),
                ],
              ),
              isThemeOpen.value
                ? h(
                    "div",
                    { class: "st-appChrome__menu", role: "menu" },
                    props.themes.map((option) =>
                      h(
                        "button",
                        {
                          key: option.id,
                          type: "button",
                          class: classNames("st-appChrome__menuItem", props.theme === option.id ? "is-active" : undefined),
                          role: "menuitem",
                          onClick: () => {
                            props.onThemeChange?.(option.id);
                            isThemeOpen.value = false;
                          },
                        },
                        [
                          h("span", { class: "st-appChrome__check", "aria-hidden": "true" }, props.theme === option.id ? "✓" : ""),
                          h("span", option.label),
                        ],
                      ),
                    ),
                  )
                : null,
            ])
          : null,

        showColorMode
          ? h(
              "button",
              {
                type: "button",
                class: "st-appChrome__control st-appChrome__iconControl st-appHeader__control",
                onClick: cycleColorMode,
                "aria-label": colorModeAriaLabel,
              },
              [
                props.colorMode === "dark"
                  ? MoonIcon()
                  : props.colorMode === "light"
                    ? SunIcon()
                    : SunIcon(1.5, { opacity: "0.65" }),
              ],
            )
          : null,

        showLocaleSelector
          ? h("div", { class: "st-appChrome__localeWrap st-appChrome__menuWrap" }, [
              h(
                "button",
                {
                  type: "button",
                  class: "st-appChrome__control st-appHeader__control",
                  onClick: () => (isLocaleOpen.value = !isLocaleOpen.value),
                  "aria-expanded": isLocaleOpen.value ? "true" : "false",
                  "aria-haspopup": "true",
                  "aria-label": props.localeLabel,
                },
                [
                  GlobeIcon(),
                  h("span", props.locale?.toUpperCase()),
                  ChevronDownIcon(classNames("st-appChrome__chevron", isLocaleOpen.value ? "is-rotated" : undefined)),
                ],
              ),
              isLocaleOpen.value
                ? h(
                    "div",
                    { class: "st-appChrome__menu", role: "menu" },
                    (["fr", "en"] as AppChromeLocale[]).map((value) =>
                      h(
                        "button",
                        {
                          key: value,
                          type: "button",
                          class: classNames("st-appChrome__menuItem", props.locale === value ? "is-active" : undefined),
                          role: "menuitem",
                          onClick: () => {
                            props.onLocaleChange?.(value);
                            isLocaleOpen.value = false;
                          },
                        },
                        [
                          h("span", { class: "st-appChrome__check", "aria-hidden": "true" }, props.locale === value ? "✓" : ""),
                          h("span", value === "fr" ? "Français" : "English"),
                        ],
                      ),
                    ),
                  )
                : null,
            ])
          : null,

        showGithub
          ? h(
              "a",
              {
                class: "st-appChrome__control st-appChrome__iconControl st-appHeader__control",
                href: props.githubHref,
                rel: "noreferrer",
                target: "_blank",
                "aria-label": props.githubLabel,
              },
              [GithubIcon()],
            )
          : null,

        identitySlot ? h("div", { class: "st-appChrome__identity" }, identitySlot()) : null,
        extraSelectorsSlot ? h("div", { class: "st-appChrome__extraSelectors" }, extraSelectorsSlot()) : null,
      ]);

      const actions = [
        utilityNav,
        h(
          "button",
          {
            type: "button",
            class: "st-appChrome__burgerTrigger",
            onClick: props.onMobileMenuToggle,
            "aria-expanded": props.mobileMenuOpen ? "true" : "false",
            "aria-controls": drawerId,
            "aria-label": props.menuLabel,
          },
          [MenuIcon()],
        ),
      ];

      const header = h(
        AppHeader,
        { class: "st-appChrome__header", brandHref: props.brandHref, brandLabel: props.brandLabel },
        {
          logo: () => brand,
          nav: () => navContent,
          actions: () => actions,
        },
      );

      const drawer = props.mobileMenuOpen
        ? h("nav", { id: drawerId, class: "st-appChrome__drawer", "aria-label": props.navLabel }, [
            h(
              "div",
              { class: "st-appChrome__drawerSection" },
              props.nav.map((item) =>
                h(
                  "a",
                  {
                    key: item.href,
                    class: "st-appChrome__drawerLink",
                    href: item.href,
                    "aria-current": item.active ? "page" : undefined,
                    onClick: () => props.onMobileMenuToggle?.(),
                  },
                  item.label,
                ),
              ),
            ),

            showThemeSelector
              ? h("div", { class: "st-appChrome__drawerSection" }, [
                  h("span", { class: "st-appChrome__drawerLabel" }, props.themeLabel),
                  h(
                    "div",
                    { class: "st-appChrome__drawerSwitcher" },
                    props.themes.map((option) =>
                      h(
                        "button",
                        {
                          key: option.id,
                          type: "button",
                          class: classNames("st-appChrome__drawerBtn", props.theme === option.id ? "is-active" : undefined),
                          onClick: () => {
                            props.onThemeChange?.(option.id);
                            props.onMobileMenuToggle?.();
                          },
                        },
                        option.label,
                      ),
                    ),
                  ),
                ])
              : null,

            showColorMode
              ? h("div", { class: "st-appChrome__drawerSection" }, [
                  h("span", { class: "st-appChrome__drawerLabel" }, `${props.colorModeLabels.light} / ${props.colorModeLabels.dark}`),
                  h(
                    "div",
                    { class: "st-appChrome__drawerSwitcher" },
                    (["light", "dark", "auto"] as AppChromeColorMode[]).map((mode) =>
                      h(
                        "button",
                        {
                          key: mode,
                          type: "button",
                          class: classNames("st-appChrome__drawerBtn", props.colorMode === mode ? "is-active" : undefined),
                          onClick: () => props.onColorModeChange?.(mode),
                        },
                        mode === "light"
                          ? props.colorModeLabels.light
                          : mode === "dark"
                            ? props.colorModeLabels.dark
                            : props.colorModeLabels.auto,
                      ),
                    ),
                  ),
                ])
              : null,

            showLocaleSelector
              ? h("div", { class: "st-appChrome__drawerSection" }, [
                  h("span", { class: "st-appChrome__drawerLabel" }, props.localeLabel),
                  h(
                    "div",
                    { class: "st-appChrome__drawerSwitcher" },
                    (["fr", "en"] as AppChromeLocale[]).map((value) =>
                      h(
                        "button",
                        {
                          key: value,
                          type: "button",
                          class: classNames("st-appChrome__drawerBtn", props.locale === value ? "is-active" : undefined),
                          onClick: () => {
                            props.onLocaleChange?.(value);
                            props.onMobileMenuToggle?.();
                          },
                        },
                        value === "fr" ? "Français" : "English",
                      ),
                    ),
                  ),
                ])
              : null,

            showGithub || identitySlot
              ? h("div", { class: "st-appChrome__drawerSection" }, [
                  showGithub
                    ? h(
                        "a",
                        { class: "st-appChrome__drawerLink", href: props.githubHref, rel: "noreferrer", target: "_blank" },
                        props.githubLabel,
                      )
                    : null,
                  identitySlot ? h("div", { class: "st-appChrome__identity" }, identitySlot()) : null,
                ])
              : null,
          ])
        : null;

      return h("div", { class: classNames("st-appChrome", props.class) }, [header, drawer]);
    };
  },
});
