import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

/** Balise rendue. `span`/`div` = inline/bloc neutre ; `h2`/`h3` quand l'overline
 * sert d'en-tête de région (sémantique de titre). */
export type OverlineAs = "span" | "div" | "h2" | "h3";

export type OverlineProps = {
  /** Balise : `span` (défaut) inline, `div` bloc, `h2`/`h3` pour un en-tête de région. */
  as?: OverlineAs;
  class?: string;
};

/**
 * Overline — étiquette de section discrète en small-caps (les « DOCUMENTATION »,
 * « COMMUNITIES », « SIGNAUX », « DOCUMENTS SOURCES » des maquettes). Rôle :
 * libellé de groupe de niveau 0, muted, au-dessus d'un bloc. Style token-only :
 * chaque token --st-component-overline-* retombe sur un littéral, de sorte qu'un
 * thème qui n'émet rien rend à l'identique. AUCUN hex en dur.
 */
export const Overline = defineComponent({
  name: "Overline",
  props: {
    as: { type: String as () => OverlineAs, default: "span" },
    class: { type: String, default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        props.as ?? "span",
        { ...attrs, class: classNames("st-overline", props.class) },
        slots.default?.(),
      );
  },
});
