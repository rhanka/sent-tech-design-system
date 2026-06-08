// Démo Vue interactive du Modal — composant à fonction de rendu (defineComponent
// + h), état local via ref, déclenché par un bouton. Aucun SFC : cohérent avec
// vue-island. Le Modal Vue émet `close`, expose un slot `default` (corps) et un
// slot `footer`.
//
// 100 % client : importée dynamiquement par live-island.ts ; jamais au prerender.

type VueModule = typeof import("vue");

type DsVue = {
  Button: unknown;
  Modal: unknown;
};

export function createModalDemo(Vue: VueModule, ds: DsVue, fr: boolean): unknown {
  const { defineComponent, h, ref } = Vue;
  const { Button, Modal } = ds;

  const tr = (frText: string, enText: string) => (fr ? frText : enText);

  return defineComponent({
    name: "ModalDemoVue",
    setup() {
      const confirmOpen = ref(false);
      const footerOpen = ref(false);

      return () =>
        h("div", { class: "ld-row" }, [
          h(
            Button as never,
            { onClick: () => (confirmOpen.value = true) },
            { default: () => tr("Ouvrir le dialogue", "Open dialog") }
          ),
          h(
            Button as never,
            { variant: "secondary", onClick: () => (footerOpen.value = true) },
            { default: () => tr("Ouvrir avec actions", "Open with actions") }
          ),
          h(
            Modal as never,
            {
              open: confirmOpen.value,
              title: tr("Confirmer l'action", "Confirm action"),
              description: tr(
                "Cette action recompile le thème du tenant.",
                "This action recompiles the tenant theme."
              ),
              onClose: () => (confirmOpen.value = false)
            },
            {
              default: () =>
                h(
                  "p",
                  tr(
                    "Le contenu du modal reste neutre et fourni par l'application hôte.",
                    "Modal content stays product-neutral and is supplied by the host application."
                  )
                )
            }
          ),
          h(
            Modal as never,
            {
              open: footerOpen.value,
              title: tr("Publier le tenant", "Publish tenant"),
              description: tr(
                "Les changements seront visibles immédiatement.",
                "Changes will be visible immediately."
              ),
              onClose: () => (footerOpen.value = false)
            },
            {
              default: () =>
                h(
                  "p",
                  tr(
                    "Vérifiez la configuration avant de publier.",
                    "Review the configuration before publishing."
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
                  { default: () => tr("Publier", "Publish") }
                )
              ]
            }
          )
        ]);
    }
  });
}
