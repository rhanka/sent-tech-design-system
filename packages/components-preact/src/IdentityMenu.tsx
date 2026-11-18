import { useCallback, useEffect, useRef } from "preact/hooks";
import { classNames } from "./classNames.js";
import { useControlled } from "./internal.js";
// Side-effect: installs the options.vnode SVG presentation-attribute
// normalisation in runtime.ts. The trigger chevron renders an intrinsic
// `<svg>`; without this import a bundler applying `sideEffects` barrel
// optimisation (or a direct deep import) would never evaluate runtime.js and
// camelCase attributes would revert to broken literals.
import "./runtime.js";
import type { ComponentChildren, TargetedKeyboardEvent } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

function ChevronDownIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className={className}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export type IdentityUser = { displayName: string; email?: string; id?: string };
export type IdentityMenuProps = {
  user?: IdentityUser | null;
  isAuthenticated?: boolean;
  /**
   * État ouvert du dropdown (optionnellement contrôlé). Si fourni, le parent
   * contrôle ; sinon le composant gère un état interne. Aligné sur les 3 fw.
   */
  open?: MaybeSignal<boolean>;
  /** Notifié à chaque demande de changement d'état ouvert (contrôlé/non-contrôlé). */
  onOpenChange?: (open: boolean) => void;
  onLogin?: () => void;
  onLogout?: () => void;
  devicesHref?: string;
  settingsHref?: string;
  loginLabel?: ComponentChildren;
  devicesLabel?: ComponentChildren;
  settingsLabel?: ComponentChildren;
  logoutLabel?: ComponentChildren;
  variant?: "dropdown" | "accordion";
  /** A signal is accepted in the Preact build; the React emission keeps `string`. */
  className?: MaybeSignal<string>;
};
export function identityInitial(user: IdentityUser | null | undefined): string {
  const source = user?.displayName || user?.email || "U";
  return source.charAt(0).toUpperCase();
}
export function IdentityMenu({ user = null, isAuthenticated = false, open: openInput, onOpenChange, onLogin, onLogout, devicesHref = "#", settingsHref = "#", loginLabel = "Se connecter", devicesLabel = "Appareils", settingsLabel = "Paramètres", logoutLabel = "Se déconnecter", variant = "dropdown", className }: IdentityMenuProps) {
  // Pattern contrôlé/non-contrôlé, IDENTIQUE aux 3 fw : si `open` est fourni en
  // prop, le parent contrôle ; sinon un état interne prend le relais. onOpenChange
  // est toujours notifié.
  const [open, setOpen] = useControlled(useValue(openInput), false, onOpenChange);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  // Quel item focuser à la prochaine ouverture : "first" (défaut) ou "last".
  const pendingFocusRef = useRef<"first" | "last">("first");

  const getItems = () => Array.from(rootRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
  const focusItem = useCallback((index: number) => {
    const items = Array.from(rootRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    if (!items.length) return;
    const len = items.length;
    items[((index % len) + len) % len]?.focus();
  }, []);

  // Clic extérieur : ferme ET restaure le focus sur le trigger. (Client-only :
  // useEffect ne s'exécute jamais en SSR.)
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (rootRef.current && target && !rootRef.current.contains(target)) {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, setOpen]);

  // À l'ouverture : focus le 1er item (ou le dernier sur ArrowUp). Client-only.
  useEffect(() => {
    if (!open) return;
    const which = pendingFocusRef.current;
    queueMicrotask(() => focusItem(which === "last" ? -1 : 0));
    pendingFocusRef.current = "first";
  }, [open, focusItem]);

  if (!(isAuthenticated && user)) {
    return (
      <button type="button" className={classNames("st-identityMenu__login", variant === "accordion" && "st-identityMenu__login--accordion", className)} onClick={() => onLogin?.()}>
        {loginLabel}
      </button>
    );
  }

  const displayName = user.displayName || user.email || "User";
  const closeAndFocusTrigger = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };
  const onTriggerKeyDown = (event: TargetedKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      pendingFocusRef.current = "first";
      if (open) queueMicrotask(() => focusItem(0));
      else setOpen(true);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      pendingFocusRef.current = "last";
      if (open) queueMicrotask(() => focusItem(-1));
      else setOpen(true);
    } else if (event.key === "Escape" && open) {
      // Esc ferme aussi depuis le trigger (global au composant ouvert).
      event.preventDefault();
      closeAndFocusTrigger();
    }
  };
  const onMenuKeyDown = (event: TargetedKeyboardEvent<HTMLDivElement>) => {
    const items = getItems();
    const current = items.indexOf(document.activeElement as HTMLElement);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusItem(current + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusItem(current - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusItem(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusItem(items.length - 1);
    } else if (event.key === "Tab") {
      // Piège de focus : Tab/Shift+Tab bouclent DANS le menu.
      if (!items.length) return;
      event.preventDefault();
      focusItem(current + (event.shiftKey ? -1 : 1));
    } else if (event.key === "Escape") {
      event.preventDefault();
      closeAndFocusTrigger();
    }
  };
  // Enter/Space activent l'item courant. Sur un <a>, on suit le href via un clic
  // natif (preventDefault sur Space pour éviter le scroll).
  const onItemKeyDown = (event: TargetedKeyboardEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      (event.currentTarget as HTMLElement).click();
    }
  };
  const selectAndClose = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div ref={rootRef} className={classNames("st-identityMenu", variant === "accordion" && "st-identityMenu--accordion", className)}>
      <button
        type="button"
        ref={triggerRef}
        className="st-identityMenu__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Compte de ${displayName}`}
        onClick={() => setOpen(!open)}
        onKeyDown={onTriggerKeyDown}
      >
        <span className="st-identityMenu__avatar" aria-hidden="true">{identityInitial(user)}</span>
        <span className="st-identityMenu__meta">
          <span className="st-identityMenu__name">{displayName}</span>
          {variant === "accordion" && user.email ? <span className="st-identityMenu__email">{user.email}</span> : null}
        </span>
        <ChevronDownIcon className={classNames("st-identityMenu__chevron", open && "st-identityMenu__chevron--open")} />
      </button>
      {open ? (
        <div className="st-identityMenu__menu" role="menu" tabIndex={-1} aria-label={`Menu de ${displayName}`} onKeyDown={onMenuKeyDown}>
          <a href={devicesHref} className="st-identityMenu__item" role="menuitem" tabIndex={-1} onClick={selectAndClose} onKeyDown={onItemKeyDown}>
            {devicesLabel}
          </a>
          <a href={settingsHref} className="st-identityMenu__item" role="menuitem" tabIndex={-1} onClick={selectAndClose} onKeyDown={onItemKeyDown}>
            {settingsLabel}
          </a>
          <div className="st-identityMenu__divider" role="separator" aria-hidden="true" />
          <button type="button" className="st-identityMenu__item st-identityMenu__item--danger" role="menuitem" tabIndex={-1} onClick={() => { setOpen(false); triggerRef.current?.focus(); onLogout?.(); }}>
            {logoutLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}
