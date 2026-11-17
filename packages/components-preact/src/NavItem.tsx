import type { CSSProperties } from "preact";
import { useEffect, useState } from "preact/hooks";
import { Badge } from "./Badge.js";
import { ColorSwatch } from "./ColorSwatch.js";
import { StatusDot } from "./StatusDot.js";
import { classNames } from "./classNames.js";
import { SelectableRow } from "./SelectableRow.js";
import type { ComponentChildren } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

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
  depth?: MaybeSignal<NavItemDepth>;
  /** Pastille de tête : couleur arbitraire (ColorSwatch) ou ton (StatusDot). */
  swatch?: NavItemSwatch;
  /** Bulle de compte en queue (Badge circle/sm, tabular-nums). */
  count?: MaybeSignal<number>;
  /** Ton sémantique de la rangée. */
  status?: MaybeSignal<NavItemStatus>;
  /** Sélection (honorée en standalone ; la liste prime si encadrée). */
  selected?: MaybeSignal<boolean>;
  /** Notifié à chaque bascule avec le nouvel état de sélection (standalone). */
  onSelect?: (selected: boolean) => void;
  /** Non-interactif. */
  disabled?: MaybeSignal<boolean>;
  /** Rend la rangée comme un lien (ancre) — anatomie identique. */
  href?: string;
  /** Tête personnalisée (prime sur `swatch`). MUST NOT être interactif en option. */
  leading?: ComponentChildren;
  /** Queue personnalisée (prime sur `count`). MUST NOT être interactif en option. */
  trailing?: ComponentChildren;
  /** Séparateur token-only rendu APRÈS la rangée. */
  divider?: MaybeSignal<boolean>;
  /** A signal is accepted in the Preact build; the React emission keeps `string`. */
  className?: MaybeSignal<string>;
};

/**
 * NavItem — l'ANATOMIE DE RANGÉE CANONIQUE du système de navigation (vague 2).
 * Compose SelectableRow + ColorSwatch/StatusDot (tête) + Badge (queue `count`).
 */
export function NavItem({
  value,
  title,
  caption,
  depth: depthInput = 0,
  swatch,
  count: countInput,
  status: statusInput = "neutral",
  selected: selectedInput = false,
  onSelect,
  disabled: disabledInput = false,
  href,
  leading,
  trailing,
  divider: dividerInput = false,
  className,
}: NavItemProps) {
  const depth = useValue(depthInput);
  const count = useValue(countInput);
  const status = useValue(statusInput);
  const selected = useValue(selectedInput);
  const disabled = useValue(disabledInput);
  const divider = useValue(dividerInput);
  // Sélection auto-gérée en standalone (mirroir du `$bindable` svelte) : la row
  // React est contrôlée, donc NavItem détient l'état, amorcé par la prop
  // `selected`, et le bascule sur le retour de SelectableRow.
  const [internalSelected, setInternalSelected] = useState(selected);
  useEffect(() => {
    setInternalSelected(selected);
  }, [selected]);

  function handleSelect(next: boolean) {
    setInternalSelected(next);
    onSelect?.(next);
  }

  // Profondeur bornée [0..3] : une valeur hors-borne ne doit pas casser la classe.
  const safeDepth = Math.min(Math.max(Math.trunc(Number(depth) || 0), 0), 3) as NavItemDepth;

  // status → tone Badge : Badge couvre neutral/info/success/warning/error.
  const badgeTone = status;

  // Le count alimente un aria-label explicite « N title » (un compte nu est
  // ambigu pour un lecteur d'écran — cf. la doc de Badge).
  const countLabel = count != null ? `${count} ${title}` : undefined;

  // Classes posées sur le WRAPPER NavItem (la rangée elle-même est SelectableRow).
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
  } as CSSProperties;

  return (
    <div className={wrapperClasses} style={depthStyle}>
      <SelectableRow
        selected={internalSelected}
        onSelect={handleSelect}
        value={value}
        href={href}
        disabled={disabled}
        caption={caption != null ? <span className="st-navItem__caption">{caption}</span> : undefined}
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
