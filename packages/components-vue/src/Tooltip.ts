import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";

export type TooltipPlacement = "top" | "bottom";

export type TooltipProps = {
  content: unknown;
  placement?: TooltipPlacement;
  class?: string;
};

let _tooltipCounter = 0;
function nextTooltipId(): string {
  return `st-tooltip-${++_tooltipCounter}`;
}

export const Tooltip = defineComponent({
  name: "Tooltip",
  props: {
    content: { type: [String, Object] as unknown as () => unknown, required: true },
    placement: { type: String as () => TooltipPlacement, default: "top" },
    class: { type: String, default: undefined },
  },
  setup(props, { slots, attrs }) {
    const tooltipId = ref(nextTooltipId());
    const open = ref(false);

    return () => {
      return h(
        "span",
        {
          ...attrs,
          class: classNames(
            "st-tooltip",
            `st-tooltip--${props.placement}`,
            props.class,
          ),
          onFocus: () => { open.value = true; },
          onBlur: () => { open.value = false; },
          onMouseenter: () => { open.value = true; },
          onMouseleave: () => { open.value = false; },
        },
        [
          h("span", { class: "st-tooltip__trigger" }, slots.default?.()),
          h(
            "span",
            {
              id: tooltipId.value,
              class: "st-tooltip__content",
              role: "tooltip",
              "aria-hidden": open.value ? "false" : "true",
            },
            props.content as string,
          ),
        ],
      );
    };
  },
});
