import { defineComponent, h, ref, watch, type VNode } from "vue";
import { classNames } from "./classNames.js";
import { SelectableRow } from "./SelectableRow.js";
import { ColorSwatch } from "./ColorSwatch.js";
import { StatusDot } from "./StatusDot.js";
import { Badge } from "./Badge.js";
import type { StatusDotTone } from "./StatusDot.js";
import type { ColorSwatchShape } from "./ColorSwatch.js";

/** Profondeur dans l'arbre de nav → échelle typographique DÉCROISSANTE.
 * L0 = racine (base/600), chaque palier descend en taille ET en graisse pour
 * que la hiérarchie se LISE sans indentation seule. */
export type NavItemDepth = 0 | 1 | 2 | 3;

/** Ton sémantique de la rangée. `error` est un VRAI état (un « HTTP 403 »
 * devient rouge sémantique), pas une teinte décorative. */
export type NavItemStatus = "neutral" | "info" | "success" | "warning" | "error";

export type NavItemSwatch = {
  /** Couleur arbitraire (hex/rgb/var) → rendue par ColorSwatch. */
  color?: string;
  /** Ton sémantique → rendu par StatusDot (un point). Ignoré si `color`. */
  tone?: StatusDotTone;
  /** Forme de la pastille couleur (ColorSwatch). Défaut « square ». */
  shape?: ColorSwatchShape;
};

export type NavItemProps = {
  /** Clé de sélection, passée telle quelle à SelectableRow (data-value). */
  value?: string;
  /** Libellé principal (1ʳᵉ ligne). */
  title: string;
  /** 2ᵉ ligne MUETTE, ellipsée indépendamment du titre. */
  caption?: string;
  /** Profondeur (défaut 0) → échelle typo + indentation de la tête. */
  depth?: NavItemDepth;
  /** Pastille de tête : couleur arbitraire (ColorSwatch) ou ton (StatusDot). */
  swatch?: NavItemSwatch;
  /** Bulle de compte en queue (Badge circle/sm, tabular-nums). */
  count?: number;
  /** Ton sémantique de la rangée. */
  status?: NavItemStatus;
  /** Sélection (honorée en standalone ; la liste prime si encadrée). */
  selected?: boolean;
  /** Non-interactif. */
  disabled?: boolean;
  /** Rend la rangée comme un lien (ancre) — anatomie identique. */
  href?: string;
  /** Séparateur token-only rendu APRÈS la rangée. */
  divider?: boolean;
  /** Notifié à chaque bascule de sélection (rangée standalone). */
  onSelect?: (selected: boolean) => void;
  class?: string;
};

const DEPTH_INDENT = ["0rem", "0.75rem", "1.5rem", "2.25rem"] as const;

/**
 * NavItem — l'ANATOMIE DE RANGÉE CANONIQUE du système de navigation (vague 2).
 * La brique que tout rail/drawer instancie : tête (pastille/icône) + titre +
 * caption muette + queue (bulle de compte) + sélection + profondeur
 * typographique + séparateur optionnel.
 *
 * Zéro-entropie : NavItem NE RÉIMPLÉMENTE RIEN. Il COMPOSE SelectableRow (qui
 * possède déjà leading/trailing/caption, la sélection, le rôle ARIA dérivé du
 * conteneur et la propagation du roving-tabindex) et réutilise les primitives
 * vague 1 :
 *   • ColorSwatch  → tête quand `swatch.color` (couleur arbitraire inline)
 *   • StatusDot    → tête quand `swatch.tone` (point sémantique)
 *   • Badge        → queue (shape="circle" size="sm", tabular-nums) pour `count`
 * Style PROPRE token-only scopé ; AUCUN hex en dur.
 *
 * Slots : `leading` (prime sur `swatch`), `trailing` (prime sur `count`).
 */
export const NavItem = defineComponent({
  name: "NavItem",
  props: {
    value: { type: String, default: undefined },
    title: { type: String, required: true },
    caption: { type: String, default: undefined },
    depth: { type: Number as () => NavItemDepth, default: 0 },
    swatch: { type: Object as () => NavItemSwatch, default: undefined },
    count: { type: Number, default: undefined },
    status: { type: String as () => NavItemStatus, default: "neutral" },
    selected: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    href: { type: String, default: undefined },
    divider: { type: Boolean, default: false },
    onSelect: {
      type: Function as unknown as () => (selected: boolean) => void,
      default: undefined,
    },
    class: { type: String, default: undefined },
  },
  emits: {
    select: (_selected: boolean) => true,
  },
  setup(props, { slots, attrs, emit }) {
    // Sélection standalone : SelectableRow vue est CONTRÔLÉ (il n'auto-toggle
    // pas), donc NavItem détient l'état interne et le rebascule à la rangée.
    const internalSelected = ref(props.selected);
    watch(
      () => props.selected,
      (next) => {
        internalSelected.value = next;
      },
    );

    function handleSelect(next: boolean) {
      internalSelected.value = next;
      props.onSelect?.(next);
      emit("select", next);
    }

    return () => {
      // Profondeur bornée [0..3] : une valeur hors-borne ne casse pas la classe.
      const safeDepth = Math.min(
        Math.max(Math.trunc(Number(props.depth) || 0), 0),
        3,
      ) as NavItemDepth;

      // Le count alimente un aria-label explicite « N title » (un compte nu est
      // ambigu pour un lecteur d'écran — cf. la doc de Badge).
      const countLabel = props.count != null ? `${props.count} ${props.title}` : undefined;

      const wrapperClasses = classNames(
        "st-navItem",
        `st-navItem--depth${safeDepth}`,
        props.status !== "neutral" ? `st-navItem--status-${props.status}` : undefined,
        props.class,
      );

      // Indentation de profondeur : une var additive sur le wrapper, à fallback
      // littéral par palier (aucun hex). La rangée hérite via la cascade.
      const depthStyle = `--st-navItem-indent: var(--st-component-navItem-depth${safeDepth}-indent, ${DEPTH_INDENT[safeDepth]});`;

      // Tête : leading (slot) prime sur swatch ; ColorSwatch pour une couleur
      // arbitraire, sinon StatusDot pour un ton sémantique.
      const leadingSlot = slots.leading
        ? slots.leading
        : props.swatch
          ? () =>
              props.swatch!.color
                ? h(ColorSwatch, {
                    color: props.swatch!.color,
                    shape: props.swatch!.shape ?? "square",
                    size: 14,
                  })
                : h(StatusDot, { tone: props.swatch!.tone ?? "neutral", size: 8 })
          : undefined;

      // Queue : trailing (slot) prime sur count. Badge circle/sm aligné sur le
      // status de la rangée, aria-label explicite.
      const trailingSlot = slots.trailing
        ? slots.trailing
        : props.count != null
          ? () =>
              h(
                Badge,
                {
                  shape: "circle",
                  size: "sm",
                  tone: props.status,
                  "aria-label": countLabel,
                },
                { default: () => props.count },
              )
          : undefined;

      const rowSlots: Record<string, () => unknown> = {
        default: () => h("span", { class: "st-navItem__title" }, props.title),
      };
      if (leadingSlot) rowSlots.leading = leadingSlot;
      if (trailingSlot) rowSlots.trailing = trailingSlot;
      if (props.caption) {
        rowSlots.caption = () =>
          h("span", { class: "st-navItem__caption" }, props.caption);
      }

      const children: VNode[] = [
        h(
          SelectableRow,
          {
            selected: internalSelected.value,
            value: props.value,
            disabled: props.disabled,
            role: props.href ? "link" : undefined,
            onSelect: handleSelect,
          },
          rowSlots,
        ),
      ];

      if (props.divider) {
        children.push(
          h("hr", { class: "st-navItem__divider", "aria-hidden": "true" }),
        );
      }

      return h(
        "div",
        { ...attrs, class: wrapperClasses, style: depthStyle },
        children,
      );
    };
  },
});
