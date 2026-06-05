import { defineComponent, h, ref } from "vue";
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

function ChevronDownIcon() {
  return h(
    "svg",
    {
      width: 18,
      height: 18,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": 2.25,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      focusable: "false",
      "aria-hidden": "true",
    },
    [h("path", { d: "m6 9 6 6 6-6" })],
  );
}

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
            h(
              "span",
              { class: "st-collapsible__icon", "aria-hidden": "true" },
              [ChevronDownIcon()],
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
