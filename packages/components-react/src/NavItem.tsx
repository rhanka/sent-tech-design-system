import React from "react";
import { classNames } from "./classNames.js";
import { SelectableRow } from "./SelectableRow.js";
import { ColorSwatch } from "./ColorSwatch.js";
import { StatusDot } from "./StatusDot.js";
import { Badge } from "./Badge.js";

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
  tone?: "neutral" | "info" | "success" | "warning" | "error";
  /** Forme de la pastille couleur (ColorSwatch). Défaut « square ». */
  shape?: "square" | "circle" | "pill";
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
  /** Notifié à chaque bascule avec le nouvel état de sélection (standalone). */
  onSelect?: (selected: boolean) => void;
  /** Non-interactif. */
  disabled?: boolean;
  /** Rend la rangée comme un lien (ancre) — anatomie identique. */
  href?: string;
  /** Tête personnalisée (prime sur `swatch`). MUST NOT être interactif en option. */
  leading?: React.ReactNode;
  /** Queue personnalisée (prime sur `count`). MUST NOT être interactif en option. */
  trailing?: React.ReactNode;
  /** Séparateur token-only rendu APRÈS la rangée. */
  divider?: boolean;
  className?: string;
};

/**
 * NavItem — l'ANATOMIE DE RANGÉE CANONIQUE du système de navigation (vague 2).
 * C'est la brique que tout rail/drawer instancie : tête (pastille/icône) +
 * titre + caption muette + queue (bulle de compte) + sélection + profondeur
 * typographique + séparateur optionnel.
 *
 * Zéro-entropie : NavItem NE RÉIMPLÉMENTE RIEN. Il COMPOSE SelectableRow (qui
 * possède déjà leading/trailing, la caption à ellipse indépendante, la
 * sélection à 2 signaux, l'accentBar opt-in, le rôle ARIA dérivé du conteneur
 * et la propagation du roving-tabindex) et réutilise les primitives vague 1 :
 *   • ColorSwatch  → tête quand `swatch.color` (couleur arbitraire inline)
 *   • StatusDot    → tête quand `swatch.tone` (point sémantique)
 *   • Badge        → queue (shape="circle" size="sm", tabular-nums) pour `count`
 * Style PROPRE token-only scopé : chaque --st-component-navItem-* retombe sur
 * un littéral de base, AUCUN hex en dur. Un thème qui n'émet rien rend
 * byte-identique.
 */
export function NavItem({
  value,
  title,
  caption,
  depth = 0,
  swatch,
  count,
  status = "neutral",
  selected = false,
  onSelect,
  disabled = false,
  href,
  leading,
  trailing,
  divider = false,
  className,
}: NavItemProps) {
  // Sélection auto-gérée en standalone (mirroir du `$bindable` svelte) : la row
  // React est contrôlée, donc NavItem détient l'état, amorcé par la prop
  // `selected`, et le bascule sur le retour de SelectableRow.
  const [internalSelected, setInternalSelected] = React.useState(selected);
  React.useEffect(() => {
    setInternalSelected(selected);
  }, [selected]);

  function handleSelect(next: boolean) {
    setInternalSelected(next);
    onSelect?.(next);
  }

  // Profondeur bornée [0..3] : une valeur hors-borne ne doit pas casser la classe.
  const safeDepth = Math.min(
    Math.max(Math.trunc(Number(depth) || 0), 0),
    3,
  ) as NavItemDepth;

  // status → tone Badge : Badge couvre neutral/info/success/warning/error.
  const badgeTone = status;

  // Le count alimente un aria-label explicite « N title » (un compte nu est
  // ambigu pour un lecteur d'écran — cf. la doc de Badge).
  const countLabel = count != null ? `${count} ${title}` : undefined;

  // Classes posées sur le WRAPPER NavItem (la rangée elle-même est SelectableRow).
  // Le wrapper porte la profondeur (échelle typo + indentation) et le ton de
  // rangée — ainsi SelectableRow reste inchangé et son rôle ARIA dérivé du
  // conteneur (option/button) est préservé.
  const wrapperClasses = classNames(
    "st-navItem",
    `st-navItem--depth${safeDepth}`,
    status !== "neutral" ? `st-navItem--status-${status}` : null,
    className,
  );

  // Indentation de profondeur : un CSS var additif sur le wrapper, à fallback
  // littéral par palier (aucun hex). SelectableRow ne forwarde pas `style` ; on
  // pose donc la var sur le wrapper et la rangée hérite via la cascade.
  const indentFallback = ["0rem", "0.75rem", "1.5rem", "2.25rem"][safeDepth];
  const depthStyle = {
    "--st-navItem-indent": `var(--st-component-navItem-depth${safeDepth}-indent, ${indentFallback})`,
  } as React.CSSProperties;

  return (
    <div className={wrapperClasses} style={depthStyle}>
      <SelectableRow
        selected={internalSelected}
        onSelect={handleSelect}
        value={value}
        href={href}
        disabled={disabled}
        caption={
          caption != null ? (
            <span className="st-navItem__caption">{caption}</span>
          ) : undefined
        }
        leading={
          leading != null ? (
            leading
          ) : swatch ? (
            // Tête : ColorSwatch pour une couleur arbitraire, sinon StatusDot pour
            // un ton sémantique. Décoratif → aria géré par la primitive.
            swatch.color ? (
              <ColorSwatch color={swatch.color} shape={swatch.shape ?? "square"} size={14} />
            ) : (
              <StatusDot tone={swatch.tone ?? "neutral"} size={8} />
            )
          ) : undefined
        }
        trailing={
          trailing != null ? (
            trailing
          ) : count != null ? (
            // Queue : bulle de compte. Badge shape="circle" size="sm"
            // (tabular-nums), ton sémantique aligné sur le `status` de la rangée.
            <Badge shape="circle" size="sm" tone={badgeTone} aria-label={countLabel}>
              {count}
            </Badge>
          ) : undefined
        }
      >
        <span className="st-navItem__title">{title}</span>
      </SelectableRow>

      {divider ? (
        // Séparateur token-only APRÈS la rangée (anatomie de liste de nav).
        <hr className="st-navItem__divider" aria-hidden="true" />
      ) : null}
    </div>
  );
}
