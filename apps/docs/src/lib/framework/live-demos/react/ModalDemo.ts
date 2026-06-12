// Démo React interactive du Modal : état local (ouvert/fermé) géré dans le
// composant, déclenchée par un bouton. Écrite en createElement (pas de JSX) pour
// rester cohérente avec react-island et ne demander aucun transform JSX.
//
// 100 % client : importée dynamiquement par live-island.ts ; jamais au prerender.

import type { ComponentType, ReactNode } from "react";

type DsReact = {
  Button: ComponentType<Record<string, unknown>>;
  Modal: ComponentType<Record<string, unknown>>;
};

export function createModalDemo(
  React: typeof import("react"),
  ds: DsReact,
  fr: boolean
): ComponentType {
  const { Button, Modal } = ds;
  const { createElement: h, useState, Fragment } = React;

  const tr = (frText: string, enText: string) => (fr ? frText : enText);

  return function ModalDemo(): ReactNode {
    const [confirmOpen, setConfirmOpen] = useState(false);
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
        { onClick: () => setFooterOpen(false), key: "publish" },
        tr("Publier", "Publish")
      )
    );

    return h(
      "div",
      { className: "ld-row" },
      h(
        Button,
        { onClick: () => setConfirmOpen(true), key: "open-confirm" },
        tr("Ouvrir le dialogue", "Open dialog")
      ),
      h(
        Button,
        { variant: "secondary", onClick: () => setFooterOpen(true), key: "open-footer" },
        tr("Ouvrir avec actions", "Open with actions")
      ),
      h(Modal, {
        key: "confirm",
        open: confirmOpen,
        title: tr("Confirmer l'action", "Confirm action"),
        description: tr(
          "Cette action recompile le thème du tenant.",
          "This action recompiles the tenant theme."
        ),
        onClose: () => setConfirmOpen(false),
        children: h(
          "p",
          null,
          tr(
            "Le contenu du modal reste neutre et fourni par l'application hôte.",
            "Modal content stays product-neutral and is supplied by the host application."
          )
        )
      }),
      h(Modal, {
        key: "footer",
        open: footerOpen,
        title: tr("Publier le tenant", "Publish tenant"),
        description: tr(
          "Les changements seront visibles immédiatement.",
          "Changes will be visible immediately."
        ),
        onClose: () => setFooterOpen(false),
        footer,
        children: h(
          "p",
          null,
          tr(
            "Vérifiez la configuration avant de publier.",
            "Review the configuration before publishing."
          )
        )
      })
    );
  };
}
