import { defineComponent, h } from "vue";
import type { Component, VNodeChild } from "vue";
import { classNames } from "./classNames.js";
import { Button } from "./Button.js";
import { Divider } from "./Divider.js";

/** Hiérarchie ENCODÉE DANS LE TYPE : une seule action `primary` est légitime
 * dans une pile. `secondary` = action secondaire ; `ghost` = action discrète.
 * La couleur sémantique (danger) n'est PAS un `kind` — elle vit dans
 * `dangerZone`, rendue à part. Le mauvais chemin (4 « primaires » arc-en-ciel)
 * devient ainsi impossible à exprimer proprement. */
export type NavActionKind = "primary" | "secondary" | "ghost";

export type NavAction = {
  label: string;
  /** Icône optionnelle (composant), rendue avant le libellé. */
  icon?: Component;
  onClick?: () => void;
  href?: string;
  kind?: NavActionKind;
  disabled?: boolean;
};

/** Action destructrice, isolée sous un séparateur + un overline « Zone
 * sensible ». Toujours en ton danger, jamais alignée avec les actions
 * normales. Pas de `kind` : c'est une zone, pas une catégorie de couleur. */
export type NavActionDangerZone = {
  label: string;
  icon?: Component;
  onClick?: () => void;
  href?: string;
};

export type NavActionStackOrientation = "vertical" | "horizontal";

export type NavActionStackProps = {
  actions?: NavAction[];
  dangerZone?: NavActionDangerZone;
  /** Libellé de l'overline de la zone sensible. Défaut « Zone sensible ». */
  dangerLabel?: string;
  orientation?: NavActionStackOrientation;
  /** Étiquette a11y du groupe d'actions. */
  label?: string;
  class?: string;
};

// kind → variant Button : primary→primary, secondary→secondary, ghost→ghost.
const variantFor = (kind: NavActionKind): "primary" | "secondary" | "ghost" => kind;

/**
 * NavActionStack — empile des actions en ENCODANT la hiérarchie dans le type.
 * Au plus UN `kind:"primary"` (les suivants sont dégradés en secondary +
 * console.warn). La couleur sémantique « danger » n'est pas détournée en
 * catégorie : la `dangerZone` est rendue séparément, sous un Divider + un
 * overline, en ton danger pleine largeur. Réutilise le Button du DS — aucun
 * bouton n'est réimplémenté. Style token-only, aucun hex en dur.
 */
export const NavActionStack = defineComponent({
  name: "NavActionStack",
  props: {
    actions: { type: Array as () => NavAction[], default: () => [] },
    dangerZone: { type: Object as () => NavActionDangerZone, default: undefined },
    dangerLabel: { type: String, default: "Zone sensible" },
    orientation: {
      type: String as () => NavActionStackOrientation,
      default: "vertical",
    },
    label: { type: String, default: "Actions" },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      // La règle (un seul primary) appliquée AU RUNTIME en miroir du type : on
      // garde le premier `primary`, on dégrade les suivants en `secondary` et on
      // prévient.
      let primarySeen = false;
      const normalizedActions = props.actions.map((action) => {
        const kind: NavActionKind = action.kind ?? "secondary";
        if (kind === "primary") {
          if (primarySeen) {
            console.warn(
              `[NavActionStack] Plusieurs actions « primary » fournies — « ${action.label} » dégradée en « secondary ». Une pile n'a qu'une action primaire.`,
            );
            return { ...action, kind: "secondary" as NavActionKind };
          }
          primarySeen = true;
        }
        return { ...action, kind };
      });

      const renderActionChildren = (
        action: NavAction | NavActionDangerZone,
      ): VNodeChild[] => {
        const children: VNodeChild[] = [];
        if (action.icon) children.push(h(action.icon));
        children.push(action.label);
        return children;
      };

      const actionNodes = normalizedActions.map((action) => {
        if (action.href && !action.disabled) {
          // Action-lien : porte les classes Button (réutilisation du style, pas
          // de réimplémentation de la logique bouton).
          return h(
            "a",
            {
              key: action.label,
              class: `st-button st-button--${variantFor(action.kind)} st-button--md st-navActionStack__item`,
              href: action.href,
              onClick: action.onClick,
            },
            renderActionChildren(action),
          );
        }
        return h(
          Button,
          {
            key: action.label,
            variant: variantFor(action.kind),
            disabled: action.disabled,
            onClick: action.onClick,
            class: "st-navActionStack__item",
          },
          { default: () => renderActionChildren(action) },
        );
      });

      const children: VNodeChild[] = [
        h("div", { class: "st-navActionStack__actions" }, actionNodes),
      ];

      if (props.dangerZone) {
        const dz = props.dangerZone;
        // Zone sensible : SÉPARÉE des actions normales par un Divider, coiffée
        // d'un overline token-only, rendue en ton danger pleine largeur. Jamais
        // alignée avec la pile au-dessus.
        const dangerAction = dz.href
          ? h(
              "a",
              {
                class: "st-button st-button--danger st-button--md st-navActionStack__item st-navActionStack__dangerAction",
                href: dz.href,
                onClick: dz.onClick,
              },
              renderActionChildren(dz),
            )
          : h(
              Button,
              {
                variant: "danger",
                onClick: dz.onClick,
                class: "st-navActionStack__item st-navActionStack__dangerAction",
              },
              { default: () => renderActionChildren(dz) },
            );

        children.push(
          h(
            "div",
            {
              class: "st-navActionStack__danger",
              role: "group",
              "aria-label": props.dangerLabel,
            },
            [
              h(Divider),
              h("span", { class: "st-navActionStack__dangerLabel" }, props.dangerLabel),
              dangerAction,
            ],
          ),
        );
      }

      return h(
        "div",
        {
          ...attrs,
          class: classNames(
            "st-navActionStack",
            `st-navActionStack--${props.orientation}`,
            props.class,
          ),
          role: "group",
          "aria-label": props.label,
        },
        children,
      );
    };
  },
});
