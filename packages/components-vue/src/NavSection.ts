import { defineComponent, h, ref, watch, type VNode } from "vue";
import { classNames } from "./classNames.js";
import { Badge } from "./Badge.js";
import { Collapsible } from "./Collapsible.js";
import { Overline } from "./Overline.js";

/** Niveau de titre porté par l'Overline d'en-tête de section. `h2`/`h3` quand la
 * section est une vraie région titrée d'un rail/drawer ; choisis selon la
 * profondeur du sommaire. */
export type NavSectionHeadingLevel = "h2" | "h3";

export type NavSectionProps = {
  /** Libellé de la section, rendu via Overline (small-caps muet). */
  label: string;
  /** Compteur optionnel → Badge circle en queue de l'en-tête. */
  count?: number;
  /** Si true, l'en-tête devient le trigger d'un Collapsible (aria-expanded)
   * qui montre/cache le contenu. Sinon : groupe titré statique. */
  collapsible?: boolean;
  /** État d'ouverture quand `collapsible`. */
  open?: boolean;
  /** Niveau de titre de l'Overline quand la section n'est pas repliable. */
  as?: NavSectionHeadingLevel;
  /** Notifié à chaque bascule d'ouverture (section repliable). */
  onToggle?: (open: boolean) => void;
  class?: string;
};

let navSectionCounter = 0;

/**
 * NavSection — EN-TÊTE DE GROUPE d'un rail / drawer (« COMMUNITIES »,
 * « SIGNAUX », « Pastilles », « Zonage / Potentiel », « DOCUMENTATION »).
 * Donne la hiérarchie typographique qui manque à une liste plate + un foyer
 * normé pour l'action locale. ZÉRO-ENTROPIE : on RÉUTILISE les primitives déjà
 * livrées —
 *   • Overline  → le libellé small-caps muet (rendu en h2/h3 pour la sémantique
 *     de titre quand la section n'est PAS repliable) ;
 *   • Badge shape="circle" → le compteur de section en queue d'en-tête ;
 *   • Collapsible → le disclosure (trigger aria-expanded + région
 *     aria-labelledby) quand `collapsible`.
 * On ne réimplémente NI disclosure NI libellé. Style token-only scopé, aucun hex.
 *
 * Slots : `default` (contenu de la section, rendu dans la région) ; `action`
 * (emplacement normé d'une action de section, aligné à droite de l'en-tête,
 * NON rendu quand `collapsible`).
 */
export const NavSection = defineComponent({
  name: "NavSection",
  props: {
    label: { type: String, required: true },
    count: { type: Number, default: undefined },
    collapsible: { type: Boolean, default: false },
    open: { type: Boolean, default: true },
    as: { type: String as () => NavSectionHeadingLevel, default: "h3" },
    onToggle: {
      type: Function as unknown as () => (open: boolean) => void,
      default: undefined,
    },
    class: { type: String, default: undefined },
  },
  emits: ["toggle"],
  setup(props, { slots, attrs, emit }) {
    const uid = `st-navSection-${(navSectionCounter += 1)}`;

    // `open` est une valeur INITIALE (mirroir de `bind:open` svelte) : la section
    // gère son propre état d'ouverture et le re-synchronise si le prop change.
    const internalOpen = ref(props.open);
    watch(
      () => props.open,
      (next) => {
        internalOpen.value = next;
      },
    );

    return () => {
      const hasCount = typeof props.count === "number";

      const rootClasses = classNames(
        "st-navSection",
        props.collapsible ? "st-navSection--collapsible" : "st-navSection--static",
        props.class,
      );

      const countBadge = (className?: string) =>
        h(
          Badge,
          {
            shape: "circle",
            size: "sm",
            class: className,
            "aria-label": `${props.count} éléments`,
          },
          { default: () => props.count },
        );

      if (props.collapsible) {
        // Repliable : l'en-tête EST le trigger du Collapsible. Le compteur passe
        // par son slot `trailing` (entre le titre et le chevron) ; on annonce le
        // tout aux lecteurs d'écran via aria-label. L'action de section n'a pas
        // sa place dans un trigger (un bouton dans un bouton).
        const collapsibleSlots: Record<string, () => unknown> = {
          default: () => slots.default?.(),
        };
        if (hasCount) {
          collapsibleSlots.trailing = () => countBadge();
        }

        return h(
          Collapsible,
          {
            ...attrs,
            open: internalOpen.value,
            title: props.label,
            "aria-label": hasCount ? `${props.label}, ${props.count}` : props.label,
            class: rootClasses,
            onToggle: (open: boolean) => {
              internalOpen.value = open;
              props.onToggle?.(open);
              emit("toggle", open);
            },
          },
          collapsibleSlots,
        );
      }

      // Statique : groupe titré par l'Overline (h2/h3). Le contenu est relié au
      // titre via aria-labelledby — la liste devient une vraie région titrée.
      const overlineChildren: (VNode | string)[] = [props.label];
      if (hasCount) {
        overlineChildren.push(countBadge("st-navSection__count"));
      }

      const headerChildren: VNode[] = [
        h(
          Overline,
          { as: props.as, id: `${uid}-label`, class: "st-navSection__label" },
          { default: () => overlineChildren },
        ),
      ];
      if (slots.action) {
        headerChildren.push(
          h("span", { class: "st-navSection__action" }, slots.action()),
        );
      }

      return h(
        "section",
        {
          ...attrs,
          class: rootClasses,
          role: "group",
          "aria-labelledby": `${uid}-label`,
        },
        [
          h("div", { class: "st-navSection__header" }, headerChildren),
          h("div", { class: "st-navSection__body" }, slots.default?.()),
        ],
      );
    };
  },
});
