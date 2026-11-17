import { Ellipsis } from "lucide-preact";
import type { HTMLAttributes } from "preact";
import { useCallback, useEffect, useMemo, useRef } from "preact/hooks";
import { classNames } from "./classNames.js";
import { text, useControlled } from "./internal.js";
import { Menu, treeHasCascade, type MenuActionItem, type MenuItem, type MenuSubmenuSide } from "./Menu.js";
import { menuPopoverIsWithin } from "./MenuPopover.js";
import { MenuHostContext, type MenuHostCloseOptions, type MenuHostContextValue } from "./menu-cascade.js";
import type { ComponentChildren } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export type OverflowMenuItem = MenuItem;

export type OverflowMenuProps = Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> & {
  items: OverflowMenuItem[];
  label?: ComponentChildren;
  /** Plain value, or a signal in the Preact build (read at the edge). */
  open?: MaybeSignal<boolean>;
  dense?: MaybeSignal<boolean>;
  placement?: "top-start" | "top-end" | "bottom-start" | "bottom-end";
  /** Leaf relay (host relay, §2.3): first argument unchanged, `path`
   * second; flat menus call with a single argument. */
  onSelect?: (item: MenuActionItem, path?: string[]) => void;
  /** Forwarded to the inner `Menu`. */
  submenuSide?: MenuSubmenuSide;
  onOpenChange?: (open: boolean) => void;
};

let overflowMenuInstanceCounter = 0;

export function OverflowMenu({
  items,
  label = "More",
  open: openInput,
  onOpenChange,
  dense: denseInput = false,
  placement = "bottom-start",
  onSelect,
  submenuSide,
  className,
  ...rest
}: OverflowMenuProps) {
  const [open, setOpen] = useControlled(useValue(openInput), false, onOpenChange);
  const dense = useValue(denseInput);
  const rootMenuIdRef = useRef("");
  if (rootMenuIdRef.current === "") {
    overflowMenuInstanceCounter += 1;
    rootMenuIdRef.current = `st-overflowmenu-${overflowMenuInstanceCounter}`;
  }
  const rootMenuId = rootMenuIdRef.current;
  const hostRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const pendingFocusRef = useRef(false);
  const cascade = treeHasCascade(items);

  const requestClose = useCallback(
    (options: MenuHostCloseOptions) => {
      setOpen(false);
      if (options.focusTrigger) triggerRef.current?.focus();
    },
    [setOpen],
  );

  const hostContext = useMemo<MenuHostContextValue>(
    () => ({ rootMenuId, requestClose }),
    [rootMenuId, requestClose],
  );

  function focusFirstMenuItem() {
    hostRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]:not(:disabled)')?.focus();
  }

  function openAndFocus() {
    pendingFocusRef.current = true;
    setOpen(true);
  }

  useEffect(() => {
    if (open && pendingFocusRef.current) {
      pendingFocusRef.current = false;
      focusFirstMenuItem();
    }
  }, [open]);

  function handleMenuSelect(item: MenuActionItem, path?: string[]) {
    // Menu invokes the leaf callback before relaying selection.
    if (cascade) onSelect?.(item, path);
    else onSelect?.(item);
    // The cascade Menu owns closing and modality-specific focus return.
    if (!cascade) setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      // A nested menu level already consumed this event (D4).
      if (event.defaultPrevented) return;
      if (!hostRef.current) return;
      if (menuPopoverIsWithin(event, hostRef.current)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      // A nested menu level already consumed this key (D4).
      if (event.defaultPrevented) return;
      if (event.key === "Escape") {
        event.preventDefault();
        // Keyboard closes return focus to the trigger for cascade menus
        // only; flat menus keep their previous behaviour (§3.6, AC-01).
        requestClose({ focusTrigger: cascade });
      }
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, items, requestClose, setOpen]);

  return (
    <div {...rest} ref={hostRef} className={classNames("st-overflowMenu", dense && "st-overflowMenu--dense", className)}>
      <button
        type="button"
        ref={triggerRef}
        className="st-overflowMenu__trigger"
        aria-haspopup="menu"
        aria-expanded={open ? "true" : "false"}
        aria-controls={open ? rootMenuId : undefined}
        aria-label={text(label)}
        onClick={() => {
          if (open) setOpen(false);
          else if (cascade) openAndFocus();
          else setOpen(true);
        }}
        onKeyDown={(event) => {
          if (!cascade || !["ArrowDown", "Enter", " "].includes(event.key)) return;
          event.preventDefault();
          if (open) focusFirstMenuItem();
          else openAndFocus();
        }}
      >
        <Ellipsis size={18} strokeWidth={2.25} aria-hidden="true" />
      </button>
      {open ? (
        <div
          className={classNames(
            "st-overflowMenu__list",
            `st-overflowMenu__list--${placement}`,
            cascade && "st-overflowMenu__list--cascade",
          )}
        >
          <MenuHostContext.Provider value={hostContext}>
            <Menu items={items} aria-label={text(label)} onSelect={handleMenuSelect} submenuSide={submenuSide} />
          </MenuHostContext.Provider>
        </div>
      ) : null}
    </div>
  );
}
