import { defineComponent, h, onBeforeUnmount, ref, watch } from "vue";
import { classNames } from "./classNames.js";

export type IdentityUser = {
  displayName: string;
  email?: string;
  id?: string;
};

export type IdentityMenuProps = {
  user?: IdentityUser | null;
  isAuthenticated?: boolean;
  devicesHref?: string;
  settingsHref?: string;
  loginLabel?: string;
  devicesLabel?: string;
  settingsLabel?: string;
  logoutLabel?: string;
  variant?: "dropdown" | "accordion";
  class?: string;
};

/** Première lettre du displayName, en majuscule (calque de la source). */
export function identityInitial(user: IdentityUser | null | undefined): string {
  const source = user?.displayName || user?.email || "U";
  return source.charAt(0).toUpperCase();
}

function ChevronDownIcon(open: boolean) {
  return h(
    "svg",
    {
      width: 16,
      height: 16,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": 2,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
      focusable: "false",
      class: classNames(
        "st-identityMenu__chevron",
        open && "st-identityMenu__chevron--open",
      ),
    },
    [h("path", { d: "m6 9 6 6 6-6" })],
  );
}

export const IdentityMenu = defineComponent({
  name: "IdentityMenu",
  props: {
    user: { type: Object as () => IdentityUser | null, default: null },
    isAuthenticated: { type: Boolean, default: false },
    devicesHref: { type: String, default: "#" },
    settingsHref: { type: String, default: "#" },
    loginLabel: { type: String, default: "Se connecter" },
    devicesLabel: { type: String, default: "Appareils" },
    settingsLabel: { type: String, default: "Paramètres" },
    logoutLabel: { type: String, default: "Se déconnecter" },
    variant: { type: String as () => "dropdown" | "accordion", default: "dropdown" },
    class: { type: String, default: undefined },
  },
  emits: ["login", "logout"],
  setup(props, { emit }) {
    const open = ref(false);
    const rootEl = ref<HTMLElement | null>(null);
    const triggerEl = ref<HTMLButtonElement | null>(null);

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (open.value && rootEl.value && target && !rootEl.value.contains(target)) {
        open.value = false;
      }
    };

    watch(open, (value) => {
      if (value) {
        document.addEventListener("pointerdown", onPointerDown);
      } else {
        document.removeEventListener("pointerdown", onPointerDown);
      }
    });
    onBeforeUnmount(() => document.removeEventListener("pointerdown", onPointerDown));

    const getItems = () =>
      Array.from(
        rootEl.value?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
      );
    const focusItem = (index: number) => {
      const items = getItems();
      if (!items.length) return;
      const len = items.length;
      items[((index % len) + len) % len]?.focus();
    };
    const closeAndFocusTrigger = () => {
      open.value = false;
      triggerEl.value?.focus();
    };

    const onTriggerKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open.value = true;
        queueMicrotask(() => focusItem(0));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        open.value = true;
        queueMicrotask(() => focusItem(-1));
      }
    };
    const onMenuKeyDown = (event: KeyboardEvent) => {
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
      } else if (event.key === "Escape") {
        event.preventDefault();
        closeAndFocusTrigger();
      }
    };

    return () => {
      const user = props.user;
      if (!(props.isAuthenticated && user)) {
        return h(
          "button",
          {
            type: "button",
            class: classNames(
              "st-identityMenu__login",
              props.variant === "accordion" && "st-identityMenu__login--accordion",
              props.class,
            ),
            onClick: () => emit("login"),
          },
          props.loginLabel,
        );
      }

      const displayName = user.displayName || user.email || "User";

      return h(
        "div",
        {
          ref: rootEl,
          class: classNames(
            "st-identityMenu",
            props.variant === "accordion" && "st-identityMenu--accordion",
            props.class,
          ),
        },
        [
          h(
            "button",
            {
              type: "button",
              ref: triggerEl,
              class: "st-identityMenu__trigger",
              "aria-haspopup": "menu",
              "aria-expanded": open.value ? "true" : "false",
              "aria-label": `Compte de ${displayName}`,
              onClick: () => (open.value = !open.value),
              onKeydown: onTriggerKeyDown,
            },
            [
              h(
                "span",
                { class: "st-identityMenu__avatar", "aria-hidden": "true" },
                identityInitial(user),
              ),
              h("span", { class: "st-identityMenu__meta" }, [
                h("span", { class: "st-identityMenu__name" }, displayName),
                props.variant === "accordion" && user.email
                  ? h("span", { class: "st-identityMenu__email" }, user.email)
                  : null,
              ]),
              ChevronDownIcon(open.value),
            ],
          ),
          open.value
            ? h(
                "div",
                {
                  class: "st-identityMenu__menu",
                  role: "menu",
                  tabindex: "-1",
                  "aria-label": `Menu de ${displayName}`,
                  onKeydown: onMenuKeyDown,
                },
                [
                  h(
                    "a",
                    {
                      href: props.devicesHref,
                      class: "st-identityMenu__item",
                      role: "menuitem",
                      tabindex: "-1",
                      onClick: () => (open.value = false),
                    },
                    props.devicesLabel,
                  ),
                  h(
                    "a",
                    {
                      href: props.settingsHref,
                      class: "st-identityMenu__item",
                      role: "menuitem",
                      tabindex: "-1",
                      onClick: () => (open.value = false),
                    },
                    props.settingsLabel,
                  ),
                  h("div", {
                    class: "st-identityMenu__divider",
                    role: "separator",
                    "aria-hidden": "true",
                  }),
                  h(
                    "button",
                    {
                      type: "button",
                      class: "st-identityMenu__item st-identityMenu__item--danger",
                      role: "menuitem",
                      tabindex: "-1",
                      onClick: () => {
                        open.value = false;
                        emit("logout");
                      },
                    },
                    props.logoutLabel,
                  ),
                ],
              )
            : null,
        ],
      );
    };
  },
});
