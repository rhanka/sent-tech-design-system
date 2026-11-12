import { defineComponent, h, nextTick, onUnmounted, provide, ref, watch } from "vue";
import { Ellipsis } from "lucide-vue-next";
import { classNames } from "./classNames.js";
import { Menu } from "./Menu.js";
import type { MenuActionItem, MenuItem } from "./Menu.js";
import { MENU_HOST_KEY, type SubMenuSide } from "./menu-cascade.js";

export type OverflowMenuPlacement = "top-start" | "top-end" | "bottom-start" | "bottom-end";
export type OverflowMenuSubmenuSide = SubMenuSide;

export type OverflowMenuProps = {
  items: MenuItem[];
  label?: string;
  open?: boolean;
  dense?: boolean;
  placement?: OverflowMenuPlacement;
  class?: string;
  submenuSide?: SubMenuSide;
};

export type { MenuItem as OverflowMenuItem };

let overflowMenuInstanceCounter = 0;

function treeHasCascade(list: MenuItem[]): boolean {
  for (const item of list) {
    const tagged = item as { type?: string; kind?: string; children?: MenuItem[]; items?: MenuItem[] };
    const kind = tagged.type ?? tagged.kind;
    if (Array.isArray(tagged.children) && tagged.children.length > 0) return true;
    if (Array.isArray(tagged.children) && treeHasCascade(tagged.children)) return true;
    if (kind === "group" && Array.isArray(tagged.items) && treeHasCascade(tagged.items)) return true;
  }
  return false;
}

export const OverflowMenu = defineComponent({
  name: "OverflowMenu",
  props: {
    items: { type: Array as () => MenuItem[], required: true },
    label: { type: String, default: "More" },
    open: { type: Boolean, default: undefined },
    dense: { type: Boolean, default: false },
    placement: { type: String as () => OverflowMenuPlacement, default: "bottom-start" },
    class: { type: String, default: undefined },
    submenuSide: { type: String as () => SubMenuSide, default: "auto" },
  },
  emits: ["update:open", "select"],
  setup(props, { emit, attrs }) {
    const rootMenuId = `st-overflowmenu-${++overflowMenuInstanceCounter}`;
    const localOpen = ref(false);
    const hostRef = ref<HTMLElement | null>(null);
    const triggerRef = ref<HTMLElement | null>(null);

    const isOpen = () => (props.open !== undefined ? props.open : localOpen.value);

    const setOpen = (val: boolean) => {
      if (props.open === undefined) localOpen.value = val;
      emit("update:open", val);
    };

    function requestClose(options: { focusTrigger: boolean }) {
      setOpen(false);
      if (options.focusTrigger) {
        triggerRef.value?.focus();
      }
    }

    provide(MENU_HOST_KEY, {
      rootMenuId,
      requestClose,
    });

    function handleMenuSelect(item: MenuActionItem, path?: string[]) {
      // Relay: first argument unchanged, path second for cascade leaves.
      // Flat menus keep the legacy single-argument call (AC-01).
      if (path !== undefined) {
        emit("select", item, path);
      } else {
        emit("select", item);
      }
      // Hosts close fully after a leaf (never on a parent: parents never
      // reach here because the Menu opens the sub-menu instead).
      setOpen(false);
    }

    function onTriggerKeyDown(event: KeyboardEvent) {
      if (!["ArrowDown", "Enter", " "].includes(event.key)) return;
      event.preventDefault();
      if (isOpen()) {
        focusFirst();
      } else {
        setOpen(true);
        void nextTick().then(() => focusFirst());
      }
    }

    function focusFirst() {
      const host = hostRef.value;
      const first = host?.querySelector<HTMLButtonElement>(
        '[role="menuitem"]:not(:disabled)',
      );
      first?.focus();
    }

    // Shadow-safe outside close (composedPath, §3.6): panels are inside the
    // host element so they are never "outside". The previous `mousedown` +
    // `host.contains` check is replaced.
    const onPointerDown = (event: PointerEvent) => {
      if (hostRef.value && !document.body.contains(hostRef.value)) return;
      if (event.defaultPrevented) return;
      if (!isOpen()) return;
      const composed = event as PointerEvent & { composedPath?: () => EventTarget[] };
      const path = typeof composed.composedPath === "function" ? composed.composedPath() : [];
      const target = event.target as Node | null;
      const host = hostRef.value;
      const inside =
        host !== undefined &&
        host !== null &&
        (path.length > 0 ? path.includes(host) : Boolean(target && host.contains(target)));
      if (!inside) setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (hostRef.value && !document.body.contains(hostRef.value)) return;
      // A nested menu level already consumed this key (D4).
      if (event.defaultPrevented) return;
      if (event.key === "Escape" && isOpen()) {
        event.preventDefault();
        // Keyboard closes return focus to the trigger for cascade menus
        // only; flat menus keep their previous behaviour (§3.6, AC-01).
        requestClose({ focusTrigger: treeHasCascade(props.items) });
      }
    };

    watch(
      () => isOpen(),
      (open) => {
        if (open) {
          window.addEventListener("pointerdown", onPointerDown);
          window.addEventListener("keydown", onKeyDown);
        } else {
          window.removeEventListener("pointerdown", onPointerDown);
          window.removeEventListener("keydown", onKeyDown);
        }
      },
      { immediate: true },
    );

    onUnmounted(() => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    });

    return () => {
      const open = isOpen();

      return h(
        "div",
        {
          ...attrs,
          ref: hostRef,
          class: classNames(
            "st-overflowMenu",
            props.dense && "st-overflowMenu--dense",
            props.class,
          ),
        },
        [
          h(
            "button",
            {
              ref: triggerRef,
              type: "button",
              class: "st-overflowMenu__trigger",
              "aria-haspopup": "menu",
              "aria-expanded": open ? "true" : "false",
              "aria-controls": open ? rootMenuId : undefined,
              "aria-label": props.label,
              onClick: () => setOpen(!open),
              onKeydown: onTriggerKeyDown,
            },
            [h(Ellipsis, { size: 18, strokeWidth: 2.25, "aria-hidden": "true" })],
          ),
          open
            ? h(
                "div",
                {
                  class: classNames(
                    "st-overflowMenu__list",
                    `st-overflowMenu__list--${props.placement}`,
                  ),
                },
                h(Menu, {
                  items: props.items,
                  dense: props.dense,
                  submenuSide: props.submenuSide,
                  onSelect: handleMenuSelect,
                }),
              )
            : null,
        ],
      );
    };
  },
});
