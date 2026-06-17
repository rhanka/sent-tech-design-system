import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type ContextPanelProps = {
  title?: string;
  subtitle?: string;
  label?: string;
  class?: string;
};

export const ContextPanel = defineComponent({
  name: "ContextPanel",
  props: {
    title: { type: String, default: undefined },
    subtitle: { type: String, default: undefined },
    label: { type: String, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () => h("aside", { ...attrs, class: classNames("st-contextPanel", props.class), "aria-label": props.label ?? props.title ?? "Context panel" }, [
      props.title || props.subtitle || slots.actions ? h("header", { class: "st-contextPanel__header" }, [h("div", { class: "st-contextPanel__heading" }, [props.title ? h("h2", { class: "st-contextPanel__title" }, props.title) : null, props.subtitle ? h("p", { class: "st-contextPanel__subtitle" }, props.subtitle) : null]), slots.actions ? h("div", { class: "st-contextPanel__actions" }, slots.actions()) : null]) : null,
      h("div", { class: "st-contextPanel__body" }, slots.default?.()),
      slots.footer ? h("footer", { class: "st-contextPanel__footer" }, slots.footer()) : null,
    ]);
  },
});
