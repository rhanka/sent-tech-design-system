import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

// Compteur module pour générer un id de tiroir stable, déterministe et
// SSR-safe (pas de crypto). Aligné sur le pattern des 3 fw.
let appHeaderIdCounter = 0;

export type AppHeaderProps = {
  compact?: boolean;
  menuOpen?: boolean;
  menuLabel?: string;
  /**
   * Id du tiroir, partagé entre `aria-controls` (burger) et `id` (drawer).
   * Auto-généré et stable si non fourni.
   */
  drawerId?: string;
  class?: string;
};

// Icônes lucide reproduites en SVG inline (mêmes paths que @lucide/svelte) pour
// conserver une parité stricte sans dépendance lucide-vue-next.
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
      class: "st-appHeader__burgerIcon",
    },
    [
      h("path", { d: "M4 5h16" }),
      h("path", { d: "M4 12h16" }),
      h("path", { d: "M4 19h16" }),
    ],
  );
}

function XIcon() {
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
      class: "st-appHeader__burgerIcon",
    },
    [h("path", { d: "M18 6 6 18" }), h("path", { d: "m6 6 12 12" })],
  );
}

export const AppHeader = defineComponent({
  name: "AppHeader",
  props: {
    compact: { type: Boolean, default: false },
    menuOpen: { type: Boolean, default: false },
    menuLabel: { type: String, default: "Menu" },
    drawerId: { type: String, default: undefined },
    class: { type: String, default: undefined },
  },
  emits: ["menuToggle"],
  setup(props, { slots, emit }) {
    const onToggle = () => emit("menuToggle");
    // Id stable du tiroir : prop fournie sinon compteur module (SSR-safe).
    const resolvedDrawerId = props.drawerId ?? `st-appHeader-drawer-${++appHeaderIdCounter}`;
    return () => {
      const bar = h("div", { class: "st-appHeader__bar" }, [
        props.compact
          ? h("div", { class: "st-appHeader__burger" }, [
              h(
                "button",
                {
                  type: "button",
                  class: "st-appHeader__burgerButton",
                  "aria-label": props.menuLabel,
                  "aria-expanded": props.menuOpen ? "true" : "false",
                  "aria-controls": resolvedDrawerId,
                  "aria-haspopup": "menu",
                  onClick: onToggle,
                },
                [props.menuOpen ? XIcon() : MenuIcon()],
              ),
            ])
          : h(
              "nav",
              { class: "st-appHeader__nav", "aria-label": "Primary" },
              slots.nav?.(),
            ),
        slots.logo
          ? h("div", { class: "st-appHeader__logo" }, slots.logo())
          : null,
        !props.compact
          ? h("div", { class: "st-appHeader__actions" }, slots.actions?.())
          : null,
      ]);

      const header = h(
        "header",
        { class: classNames("st-appHeader", props.class) },
        [bar],
      );

      if (props.compact && props.menuOpen && slots.drawer) {
        return [
          header,
          h("button", {
            type: "button",
            class: "st-appHeader__scrim",
            "aria-label": props.menuLabel,
            onClick: onToggle,
          }),
          h("aside", { id: resolvedDrawerId, class: "st-appHeader__drawer" }, slots.drawer()),
        ];
      }

      return header;
    };
  },
});
