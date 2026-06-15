import { defineComponent, h } from "vue";
import type { CSSProperties } from "vue";
import { classNames } from "./classNames.js";

export type StatusDotTone = "neutral" | "info" | "success" | "warning" | "error";

export type StatusDotProps = {
  /** Ton sémantique, mappé sur --st-semantic-feedback-*. Ignoré si `color` est fourni. */
  tone?: StatusDotTone;
  /** Couleur arbitraire (hex, rgb(), var(--token)…), rendue en background inline. Prime sur `tone`. */
  color?: string;
  /** Diamètre du point en px (défaut 8). */
  size?: number;
  /** Halo animé pour un état « live ». Désactivé sous prefers-reduced-motion. */
  pulse?: boolean;
  /** Si fourni, rend le point + ce texte inline (un StatusIndicator). */
  label?: string;
  class?: string;
};

/**
 * StatusDot — pastille de statut (les points colorés des « COMMUNITIES », la
 * pastille « EN DIRECT » live, les indicateurs verts des docs). Par défaut un
 * simple point coloré via `tone` (mappé sur --st-semantic-feedback-*) ; `color`
 * accepte une couleur arbitraire rendue en `background-color` inline (même logique
 * que ColorSwatch) et prime sur `tone`. Avec `label`, rend point + texte = un
 * « StatusIndicator ». Style token-only, AUCUN hex en dur.
 *
 * a11y : sans label le point est purement décoratif → on expose tout de même un
 * `role="img"` + `aria-label` (le tone, ou la couleur). Avec label, le texte porte
 * l'info → le point passe `aria-hidden` (évite la redondance vocale).
 */
export const StatusDot = defineComponent({
  name: "StatusDot",
  props: {
    tone: { type: String as () => StatusDotTone, default: "neutral" },
    color: { type: String, default: undefined },
    size: { type: Number, default: 8 },
    pulse: { type: Boolean, default: false },
    label: { type: String, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      const safeSize = Math.max(Number(props.size ?? 8) || 0, 1);
      const accessibleLabel = props.label ?? props.color ?? props.tone;

      const dotStyle: CSSProperties = {
        width: `${safeSize}px`,
        height: `${safeSize}px`,
      };
      if (props.color) {
        dotStyle.backgroundColor = props.color;
      }

      const dotClasses = classNames(
        "st-statusDot__dot",
        props.color ? undefined : `st-statusDot__dot--${props.tone}`,
        props.pulse ? "st-statusDot__dot--pulse" : undefined,
      );

      if (props.label) {
        return h(
          "span",
          { ...attrs, class: classNames("st-statusDot", props.class) },
          [
            h("span", { class: dotClasses, style: dotStyle, "aria-hidden": "true" }),
            h("span", { class: "st-statusDot__label" }, props.label),
          ],
        );
      }

      return h(
        "span",
        { ...attrs, class: classNames("st-statusDot", props.class) },
        h("span", {
          class: dotClasses,
          style: dotStyle,
          role: "img",
          "aria-label": accessibleLabel,
        }),
      );
    };
  },
});
