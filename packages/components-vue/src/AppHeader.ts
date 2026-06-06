import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type AppHeaderProps = {
  compact?: boolean;
  menuOpen?: boolean;
  menuLabel?: string;
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
    class: { type: String, default: undefined },
  },
  emits: ["menuToggle"],
  setup(props, { slots, emit }) {
    const onToggle = () => emit("menuToggle");
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
          h("aside", { class: "st-appHeader__drawer" }, slots.drawer()),
        ];
      }

      return header;
    };
  },
});
