import React from "react";
import { AppHeader } from "./catalog.js";
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

export interface AppChromeProps {
  // Marque
  brandName?: string;
  productName?: string;
  logoSrc?: string;
  logoAlt?: string;
  brandHref?: string;
  brandLabel?: string;
  // Navigation
  nav?: AppChromeNavItem[];
  navLabel?: string;
  // Thème (contrôlé)
  themes?: AppChromeThemeOption[];
  theme?: string;
  onThemeChange?: (id: string) => void;
  themeLabel?: string;
  // Mode couleur (contrôlé)
  colorMode?: AppChromeColorMode;
  onColorModeChange?: (mode: AppChromeColorMode) => void;
  colorModeLabels?: { light: string; dark: string; auto: string };
  // Langue (contrôlé)
  locale?: AppChromeLocale;
  onLocaleChange?: (locale: AppChromeLocale) => void;
  localeLabel?: string;
  // GitHub
  githubHref?: string;
  githubLabel?: string;
  // Identité
  identity?: React.ReactNode;
  // Mobile
  mobileMenuOpen?: boolean;
  onMobileMenuToggle?: () => void;
  menuLabel?: string;
  className?: string;
}

// Icônes lucide reproduites en SVG inline (mêmes paths que @lucide/svelte) pour
// conserver une parité stricte sans dépendance lucide-react.
function PaletteIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.6z" />
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
    </svg>
  );
}
function GlobeIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}
function ChevronDownIcon({ size = 12, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className={className}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
function SunIcon({ size = 16, strokeWidth = 2, style }: { size?: number; strokeWidth?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" style={style}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}
function MoonIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9" />
    </svg>
  );
}
function GithubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 4 5 4 5 4c-.3 1.15-.3 2.35 0 3.5a5.4 5.4 0 0 0-1 3.5c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}
function BoxesIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" />
      <path d="m7 16.5-4.74-2.85M7 16.5l5-3M7 16.5v5.17" />
      <path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z" />
      <path d="m17 16.5-5-3M17 16.5l4.74-2.85M17 16.5v5.17M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z" />
      <path d="M12 8 7.26 5.15M12 8l4.74-2.85M12 8v5.5" />
    </svg>
  );
}

let appChromeIdCounter = 0;

export function AppChrome({
  brandName = "Sentropic",
  productName,
  logoSrc,
  logoAlt = "",
  brandHref = "/",
  brandLabel,
  nav = [],
  navLabel = "Primary",
  themes = [],
  theme,
  onThemeChange,
  themeLabel = "Change theme",
  colorMode,
  onColorModeChange,
  colorModeLabels = { light: "Light mode", dark: "Dark mode", auto: "Auto mode" },
  locale,
  onLocaleChange,
  localeLabel = "Change language",
  githubHref,
  githubLabel = "GitHub",
  identity,
  mobileMenuOpen = false,
  onMobileMenuToggle,
  menuLabel = "Menu",
  className,
}: AppChromeProps) {
  const reactId = React.useId();
  const drawerId = React.useMemo(() => `st-appChrome-drawer-${++appChromeIdCounter}-${reactId}`, [reactId]);
  const [isThemeOpen, setThemeOpen] = React.useState(false);
  const [isLocaleOpen, setLocaleOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isThemeOpen && !isLocaleOpen) return;
    function onDocClick(e: MouseEvent) {
      const target = e.target as Element | null;
      if (target && !target.closest(".st-appChrome__themeWrap")) setThemeOpen(false);
      if (target && !target.closest(".st-appChrome__localeWrap")) setLocaleOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setThemeOpen(false);
        setLocaleOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [isThemeOpen, isLocaleOpen]);

  const activeTheme = themes.find((t) => t.id === theme) ?? themes[0];
  const showThemeSelector = themes.length > 0;
  const showColorMode = colorMode !== undefined;
  const showLocaleSelector = locale !== undefined;
  const showGithub = Boolean(githubHref);

  const colorModeAriaLabel =
    colorMode === "light" ? colorModeLabels.dark : colorMode === "dark" ? colorModeLabels.auto : colorModeLabels.light;
  function cycleColorMode() {
    const next: AppChromeColorMode = colorMode === "light" ? "dark" : colorMode === "dark" ? "auto" : "light";
    onColorModeChange?.(next);
  }

  const brand = (
    <a
      className="st-appChrome__brand"
      href={brandHref}
      aria-label={brandLabel ?? ([brandName, productName].filter(Boolean).join(" ") || undefined)}
    >
      {logoSrc ? <img className="st-appChrome__brandMark" src={logoSrc} alt={logoAlt} aria-hidden={logoAlt ? undefined : true} /> : null}
      {brandName || productName ? (
        <span className="st-appChrome__brandCopy">
          {brandName ? <span className="st-appChrome__brandName">{brandName}</span> : null}
          {productName ? <span className="st-appChrome__brandProduct">{productName}</span> : null}
        </span>
      ) : null}
    </a>
  );

  const navContent = nav.map((item) => (
    <a
      key={item.href}
      className="st-appChrome__navLink st-appHeader__navLink"
      href={item.href}
      aria-current={item.active ? "page" : undefined}
    >
      {item.label}
    </a>
  ));

  const utilityNav = (
    <div className="st-appChrome__utilityNav">
      {showThemeSelector ? (
        <div className="st-appChrome__themeWrap st-appChrome__menuWrap">
          <button
            type="button"
            className="st-appChrome__control st-appHeader__control"
            onClick={() => setThemeOpen((v) => !v)}
            aria-expanded={isThemeOpen}
            aria-haspopup="true"
            aria-label={themeLabel}
          >
            <PaletteIcon />
            <span>{activeTheme?.label}</span>
            <ChevronDownIcon className={classNames("st-appChrome__chevron", isThemeOpen ? "is-rotated" : undefined)} />
          </button>
          {isThemeOpen ? (
            <div className="st-appChrome__menu" role="menu">
              {themes.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={classNames("st-appChrome__menuItem", theme === option.id ? "is-active" : undefined)}
                  role="menuitem"
                  onClick={() => {
                    onThemeChange?.(option.id);
                    setThemeOpen(false);
                  }}
                >
                  <span className="st-appChrome__check" aria-hidden="true">{theme === option.id ? "✓" : ""}</span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {showColorMode ? (
        <button
          type="button"
          className="st-appChrome__control st-appChrome__iconControl st-appHeader__control"
          onClick={cycleColorMode}
          aria-label={colorModeAriaLabel}
        >
          {colorMode === "dark" ? <MoonIcon /> : colorMode === "light" ? <SunIcon /> : <SunIcon strokeWidth={1.5} style={{ opacity: 0.65 }} />}
        </button>
      ) : null}

      {showLocaleSelector ? (
        <div className="st-appChrome__localeWrap st-appChrome__menuWrap">
          <button
            type="button"
            className="st-appChrome__control st-appHeader__control"
            onClick={() => setLocaleOpen((v) => !v)}
            aria-expanded={isLocaleOpen}
            aria-haspopup="true"
            aria-label={localeLabel}
          >
            <GlobeIcon />
            <span>{locale?.toUpperCase()}</span>
            <ChevronDownIcon className={classNames("st-appChrome__chevron", isLocaleOpen ? "is-rotated" : undefined)} />
          </button>
          {isLocaleOpen ? (
            <div className="st-appChrome__menu" role="menu">
              {(["fr", "en"] as AppChromeLocale[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  className={classNames("st-appChrome__menuItem", locale === value ? "is-active" : undefined)}
                  role="menuitem"
                  onClick={() => {
                    onLocaleChange?.(value);
                    setLocaleOpen(false);
                  }}
                >
                  <span className="st-appChrome__check" aria-hidden="true">{locale === value ? "✓" : ""}</span>
                  <span>{value === "fr" ? "Français" : "English"}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {showGithub ? (
        <a
          className="st-appChrome__control st-appChrome__iconControl st-appHeader__control"
          href={githubHref}
          rel="noreferrer"
          target="_blank"
          aria-label={githubLabel}
        >
          <GithubIcon />
        </a>
      ) : null}

      {identity ? <div className="st-appChrome__identity">{identity}</div> : null}
    </div>
  );

  const actions = (
    <>
      {utilityNav}
      <button
        type="button"
        className="st-appChrome__burgerTrigger"
        onClick={onMobileMenuToggle}
        aria-expanded={mobileMenuOpen}
        aria-controls={drawerId}
        aria-label={menuLabel}
      >
        <BoxesIcon />
      </button>
    </>
  );

  return (
    <div className={classNames("st-appChrome", className)} ref={rootRef}>
      <AppHeader className="st-appChrome__header" brandHref={brandHref} brandLabel={brandLabel} logo={brand} nav={navContent} actions={actions} />

      {mobileMenuOpen ? (
        <nav id={drawerId} className="st-appChrome__drawer" aria-label={navLabel}>
          <div className="st-appChrome__drawerSection">
            {nav.map((item) => (
              <a
                key={item.href}
                className="st-appChrome__drawerLink"
                href={item.href}
                aria-current={item.active ? "page" : undefined}
                onClick={() => onMobileMenuToggle?.()}
              >
                {item.label}
              </a>
            ))}
          </div>

          {showThemeSelector ? (
            <div className="st-appChrome__drawerSection">
              <span className="st-appChrome__drawerLabel">{themeLabel}</span>
              <div className="st-appChrome__drawerSwitcher">
                {themes.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={classNames("st-appChrome__drawerBtn", theme === option.id ? "is-active" : undefined)}
                    onClick={() => {
                      onThemeChange?.(option.id);
                      onMobileMenuToggle?.();
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {showColorMode ? (
            <div className="st-appChrome__drawerSection">
              <span className="st-appChrome__drawerLabel">{colorModeLabels.light} / {colorModeLabels.dark}</span>
              <div className="st-appChrome__drawerSwitcher">
                {(["light", "dark", "auto"] as AppChromeColorMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    className={classNames("st-appChrome__drawerBtn", colorMode === mode ? "is-active" : undefined)}
                    onClick={() => onColorModeChange?.(mode)}
                  >
                    {mode === "light" ? colorModeLabels.light : mode === "dark" ? colorModeLabels.dark : colorModeLabels.auto}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {showLocaleSelector ? (
            <div className="st-appChrome__drawerSection">
              <span className="st-appChrome__drawerLabel">{localeLabel}</span>
              <div className="st-appChrome__drawerSwitcher">
                {(["fr", "en"] as AppChromeLocale[]).map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={classNames("st-appChrome__drawerBtn", locale === value ? "is-active" : undefined)}
                    onClick={() => {
                      onLocaleChange?.(value);
                      onMobileMenuToggle?.();
                    }}
                  >
                    {value === "fr" ? "Français" : "English"}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {showGithub || identity ? (
            <div className="st-appChrome__drawerSection">
              {showGithub ? (
                <a className="st-appChrome__drawerLink" href={githubHref} rel="noreferrer" target="_blank">
                  {githubLabel}
                </a>
              ) : null}
              {identity ? <div className="st-appChrome__identity">{identity}</div> : null}
            </div>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}
