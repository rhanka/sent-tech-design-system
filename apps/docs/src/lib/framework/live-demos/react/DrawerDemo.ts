// Démo React interactive du Drawer — trois panneaux indépendants (droite,
// gauche, et un avec pied d'actions), état local par panneau, déclenchés par des
// boutons. createElement (pas de JSX) pour rester cohérent avec react-island.
//
// 100 % client : importée dynamiquement par live-island.ts ; jamais au prerender.

import type { ComponentType, ReactNode } from "react";

type DsReact = {
  Button: ComponentType<Record<string, unknown>>;
  Drawer: ComponentType<Record<string, unknown>>;
};

export function createDrawerDemo(
  React: typeof import("react"),
  ds: DsReact,
  fr: boolean
): ComponentType {
  const { Button, Drawer } = ds;
  const { createElement: h, useState, Fragment } = React;

  const tr = (frText: string, enText: string) => (fr ? frText : enText);

  return function DrawerDemo(): ReactNode {
    const [rightOpen, setRightOpen] = useState(false);
    const [leftOpen, setLeftOpen] = useState(false);
    const [footerOpen, setFooterOpen] = useState(false);

    const footer = h(
      Fragment,
      null,
      h(
        Button,
        { variant: "secondary", onClick: () => setFooterOpen(false), key: "cancel" },
        tr("Annuler", "Cancel")
      ),
      h(
        Button,
        { onClick: () => setFooterOpen(false), key: "save" },
        tr("Enregistrer", "Save")
      )
    );

    return h(
      "div",
      { className: "ld-row" },
      h(
        Button,
        { variant: "secondary", onClick: () => setRightOpen(true), key: "open-right" },
        tr("Ouvrir à droite", "Open right")
      ),
      h(
        Button,
        { variant: "secondary", onClick: () => setLeftOpen(true), key: "open-left" },
        tr("Ouvrir à gauche", "Open left")
      ),
      h(
        Button,
        { onClick: () => setFooterOpen(true), key: "open-footer" },
        tr("Configurer le service", "Configure service")
      ),
      h(Drawer, {
        key: "right",
        open: rightOpen,
        placement: "right",
        title: tr("Détails du service", "Service details"),
        description: tr("Panneau ancré à droite, le défaut.", "Panel anchored to the right, the default."),
        onClose: () => setRightOpen(false),
        children: h(
          "p",
          null,
          tr(
            "Le drawer accueille inspection, configuration et revue côte à côte.",
            "The drawer hosts inspection, configuration, and side-by-side review."
          )
        )
      }),
      h(Drawer, {
        key: "left",
        open: leftOpen,
        placement: "left",
        title: tr("Filtres", "Filters"),
        description: tr("Panneau ancré à gauche.", "Panel anchored to the left."),
        onClose: () => setLeftOpen(false),
        children: h(
          "p",
          null,
          tr(
            "Utilisez le côté gauche pour la navigation ou le filtrage.",
            "Use the left side for navigation or filtering."
          )
        )
      }),
      h(Drawer, {
        key: "footer",
        open: footerOpen,
        title: tr("Configurer le service", "Configure service"),
        description: tr("Ajustez les paramètres puis enregistrez.", "Adjust the settings, then save."),
        onClose: () => setFooterOpen(false),
        footer,
        children: h(
          "p",
          null,
          tr(
            "Le corps défile indépendamment de l'en-tête et du pied.",
            "The body scrolls independently of the header and footer."
          )
        )
      })
    );
  };
}
