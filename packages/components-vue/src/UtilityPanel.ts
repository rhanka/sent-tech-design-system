import { defineComponent, h, type PropType } from "vue";
import { classNames } from "./classNames.js";

export type UtilityPanelMode = "reserve" | "overlay" | "floating";
export type UtilityPanelSide = "left" | "right" | "bottom";

export type UtilityPanelProps = {
  mode?: UtilityPanelMode;
  side?: UtilityPanelSide;
  title?: string;
  label?: string;
  collapsed?: boolean;
  class?: string;
};

export const UtilityPanel = defineComponent({
  name: "UtilityPanel",
  props: {
    mode: { type: String as PropType<UtilityPanelMode>, default: "reserve" },
    side: { type: String as PropType<UtilityPanelSide>, default: "right" },
    title: { type: String, default: undefined },
    label: { type: String, default: undefined },
    collapsed: { type: Boolean, default: false },
    class: { type: String, default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () => h("aside", { ...attrs, class: classNames("st-utilityPanel", `st-utilityPanel--${props.mode}`, `st-utilityPanel--${props.side}`, props.collapsed && "st-utilityPanel--collapsed", props.class), "aria-label": props.label ?? props.title ?? "Utility panel", "data-mode": props.mode, "data-side": props.side }, [
      slots.header || props.title ? h("header", { class: "st-utilityPanel__header" }, slots.header?.() ?? h("h2", { class: "st-utilityPanel__title" }, props.title)) : null,
      !props.collapsed ? h("div", { class: "st-utilityPanel__body" }, slots.default?.()) : null,
      !props.collapsed && slots.footer ? h("footer", { class: "st-utilityPanel__footer" }, slots.footer()) : null,
    ]);
  },
});
