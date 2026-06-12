// Démo Vue interactive du Drawer : composant à fonction de rendu (defineComponent
// + h), trois panneaux indépendants (droite, gauche, pied d'actions), état local
// via ref. Le Drawer Vue émet `close`, expose `default` (corps) et `footer`, et
// s'ancre via `placement`.
//
// 100 % client : importée dynamiquement par live-island.ts ; jamais au prerender.

type VueModule = typeof import("vue");

type DsVue = {
  Button: unknown;
  Drawer: unknown;
};

export function createDrawerDemo(Vue: VueModule, ds: DsVue, fr: boolean): unknown {
  const { defineComponent, h, ref } = Vue;
  const { Button, Drawer } = ds;

  const tr = (frText: string, enText: string) => (fr ? frText : enText);

  return defineComponent({
    name: "DrawerDemoVue",
    setup() {
      const rightOpen = ref(false);
      const leftOpen = ref(false);
      const footerOpen = ref(false);

      return () =>
        h("div", { class: "ld-row" }, [
          h(
            Button as never,
            { variant: "secondary", onClick: () => (rightOpen.value = true) },
            { default: () => tr("Ouvrir à droite", "Open right") }
          ),
          h(
            Button as never,
            { variant: "secondary", onClick: () => (leftOpen.value = true) },
            { default: () => tr("Ouvrir à gauche", "Open left") }
          ),
          h(
            Button as never,
            { onClick: () => (footerOpen.value = true) },
            { default: () => tr("Configurer le service", "Configure service") }
          ),
          h(
            Drawer as never,
            {
              open: rightOpen.value,
              placement: "right",
              title: tr("Détails du service", "Service details"),
              description: tr(
                "Panneau ancré à droite, le défaut.",
                "Panel anchored to the right, the default."
              ),
              onClose: () => (rightOpen.value = false)
            },
            {
              default: () =>
                h(
                  "p",
                  tr(
                    "Le drawer accueille inspection, configuration et revue côte à côte.",
                    "The drawer hosts inspection, configuration, and side-by-side review."
                  )
                )
            }
          ),
          h(
            Drawer as never,
            {
              open: leftOpen.value,
              placement: "left",
              title: tr("Filtres", "Filters"),
              description: tr("Panneau ancré à gauche.", "Panel anchored to the left."),
              onClose: () => (leftOpen.value = false)
            },
            {
              default: () =>
                h(
                  "p",
                  tr(
                    "Utilisez le côté gauche pour la navigation ou le filtrage.",
                    "Use the left side for navigation or filtering."
                  )
                )
            }
          ),
          h(
            Drawer as never,
            {
              open: footerOpen.value,
              title: tr("Configurer le service", "Configure service"),
              description: tr("Ajustez les paramètres puis enregistrez.", "Adjust the settings, then save."),
              onClose: () => (footerOpen.value = false)
            },
            {
              default: () =>
                h(
                  "p",
                  tr(
                    "Le corps défile indépendamment de l'en-tête et du pied.",
                    "The body scrolls independently of the header and footer."
                  )
                ),
              footer: () => [
                h(
                  Button as never,
                  { variant: "secondary", onClick: () => (footerOpen.value = false) },
                  { default: () => tr("Annuler", "Cancel") }
                ),
                h(
                  Button as never,
                  { onClick: () => (footerOpen.value = false) },
                  { default: () => tr("Enregistrer", "Save") }
                )
              ]
            }
          )
        ]);
    }
  });
}
