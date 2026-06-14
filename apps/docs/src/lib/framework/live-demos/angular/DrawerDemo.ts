import type { NodeSpec } from "../../examples";

interface DrawerState {
  rightOpen: boolean;
  leftOpen: boolean;
  footerOpen: boolean;
}

export function createDrawerDemoNodes(
  fr: boolean,
  state: DrawerState,
  setState: (next: Partial<DrawerState>) => void
): NodeSpec[] {
  const tr = (frText: string, enText: string) => (fr ? frText : enText);

  return [
    {
      el: "div",
      props: { class: "ld-row" },
      children: [
        {
          comp: "Button",
          props: { variant: "secondary", onClick: () => setState({ rightOpen: true }) },
          children: [tr("Ouvrir à droite", "Open right")]
        },
        {
          comp: "Button",
          props: { variant: "secondary", onClick: () => setState({ leftOpen: true }) },
          children: [tr("Ouvrir à gauche", "Open left")]
        },
        {
          comp: "Button",
          props: { onClick: () => setState({ footerOpen: true }) },
          children: [tr("Configurer le service", "Configure service")]
        },
        {
          comp: "Drawer",
          props: {
            open: state.rightOpen,
            placement: "right",
            title: tr("Détails du service", "Service details"),
            description: tr(
              "Panneau ancré à droite, le défaut.",
              "Panel anchored to the right, the default."
            ),
            onClose: () => setState({ rightOpen: false })
          },
          children: [
            {
              el: "p",
              children: [
                tr(
                  "Le drawer accueille inspection, configuration et revue côte à côte.",
                  "The drawer hosts inspection, configuration, and side-by-side review."
                )
              ]
            }
          ]
        },
        {
          comp: "Drawer",
          props: {
            open: state.leftOpen,
            placement: "left",
            title: tr("Filtres", "Filters"),
            description: tr("Panneau ancré à gauche.", "Panel anchored to the left."),
            onClose: () => setState({ leftOpen: false })
          },
          children: [
            {
              el: "p",
              children: [
                tr(
                  "Utilisez le côté gauche pour la navigation ou le filtrage.",
                  "Use the left side for navigation or filtering."
                )
              ]
            }
          ]
        },
        {
          comp: "Drawer",
          props: {
            open: state.footerOpen,
            title: tr("Configurer le service", "Configure service"),
            description: tr(
              "Ajustez les paramètres puis enregistrez.",
              "Adjust the settings, then save."
            ),
            onClose: () => setState({ footerOpen: false })
          },
          children: [
            {
              el: "p",
              children: [
                tr(
                  "Le corps défile indépendamment de l'en-tête et du pied.",
                  "The body scrolls independently of the header and footer."
                )
              ]
            }
          ]
        }
      ]
    }
  ];
}
