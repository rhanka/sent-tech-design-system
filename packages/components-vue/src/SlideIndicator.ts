import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type SlideIndicatorVariant = "dots" | "bars";
export type SlideIndicatorSize = "sm" | "md" | "lg";

// In addition to the Vue-native `@change` emit, an `onChange` callback prop
// (parity with React/Svelte) is accepted and fired on selection.
export type SlideIndicatorProps = {
  /** Nombre total de diapositives. */
  count: number;
  /** Index de la diapositive courante (0-based). */
  current?: number;
  /** Appelé avec l'index ciblé au clic ou au clavier. */
  onChange?: (index: number) => void;
  size?: SlideIndicatorSize;
  variant?: SlideIndicatorVariant;
  /** Préfixe d'étiquette accessible de chaque point ("Diapositive 1"...). */
  label?: string;
  class?: string;
};

export const SlideIndicator = defineComponent({
  name: "SlideIndicator",
  props: {
    count: { type: Number, required: true },
    current: { type: Number, default: 0 },
    onChange: {
      type: Function as unknown as () => (index: number) => void,
      default: undefined,
    },
    size: { type: String as () => SlideIndicatorSize, default: "md" },
    variant: { type: String as () => SlideIndicatorVariant, default: "dots" },
    label: { type: String, default: "Diapositive" },
    class: { type: String, default: undefined },
  },
  emits: ["change", "update:modelValue"],
  setup(props, { emit, attrs }) {
    return () => {
      const count = props.count;
      const current = props.current;
      const items = Array.from({ length: Math.max(0, count) }, (_, i) => i);

      const select = (index: number) => {
        if (index < 0 || index >= count || index === current) return;
        emit("update:modelValue", index);
        emit("change", index);
        props.onChange?.(index);
      };

      const onKeyDown = (event: KeyboardEvent, index: number) => {
        let target = index;
        switch (event.key) {
          case "ArrowRight":
          case "ArrowDown":
            target = Math.min(count - 1, index + 1);
            break;
          case "ArrowLeft":
          case "ArrowUp":
            target = Math.max(0, index - 1);
            break;
          case "Home":
            target = 0;
            break;
          case "End":
            target = count - 1;
            break;
          default:
            return;
        }
        event.preventDefault();
        select(target);
      };

      return h(
        "div",
        {
          ...attrs,
          class: classNames(
            "st-slideIndicator",
            `st-slideIndicator--${props.size}`,
            `st-slideIndicator--${props.variant}`,
            props.class,
          ),
          role: "tablist",
          "aria-label": props.label,
        },
        items.map((index) =>
          h("button", {
            key: index,
            type: "button",
            class: classNames(
              "st-slideIndicator__dot",
              index === current && "st-slideIndicator__dot--current",
            ),
            role: "tab",
            "aria-selected": index === current ? "true" : "false",
            "aria-current": index === current ? "true" : undefined,
            "aria-label": `${props.label} ${index + 1}`,
            tabindex: index === current ? 0 : -1,
            onClick: () => select(index),
            onKeydown: (event: KeyboardEvent) => onKeyDown(event, index),
          }),
        ),
      );
    };
  },
});
