import { useId } from "preact/hooks";
import { classNames } from "./classNames.js";
// Side-effect: installs the options.vnode SVG presentation-attribute
// normalisation in runtime.ts. The header renders intrinsic `<svg>` icons
// (MenuIcon, XIcon); without this import a bundler applying `sideEffects`
// barrel optimisation (or a direct deep import) would never evaluate
// runtime.js and camelCase attributes would revert to broken literals.
import "./runtime.js";
import type { ComponentChildren } from "./runtime.js";
import type { MaybeSignal } from "./signals.js";

function MenuIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className="st-appHeader__burgerIcon">
      <path d="M4 5h16" />
      <path d="M4 12h16" />
      <path d="M4 19h16" />
    </svg>
  );
}
function XIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className="st-appHeader__burgerIcon">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export type AppHeaderProps = {
  compact?: boolean;
  menuOpen?: boolean;
  onMenuToggle?: () => void;
  menuLabel?: string;
  /** aria-label for the primary nav element. */
  navLabel?: string;
  /**
   * Id du tiroir, partagé entre `aria-controls` (burger) et `id` (drawer).
   * Auto-généré et stable si non fourni.
   */
  drawerId?: string;
  /**
   * Marque structurée (décision actée : logo SENT + sous-titre). Rend le bloc
   * canonique « logo carré + nom + sous-titre produit ». Si `logo` est fourni,
   * il a priorité (contrôle total).
   */
  brandName?: string;
  /** Sous-titre produit affiché sous le nom (ex. « Design System », « dataviz »). */
  productName?: string;
  /** Source de l'image du logo carré (ex. `/SENT-logo-squared.svg`). */
  logoSrc?: string;
  /** Texte alternatif du logo (décoratif par défaut). */
  logoAlt?: string;
  /** Cible du lien de la marque. Défaut : `/`. */
  brandHref?: string;
  /** aria-label du lien de marque (sinon dérivé de `brandName` + `productName`). */
  brandLabel?: string;
  logo?: ComponentChildren;
  nav?: ComponentChildren;
  actions?: ComponentChildren;
  drawer?: ComponentChildren;
  /** A signal is accepted in the Preact build; the React emission keeps `string`. */
  className?: MaybeSignal<string>;
};
export function AppHeader({ compact = false, menuOpen = false, onMenuToggle, menuLabel = "Menu", navLabel = "Primary", drawerId, brandName, productName, logoSrc, logoAlt = "", brandHref = "/", brandLabel, logo, nav, actions, drawer, className }: AppHeaderProps) {
  // Id stable du tiroir : prop fournie sinon useId (SSR-safe, sans crypto).
  const reactId = useId();
  const resolvedDrawerId = drawerId ?? `st-appHeader-drawer-${reactId}`;
  const hasDefaultBrand = !logo && Boolean(brandName || productName || logoSrc);
  const resolvedBrandLabel = brandLabel ?? [brandName, productName].filter(Boolean).join(" ");
  return (
    <>
      <header className={classNames("st-appHeader", className)}>
        <div className="st-appHeader__bar">
          {logo ? (
            <div className="st-appHeader__logo">{logo}</div>
          ) : hasDefaultBrand ? (
            <a className="st-appHeader__brand" href={brandHref} aria-label={resolvedBrandLabel || undefined}>
              {logoSrc ? <img className="st-appHeader__brandMark" src={logoSrc} alt={logoAlt} aria-hidden={logoAlt ? undefined : true} /> : null}
              {brandName || productName ? (
                <span className="st-appHeader__brandCopy">
                  {brandName ? <span className="st-appHeader__brandName">{brandName}</span> : null}
                  {productName ? <span className="st-appHeader__brandProduct">{productName}</span> : null}
                </span>
              ) : null}
            </a>
          ) : null}
          {!compact ? (
            <>
              <nav className="st-appHeader__nav" aria-label={navLabel}>
                {nav}
              </nav>
              <div className="st-appHeader__actions">{actions}</div>
            </>
          ) : (
            <div className="st-appHeader__burger">
              <button
                type="button"
                className="st-appHeader__burgerButton"
                onClick={onMenuToggle}
                aria-label={menuLabel}
                aria-expanded={menuOpen}
                aria-controls={resolvedDrawerId}
                aria-haspopup="menu"
              >
                {menuOpen ? <XIcon /> : <MenuIcon />}
              </button>
            </div>
          )}
        </div>
      </header>
      {compact && menuOpen && drawer ? (
        <>
          <button type="button" className="st-appHeader__scrim" aria-label={menuLabel} onClick={onMenuToggle} />
          <aside id={resolvedDrawerId} className="st-appHeader__drawer">{drawer}</aside>
        </>
      ) : null}
    </>
  );
}
