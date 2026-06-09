import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export interface TileGroupItem {
  value: string;
  /** Libellé du tile (canonique Svelte). */
  label?: unknown;
  /** @deprecated Alias de `label` (compat). Utilisez `label`. */
  title?: unknown;
  description?: unknown;
  disabled?: boolean;
}

export type TileGroupProps = {
  legend?: unknown;
  items: TileGroupItem[];
  value?: string;
  disabled?: boolean;
  class?: string;
};

export const TileGroup = defineComponent({
  name: "TileGroup",
  props: {
    legend: { type: [String, Object] as unknown as () => unknown, default: undefined },
    items: { type: Array as () => TileGroupItem[], required: true },
    value: { type: String, default: undefined },
    disabled: { type: Boolean, default: false },
    class: { type: String, default: undefined },
  },
  emits: ["update:modelValue", "change"],
  setup(props, { emit, attrs }) {
    return () =>
      h(
        "fieldset",
        {
          ...attrs,
          class: classNames(
            "st-tileGroup",
            props.disabled && "st-tileGroup--disabled",
            props.class,
          ),
        },
        [
          props.legend
            ? h(
                "legend",
                { class: "st-tileGroup__legend" },
                props.legend as string,
              )
            : null,
          h(
            "div",
            { class: "st-tileGroup__items" },
            props.items.map((item) =>
              h(
                "label",
                {
                  key: item.value,
                  class: classNames(
                    "st-tileGroup__tile",
                    item.value === props.value &&
                      "st-tileGroup__tile--checked",
                    item.disabled && "st-tileGroup__tile--disabled",
                  ),
                },
                [
                  h("input", {
                    class: "st-tileGroup__input",
                    type: "radio",
                    value: item.value,
                    checked: item.value === props.value,
                    disabled: props.disabled || item.disabled,
                    readonly: true,
                    onChange: (event: Event) => {
                      emit(
                        "update:modelValue",
                        (event.target as HTMLInputElement).value,
                      );
                      emit("change", event);
                    },
                  }),
                  h("span", { class: "st-tileGroup__content" }, [
                    h(
                      "span",
                      { class: "st-tileGroup__label" },
                      (item.label ?? item.title) as string,
                    ),
                    item.description
                      ? h(
                          "span",
                          { class: "st-tileGroup__description" },
                          item.description as string,
                        )
                      : null,
                  ]),
                ],
              ),
            ),
          ),
        ],
      );
  },
});
