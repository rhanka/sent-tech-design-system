import React from "react";
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
  /** Emplacement normé d'une action de section (ex. Button « + Ajouter »),
   * aligné à droite de l'en-tête. NON rendu quand `collapsible` (le trigger
   * occupe l'en-tête en entier — place l'action dans le contenu). */
  action?: React.ReactNode;
  /** Contenu de la section (NavItem / NavList) — rendu dans la région. */
  children: React.ReactNode;
  className?: string;
};

/**
 * NavSection — EN-TÊTE DE GROUPE d'un rail / drawer (« COMMUNITIES »,
 * « SIGNAUX », « Pastilles », « Zonage / Potentiel », « DOCUMENTATION »).
 * Donne la hiérarchie typographique qui manque à une liste plate + un foyer
 * normé pour l'action locale (au lieu d'un bouton primaire planté dans la
 * liste). ZÉRO-ENTROPIE : on RÉUTILISE les primitives déjà livrées —
 *   • Overline  → le libellé small-caps muet (rendu en h2/h3 pour la
 *     sémantique de titre quand la section n'est PAS repliable) ;
 *   • Badge shape="circle" → le compteur de section en queue d'en-tête ;
 *   • Collapsible → le disclosure (trigger aria-expanded + région
 *     aria-labelledby) quand `collapsible`.
 * On ne réimplémente NI disclosure NI libellé. Style token-only scopé, aucun hex.
 */
export function NavSection({
  label,
  count,
  collapsible = false,
  open = true,
  as = "h3",
  action,
  children,
  className,
}: NavSectionProps) {
  const reactId = React.useId();
  const uid = `st-navSection-${reactId}`;

  // Ouverture auto-gérée (mirroir du `$bindable(true)` svelte) : NavSection
  // détient l'état, amorcé par la prop `open`, et le bascule via onToggle.
  const [internalOpen, setInternalOpen] = React.useState(open);
  React.useEffect(() => {
    setInternalOpen(open);
  }, [open]);

  const rootClasses = classNames(
    "st-navSection",
    collapsible ? "st-navSection--collapsible" : "st-navSection--static",
    className,
  );

  const hasCount = typeof count === "number";

  if (collapsible) {
    // Repliable : l'en-tête EST le trigger du Collapsible. Le compteur passe par
    // son slot `trailing` (entre le titre et le chevron) ; on annonce le tout aux
    // lecteurs d'écran via aria-label. L'action de section n'a pas sa place dans
    // un trigger (un bouton dans un bouton) : la documenter dans le contenu.
    return (
      <Collapsible
        open={internalOpen}
        onToggle={setInternalOpen}
        title={label}
        aria-label={hasCount ? `${label}, ${count}` : label}
        className={rootClasses}
        trailing={
          hasCount ? (
            <Badge shape="circle" size="sm" aria-label={`${count} éléments`}>
              {count}
            </Badge>
          ) : undefined
        }
      >
        {children}
      </Collapsible>
    );
  }

  // Statique : groupe titré par l'Overline (h2/h3). Le contenu est relié au
  // titre via aria-labelledby — la liste devient une vraie région titrée.
  return (
    <section className={rootClasses} role="group" aria-labelledby={`${uid}-label`}>
      <div className="st-navSection__header">
        <Overline as={as} id={`${uid}-label`} className="st-navSection__label">
          {label}
          {hasCount ? (
            <Badge
              shape="circle"
              size="sm"
              className="st-navSection__count"
              aria-label={`${count} éléments`}
            >
              {count}
            </Badge>
          ) : null}
        </Overline>
        {action != null ? (
          <span className="st-navSection__action">{action}</span>
        ) : null}
      </div>
      <div className="st-navSection__body">{children}</div>
    </section>
  );
}
