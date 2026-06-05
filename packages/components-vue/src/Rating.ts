import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";

export type RatingSize = "sm" | "md" | "lg";

// In addition to the Vue-native `@change` emit (routed to an `onChange`
// listener by Vue), an `onChange` callback prop (parity with React/Svelte) is
// accepted and fired on change.
export type RatingProps = {
  /** Note courante (0..max). Pas de 1, ou 0.5 si `allowHalf`. */
  value?: number;
  /** Nombre d'étoiles. */
  max?: number;
  /** Appelé avec la nouvelle note au clic ou au clavier. */
  onChange?: (value: number) => void;
  /** Affichage seul : ni clic ni clavier n'émettent. */
  readonly?: boolean;
  /** Autorise les demi-étoiles (sélection au demi-point). */
  allowHalf?: boolean;
  size?: RatingSize;
  /** Attribut name (utile dans un formulaire / pour la sémantique radio). */
  name?: string;
  /** Étiquette accessible du groupe. */
  label?: string;
  class?: string;
};

function StarIcon(size: number, fill: "currentColor" | "none") {
  return h(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill,
      stroke: "currentColor",
      "stroke-width": 1.75,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
    },
    [
      h("polygon", {
        points:
          "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2",
      }),
    ],
  );
}

function StarHalfIcon(size: number) {
  return h(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": 1.75,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
    },
    [
      h("path", {
        d: "M12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2v15.77z",
        fill: "currentColor",
      }),
      h("path", { d: "M12 2v15.77l6.18 3.25L17 14.14 22 9.27l-6.91-1.01L12 2z" }),
    ],
  );
}

export const Rating = defineComponent({
  name: "Rating",
  props: {
    value: { type: Number, default: undefined },
    max: { type: Number, default: 5 },
    onChange: {
      type: Function as unknown as () => (value: number) => void,
      default: undefined,
    },
    readonly: { type: Boolean, default: false },
    allowHalf: { type: Boolean, default: false },
    size: { type: String as () => RatingSize, default: "md" },
    name: { type: String, default: undefined },
    label: { type: String, default: undefined },
    class: { type: String, default: undefined },
  },
  emits: ["change", "update:modelValue"],
  setup(props, { emit, attrs }) {
    const internal = ref(props.value ?? 0);

    return () => {
      const current = props.value ?? internal.value;
      const max = props.max;
      const iconSize = props.size === "sm" ? 16 : props.size === "lg" ? 28 : 22;
      const stars = Array.from({ length: max }, (_, i) => i + 1);
      // L'étoile « focusable » (tabindex 0) suit la valeur ; à 0 c'est la première.
      const focusedStar = current > 0 ? Math.ceil(current) : 1;

      const fill = (star: number): "full" | "half" | "empty" => {
        if (current >= star) return "full";
        if (props.allowHalf && current >= star - 0.5) return "half";
        return "empty";
      };

      const commit = (next: number) => {
        if (props.readonly) return;
        const clamped = Math.max(0, Math.min(max, next));
        if (props.value === undefined) internal.value = clamped;
        emit("update:modelValue", clamped);
        emit("change", clamped);
        props.onChange?.(clamped);
      };

      const onStarClick = (event: MouseEvent, star: number) => {
        if (props.readonly) return;
        let next = star;
        if (props.allowHalf) {
          const target = event.currentTarget as HTMLElement;
          const rect = target.getBoundingClientRect();
          const isLeftHalf = event.clientX - rect.left < rect.width / 2;
          next = isLeftHalf ? star - 0.5 : star;
        }
        // Re-cliquer la valeur déjà sélectionnée remet à zéro.
        if (next === current) {
          commit(0);
          return;
        }
        commit(next);
      };

      const onKeyDown = (event: KeyboardEvent) => {
        if (props.readonly) return;
        const step = props.allowHalf ? 0.5 : 1;
        let handled = true;
        switch (event.key) {
          case "ArrowRight":
          case "ArrowUp":
            commit(Math.min(max, current + step));
            break;
          case "ArrowLeft":
          case "ArrowDown":
            commit(Math.max(0, current - step));
            break;
          case "Home":
            commit(0);
            break;
          case "End":
            commit(max);
            break;
          default:
            handled = false;
        }
        if (handled) event.preventDefault();
      };

      return h(
        "div",
        {
          ...attrs,
          class: classNames(
            "st-rating",
            `st-rating--${props.size}`,
            props.readonly && "st-rating--readonly",
            props.class,
          ),
          role: "radiogroup",
          "aria-label": props.label,
          "aria-readonly": props.readonly ? "true" : undefined,
        },
        stars.map((star) => {
          const state = fill(star);
          return h(
            "button",
            {
              key: star,
              type: "button",
              class: classNames(
                "st-rating__star",
                state === "full" && "st-rating__star--full",
                state === "half" && "st-rating__star--half",
              ),
              role: "radio",
              name: props.name,
              "aria-checked": Math.ceil(current) === star ? "true" : "false",
              "aria-label": `${star} / ${max}`,
              tabindex: !props.readonly && star === focusedStar ? 0 : -1,
              disabled: props.readonly,
              onClick: (event: MouseEvent) => onStarClick(event, star),
              onKeydown: onKeyDown,
            },
            [
              state === "half"
                ? StarHalfIcon(iconSize)
                : StarIcon(iconSize, state === "full" ? "currentColor" : "none"),
            ],
          );
        }),
      );
    };
  },
});
