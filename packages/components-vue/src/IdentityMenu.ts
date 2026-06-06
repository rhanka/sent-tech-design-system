import { computed, defineComponent, h, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { classNames } from "./classNames.js";

export type IdentityUser = {
  displayName: string;
  email?: string;
  id?: string;
};

export type IdentityMenuProps = {
  user?: IdentityUser | null;
  isAuthenticated?: boolean;
  /**
   * État ouvert du dropdown (optionnellement contrôlé). Si fourni, le parent
   * contrôle ; sinon le composant gère un état interne. Aligné sur les 3 fw.
   */
  open?: boolean;
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
    // `default: undefined` permet de distinguer contrôlé / non-contrôlé.
    open: { type: Boolean, default: undefined },
    devicesHref: { type: String, default: "#" },
    settingsHref: { type: String, default: "#" },
    loginLabel: { type: String, default: "Se connecter" },
    devicesLabel: { type: String, default: "Appareils" },
    settingsLabel: { type: String, default: "Paramètres" },
    logoutLabel: { type: String, default: "Se déconnecter" },
    variant: { type: String as () => "dropdown" | "accordion", default: "dropdown" },
    class: { type: String, default: undefined },
  },
  // `openChange` notifie le parent (pattern contrôlé/non-contrôlé, aligné 3 fw).
  // `update:open` permet aussi un v-model:open idiomatique côté Vue.
  emits: ["login", "logout", "openChange", "update:open"],
  setup(props, { emit }) {
    // Pattern contrôlé/non-contrôlé, IDENTIQUE aux 3 fw : si `open` est fourni
    // en prop, le parent contrôle ; sinon un état interne prend le relais.
    const internalOpen = ref(false);
    const isOpen = computed(() => (props.open === undefined ? internalOpen.value : props.open));
    const setOpen = (next: boolean) => {
      if (props.open === undefined) internalOpen.value = next;
      emit("openChange", next);
      emit("update:open", next);
    };

    const rootEl = ref<HTMLElement | null>(null);
    const triggerEl = ref<HTMLButtonElement | null>(null);
    // Quel item focuser à la prochaine ouverture : "first" (défaut) ou "last".
    let pendingFocus: "first" | "last" = "first";

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (isOpen.value && rootEl.value && target && !rootEl.value.contains(target)) {
        // Clic extérieur : ferme ET restaure le focus sur le trigger.
        setOpen(false);
        triggerEl.value?.focus();
      }
    };

    watch(isOpen, (value) => {
      if (value) {
        document.addEventListener("pointerdown", onPointerDown);
        // À l'ouverture : focus le 1er item (ou le dernier sur ArrowUp).
        const which = pendingFocus;
        void nextTick(() => focusItem(which === "last" ? -1 : 0));
        pendingFocus = "first";
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
      setOpen(false);
      triggerEl.value?.focus();
    };

    const onTriggerKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        pendingFocus = "first";
        if (isOpen.value) void nextTick(() => focusItem(0));
        else setOpen(true);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        pendingFocus = "last";
        if (isOpen.value) void nextTick(() => focusItem(-1));
        else setOpen(true);
      } else if (event.key === "Escape" && isOpen.value) {
        // Esc ferme aussi depuis le trigger (global au composant ouvert).
        event.preventDefault();
        closeAndFocusTrigger();
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
    // Enter/Space activent l'item courant. Sur un <a>, on suit le href via un
    // clic natif (preventDefault sur Space pour éviter le scroll).
    const onItemKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        (event.currentTarget as HTMLElement).click();
      }
    };
    const selectAndClose = () => {
      setOpen(false);
      triggerEl.value?.focus();
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
              "aria-expanded": isOpen.value ? "true" : "false",
              "aria-label": `Compte de ${displayName}`,
              onClick: () => setOpen(!isOpen.value),
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
              ChevronDownIcon(isOpen.value),
            ],
          ),
          isOpen.value
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
                      onClick: selectAndClose,
                      onKeydown: onItemKeyDown,
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
                      onClick: selectAndClose,
                      onKeydown: onItemKeyDown,
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
                        setOpen(false);
                        triggerEl.value?.focus();
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
