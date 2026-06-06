import { defineComponent, h, ref, watch } from "vue";
import type { PropType } from "vue";
import { classNames } from "./classNames.js";

export type FilterPillTone = "neutral" | "success" | "warning" | "error" | "info";

export type FilterPillProps = {
  /** Nom du champ/dimension affiché à gauche. */
  field: string;
  /** Résumé de la valeur sélectionnée, ex "France, Italie" ou "> 100". */
  value: string;
  /** Opérateur optionnel affiché entre field et value, ex "=", "in", "entre". */
  operator?: string;
  /** Pilule active (aria-pressed). Défaut true. */
  active?: boolean;
  /** Affiche le bouton ✕. Défaut true. */
  removable?: boolean;
  disabled?: boolean;
  tone?: FilterPillTone;
  onClick?: () => void;
  onRemove?: () => void;
  class?: string;
};

// Icône X inline (lucide-style)
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

const FOCUSABLE_SELECTOR =
  "a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex='-1'])";

export const FilterPill = defineComponent({
  name: "FilterPill",
  props: {
    field: { type: String, required: true },
    value: { type: String, required: true },
    operator: { type: String, default: undefined },
    active: { type: Boolean, default: true },
    removable: { type: Boolean, default: true },
    disabled: { type: Boolean, default: false },
    tone: { type: String as () => FilterPillTone, default: "neutral" },
    onClick: { type: Function as PropType<() => void>, default: undefined },
    onRemove: { type: Function as PropType<() => void>, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const containerRef = ref<HTMLElement | null>(null);

    // Fix #5 : transfert de focus quand le corps-bouton focalisé devient disabled.
    watch(
      () => props.disabled,
      (newVal, oldVal) => {
        if (newVal && !oldVal) {
          const container = containerRef.value;
          if (container && container.contains(document.activeElement)) {
            const focusable = document.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
            let transferred = false;
            for (const el of Array.from(focusable)) {
              if (!container.contains(el)) {
                el.focus();
                transferred = true;
                break;
              }
            }
            if (!transferred) (document.body as HTMLElement).focus();
          }
        }
      }
    );

    return () => {
      const { field, value, operator, active, removable, disabled, tone, onClick, onRemove } = props;

      const groupClass = classNames(
        "st-filterPill",
        `st-filterPill--${tone}`,
        active ? "st-filterPill--active" : undefined,
        disabled ? "st-filterPill--disabled" : undefined,
        props.class
      );

      function handleClick() {
        if (disabled) return;
        onClick?.();
      }

      function handleRemove() {
        if (disabled) return;
        onRemove?.();
      }

      function handleBodyKeydown(e: KeyboardEvent) {
        if (disabled) return;
        if ((e.key === "Delete" || e.key === "Backspace") && removable) {
          e.preventDefault();
          onRemove?.();
        }
      }

      const bodyChildren = [
        h("span", { class: "st-filterPill__field" }, field),
        operator
          ? h("span", { class: "st-filterPill__operator", "aria-hidden": "true" }, operator)
          : null,
        h("span", { class: "st-filterPill__value" }, value),
      ].filter(Boolean);

      const bodyNode = onClick
        ? h(
            "button",
            {
              type: "button",
              class: "st-filterPill__body",
              "aria-pressed": String(active),
              disabled: disabled || undefined,
              onClick: handleClick,
              onKeydown: handleBodyKeydown,
            },
            bodyChildren
          )
        : h(
            "span",
            { class: "st-filterPill__body st-filterPill__body--static" },
            bodyChildren
          );

      const removeNode = removable
        ? h(
            "button",
            {
              type: "button",
              class: "st-filterPill__remove",
              "aria-label": `Retirer le filtre ${field}`,
              disabled: disabled || undefined,
              onClick: handleRemove,
            },
            [XIcon(12)]
          )
        : null;

      return h(
        "span",
        {
          ref: containerRef,
          class: groupClass,
          role: "group",
          "aria-label": `Filtre ${field}`,
        },
        [bodyNode, removeNode].filter(Boolean)
      );
    };
  },
});
