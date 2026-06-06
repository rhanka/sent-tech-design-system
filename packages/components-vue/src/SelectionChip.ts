import { defineComponent, h } from "vue";
import type { PropType } from "vue";
import { classNames } from "./classNames.js";

export type SelectionChipTone = "neutral" | "success" | "warning" | "error" | "info";

export type SelectionChipProps = {
  /** Libellé de la dimension sélectionnée. */
  label: string;
  /** Nombre d'éléments sélectionnés — affiché "(N)" si fourni et Number.isFinite. */
  count?: number;
  tone?: SelectionChipTone;
  /** Callback effacement — affiche le bouton ✕ si fourni. */
  onClear?: () => void;
  disabled?: boolean;
  class?: string;
};

function XIcon(size: number) {
  return h(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "2.5",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
    },
    [
      h("line", { x1: 18, y1: 6, x2: 6, y2: 18 }),
      h("line", { x1: 6, y1: 6, x2: 18, y2: 18 }),
    ]
  );
}

export const SelectionChip = defineComponent({
  name: "SelectionChip",
  props: {
    label: { type: String, required: true },
    count: { type: Number, default: undefined },
    tone: { type: String as () => SelectionChipTone, default: "neutral" },
    onClear: { type: Function as PropType<() => void>, default: undefined },
    disabled: { type: Boolean, default: false },
    class: { type: String, default: undefined },
  },
  setup(props) {
    return () => {
      const { label, count, tone, onClear, disabled } = props;
      const showCount = count !== undefined && Number.isFinite(count);

      function handleClear(e: MouseEvent) {
        e.stopPropagation();
        if (disabled) return;
        onClear?.();
      }

      return h(
        "span",
        {
          class: classNames(
            "st-selectionChip",
            `st-selectionChip--${tone}`,
            disabled ? "st-selectionChip--disabled" : undefined,
            props.class
          ),
          "aria-disabled": disabled ? "true" : undefined,
        },
        [
          h("span", { class: "st-selectionChip__label" }, label),
          showCount
            ? h(
                "span",
                { class: "st-selectionChip__count", "aria-label": `(${count})` },
                `(${count})`
              )
            : null,
          onClear
            ? h(
                "button",
                {
                  type: "button",
                  class: "st-selectionChip__clear",
                  "aria-label": `Effacer ${label}`,
                  disabled: disabled,
                  onClick: handleClear,
                },
                [XIcon(11)]
              )
            : null,
        ].filter(Boolean)
      );
    };
  },
});
