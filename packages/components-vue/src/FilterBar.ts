import { defineComponent, h } from "vue";
import type { PropType } from "vue";
import { classNames } from "./classNames.js";

export type FilterBarProps = {
  /** Aria-label du groupe de filtres, ex "Filtres actifs". */
  label: string;
  /** Callback "tout effacer" — le bouton n'est rendu que si ce callback est fourni. */
  onClearAll?: () => void;
  /** Libellé du bouton "tout effacer". Défaut "Tout effacer". */
  clearAllLabel?: string;
  class?: string;
};

export const FilterBar = defineComponent({
  name: "FilterBar",
  props: {
    label: { type: String, required: true },
    onClearAll: { type: Function as PropType<() => void>, default: undefined },
    clearAllLabel: { type: String, default: "Tout effacer" },
    class: { type: String, default: undefined },
  },
  setup(props, { slots }) {
    return () => {
      const { label, onClearAll, clearAllLabel } = props;

      return h(
        "div",
        {
          class: classNames("st-filterBar", props.class),
          role: "group",
          "aria-label": label,
        },
        [
          h("div", { class: "st-filterBar__pills" }, slots.default?.()),
          onClearAll
            ? h(
                "button",
                {
                  type: "button",
                  class: "st-filterBar__clearAll",
                  onClick: onClearAll,
                },
                clearAllLabel
              )
            : null,
        ].filter(Boolean)
      );
    };
  },
});
