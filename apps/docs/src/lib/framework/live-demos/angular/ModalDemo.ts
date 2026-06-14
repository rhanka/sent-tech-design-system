import type { NodeSpec } from "../../examples";

interface ModalState {
  confirmOpen: boolean;
  footerOpen: boolean;
}

export function createModalDemoNodes(
  fr: boolean,
  state: ModalState,
  setState: (next: Partial<ModalState>) => void
): NodeSpec[] {
  const tr = (frText: string, enText: string) => (fr ? frText : enText);

  return [
    {
      el: "div",
      props: { class: "ld-row" },
      children: [
        {
          comp: "Button",
          props: { onClick: () => setState({ confirmOpen: true }) },
          children: [tr("Ouvrir le dialogue", "Open dialog")]
        },
        {
          comp: "Button",
          props: { variant: "secondary", onClick: () => setState({ footerOpen: true }) },
          children: [tr("Ouvrir avec actions", "Open with actions")]
        },
        {
          comp: "Modal",
          props: {
            open: state.confirmOpen,
            title: tr("Confirmer l'action", "Confirm action"),
            description: tr(
              "Cette action recompile le thème du tenant.",
              "This action recompiles the tenant theme."
            ),
            onClose: () => setState({ confirmOpen: false })
          },
          children: [
            {
              el: "p",
              children: [
                tr(
                  "Le contenu du modal reste neutre et fourni par l'application hôte.",
                  "Modal content stays product-neutral and is supplied by the host application."
                )
              ]
            }
          ]
        },
        {
          comp: "Modal",
          props: {
            open: state.footerOpen,
            title: tr("Publier le tenant", "Publish tenant"),
            description: tr(
              "Les changements seront visibles immédiatement.",
              "Changes will be visible immediately."
            ),
            onClose: () => setState({ footerOpen: false })
          },
          children: [
            {
              el: "p",
              children: [
                tr(
                  "Vérifiez la configuration avant de publier.",
                  "Review the configuration before publishing."
                )
              ]
            }
          ]
        }
      ]
    }
  ];
}
