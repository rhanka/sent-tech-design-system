import { defineComponent, h, type PropType } from "vue";
import { Drawer } from "./Drawer.js";
import { classNames } from "./classNames.js";

export type NavShellVariant = "rail" | "drawer";
export type NavShellSide = "left" | "right" | "bottom";

export type NavShellProps = {
  variant?: NavShellVariant;
  title?: string;
  subtitle?: string;
  back?: boolean;
  backLabel?: string;
  label?: string;
  open?: boolean;
  side?: NavShellSide;
  class?: string;
};

export const NavShell = defineComponent({
  name: "NavShell",
  props: {
    variant: { type: String as PropType<NavShellVariant>, default: "rail" },
    title: { type: String, default: undefined },
    subtitle: { type: String, default: undefined },
    back: { type: Boolean, default: false },
    backLabel: { type: String, default: "Back" },
    label: { type: String, default: undefined },
    open: { type: Boolean, default: false },
    side: { type: String as PropType<NavShellSide>, default: "left" },
    class: { type: String, default: undefined },
  },
  emits: ["back", "close"],
  setup(props, { slots, emit, attrs }) {
    const content = () => [
      props.back || props.title || props.subtitle
        ? h("header", { class: "st-navShell__header" }, [
            props.back ? h("button", { type: "button", class: "st-navShell__back", "aria-label": props.backLabel, onClick: () => emit("back") }, "←") : null,
            props.title || props.subtitle ? h("div", { class: "st-navShell__heading" }, [props.title ? h("p", { class: "st-navShell__title" }, props.title) : null, props.subtitle ? h("p", { class: "st-navShell__subtitle" }, props.subtitle) : null]) : null,
          ])
        : null,
      slots.search ? h("div", { class: "st-navShell__search" }, slots.search()) : null,
      h("div", { class: "st-navShell__body" }, slots.default?.()),
    ];
    return () => props.variant === "drawer"
      ? h(Drawer, { open: props.open, title: props.title ?? props.label ?? "Navigation", placement: props.side, class: classNames("st-navShell st-navShell--drawer", props.class), onClose: () => emit("close") }, { default: content, footer: slots.footer })
      : h("aside", { ...attrs, class: classNames("st-navShell st-navShell--rail", props.class), "aria-label": props.label ?? props.title }, [...content(), slots.footer ? h("footer", { class: "st-navShell__footer" }, slots.footer()) : null]);
  },
});
