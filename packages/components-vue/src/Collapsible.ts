import { defineComponent, h, ref } from "vue";
import { ChevronDown } from "lucide-vue-next";
import { classNames } from "./classNames.js";

export type CollapsibleProps = {
  /** État ouvert (contrôlable). */
  open?: boolean;
  title: string;
  disabled?: boolean;
  onToggle?: (open: boolean) => void;
  class?: string;
};

let collapsibleCounter = 0;

export const Collapsible = defineComponent({
  name: "Collapsible",
  props: {
    open: { type: Boolean, default: undefined },
    title: { type: String, required: true },
    disabled: { type: Boolean, default: false },
    onToggle: {
      type: Function as unknown as () => (open: boolean) => void,
      default: undefined,
    },
    class: { type: String, default: undefined },
  },
  emits: ["toggle"],
  setup(props, { slots, attrs, emit }) {
    const uid = `st-collapsible-${(collapsibleCounter += 1)}`;
    const internalOpen = ref(props.open ?? false);

    return () => {
      const isControlled = props.open !== undefined;
      const open = isControlled ? props.open! : internalOpen.value;

      const classes = classNames(
        "st-collapsible",
        open && "st-collapsible--open",
        props.class,
      );

      const toggle = () => {
        if (props.disabled) return;
        const next = !open;
        if (!isControlled) internalOpen.value = next;
        props.onToggle?.(next);
        emit("toggle", next);
      };

      return h("div", { ...attrs, class: classes }, [
        h(
          "button",
          {
            type: "button",
            class: "st-collapsible__trigger",
            "aria-expanded": open ? "true" : "false",
            "aria-controls": `${uid}-region`,
            id: `${uid}-trigger`,
            disabled: props.disabled,
            onClick: toggle,
          },
          [
            h("span", { class: "st-collapsible__title" }, props.title),
            // Trailing content rendered BETWEEN the title and the chevron (e.g. a
            // count Badge). The chevron stays the rightmost affordance. If it
            // carries SR-relevant info, set `aria-label` on the Collapsible.
            slots.trailing
              ? h("span", { class: "st-collapsible__trailing" }, slots.trailing())
              : null,
            h(
              "span",
              { class: "st-collapsible__icon", "aria-hidden": "true" },
              [h(ChevronDown, { size: 18, strokeWidth: 2.25, "aria-hidden": "true" })],
            ),
          ],
        ),
        open
          ? h(
              "div",
              {
                class: "st-collapsible__region",
                role: "region",
                id: `${uid}-region`,
                "aria-labelledby": `${uid}-trigger`,
              },
              slots.default?.(),
            )
          : null,
      ]);
    };
  },
});
