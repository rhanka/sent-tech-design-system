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
    // Refs des boutons radio pour déplacer le focus programmatiquement (mode entier).
    const radioRefs = ref<Record<number, HTMLElement | null>>({});

    return () => {
      const current = props.value ?? internal.value;
      const max = props.max;
      const iconSize = props.size === "sm" ? 16 : props.size === "lg" ? 28 : 22;
      const stars = Array.from({ length: max }, (_, i) => i + 1);
      // L'étoile « focusable » (tabindex 0) suit la valeur ; à 0 c'est la première.
      const focusedStar = current > 0 ? Math.ceil(current) : 1;

      const valueText = `${current} / ${max}`;

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

      // Clavier pour le mode entier (radiogroup) : déplace le focus DOM.
      const onRadioKeyDown = (event: KeyboardEvent) => {
        if (props.readonly) return;
        const step = 1;
        let handled = true;
        let next: number | null = null;
        switch (event.key) {
          case "ArrowRight":
          case "ArrowUp":
            next = Math.min(max, current + step);
            break;
          case "ArrowLeft":
          case "ArrowDown":
            // Ne pas descendre sous 1 (pas de radio "0").
            next = Math.max(1, current - step);
            break;
          case "Home":
            // Home → première étoile (1), pas 0.
            next = 1;
            break;
          case "End":
            next = max;
            break;
          default:
            handled = false;
        }
        if (handled) {
          event.preventDefault();
          if (next !== null) {
            commit(next);
            const targetStar = next > 0 ? Math.ceil(next) : 1;
            const targetEl = radioRefs.value[targetStar];
            if (targetEl) targetEl.focus();
          }
        }
      };

      // Clavier pour le mode slider (allowHalf).
      const onSliderKeyDown = (event: KeyboardEvent) => {
        if (props.readonly) return;
        const step = 0.5;
        let handled = true;
        let next: number | null = null;
        switch (event.key) {
          case "ArrowRight":
          case "ArrowUp":
            next = Math.min(max, current + step);
            break;
          case "ArrowLeft":
          case "ArrowDown":
            next = Math.max(0, current - step);
            break;
          case "Home":
            next = 0;
            break;
          case "End":
            next = max;
            break;
          default:
            handled = false;
        }
        if (handled) {
          event.preventDefault();
          if (next !== null) commit(next);
        }
      };

      const baseClass = classNames(
        "st-rating",
        `st-rating--${props.size}`,
        props.readonly && "st-rating--readonly",
        props.class,
      );

      // --- Mode readonly : role=img sur le conteneur, pas d'éléments interactifs disabled.
      if (props.readonly) {
        return h(
          "div",
          {
            ...attrs,
            class: baseClass,
            role: "img",
            "aria-label": props.label ? `${props.label} : ${valueText}` : valueText,
          },
          stars.map((star) => {
            const state = fill(star);
            return h(
              "span",
              {
                key: star,
                class: classNames(
                  "st-rating__star",
                  state === "full" && "st-rating__star--full",
                  state === "half" && "st-rating__star--half",
                ),
                "aria-hidden": "true",
              },
              [
                state === "half"
                  ? StarHalfIcon(iconSize)
                  : StarIcon(iconSize, state === "full" ? "currentColor" : "none"),
              ],
            );
          }),
        );
      }

      // --- Mode allowHalf : slider ARIA (valeurs fractionnaires).
      if (props.allowHalf) {
        return h(
          "div",
          {
            ...attrs,
            class: baseClass,
            role: "slider",
            "aria-label": props.label,
            "aria-valuemin": 0,
            "aria-valuemax": max,
            "aria-valuenow": current,
            "aria-valuetext": valueText,
            tabindex: 0,
            onKeydown: onSliderKeyDown,
          },
          stars.map((star) => {
            const state = fill(star);
            return h(
              "span",
              {
                key: star,
                class: classNames(
                  "st-rating__star",
                  state === "full" && "st-rating__star--full",
                  state === "half" && "st-rating__star--half",
                ),
                "aria-hidden": "true",
                onClick: (event: MouseEvent) => onStarClick(event, star),
              },
              [
                state === "half"
                  ? StarHalfIcon(iconSize)
                  : StarIcon(iconSize, state === "full" ? "currentColor" : "none"),
              ],
            );
          }),
        );
      }

      // --- Mode entier : radiogroup / radio avec roving tabindex.
      // onKeydown est aussi sur le conteneur pour capturer les events qui
      // n'ont pas encore bubblé depuis un radio enfant (tests + edge cases).
      return h(
        "div",
        {
          ...attrs,
          class: baseClass,
          role: "radiogroup",
          "aria-label": props.label,
          onKeydown: onRadioKeyDown,
        },
        stars.map((star) => {
          const state = fill(star);
          return h(
            "button",
            {
              key: star,
              ref: (el: unknown) => { radioRefs.value[star] = el as HTMLElement | null; },
              type: "button",
              class: classNames(
                "st-rating__star",
                state === "full" && "st-rating__star--full",
                state === "half" && "st-rating__star--half",
              ),
              role: "radio",
              name: props.name,
              "aria-checked": current === star ? "true" : "false",
              "aria-label": `${star} / ${max}`,
              tabindex: star === focusedStar ? 0 : -1,
              onClick: (event: MouseEvent) => onStarClick(event, star),
              onKeydown: onRadioKeyDown,
            },
            [StarIcon(iconSize, state === "full" ? "currentColor" : "none")],
          );
        }),
      );
    };
  },
});
