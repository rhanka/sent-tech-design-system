// Îles pour démos INTERACTIVES par framework (Modal, Drawer, …).
//
// Contrairement à react-island/vue-island (qui rendent un NodeSpec déclaratif),
// ces démos sont des composants à état écrits par framework (bouton déclencheur
// -> overlay) : elles ne s'expriment pas en NodeSpec. On les monte ici par CLÉ.
//
// 100 % côté client : react, react-dom/client, vue et les packages DS sont tous
// importés dynamiquement, donc hors du bundle SSR/prerender. Chaque fonction
// renvoie un handle { unmount } pour un démontage propre au changement d'onglet.
//
// UN seul framework est monté à la fois (l'onglet actif), donc un seul jeu de
// portails/overlays existe à un instant donné : pas de superposition.

import type { IslandHandle } from "./react-island.js";

export type LiveDemoKey = "modal" | "drawer";

export async function mountReactLiveDemo(
  container: HTMLElement,
  key: LiveDemoKey,
  fr: boolean
): Promise<IslandHandle> {
  const [React, { createRoot }, dsReact] = await Promise.all([
    import("react"),
    import("react-dom/client"),
    import("@sentropic/design-system-react")
  ]);

  const ds = dsReact as unknown as {
    Button: React.ComponentType<Record<string, unknown>>;
    Modal: React.ComponentType<Record<string, unknown>>;
    Drawer: React.ComponentType<Record<string, unknown>>;
  };

  let Demo: React.ComponentType;
  if (key === "modal") {
    const { createModalDemo } = await import("./live-demos/react/ModalDemo.js");
    Demo = createModalDemo(React, ds, fr);
  } else {
    const { createDrawerDemo } = await import("./live-demos/react/DrawerDemo.js");
    Demo = createDrawerDemo(React, ds, fr);
  }

  const root = createRoot(container);
  root.render(React.createElement(Demo));

  return {
    unmount() {
      root.unmount();
    }
  };
}

export async function mountVueLiveDemo(
  container: HTMLElement,
  key: LiveDemoKey,
  fr: boolean
): Promise<IslandHandle> {
  const [Vue, dsVue] = await Promise.all([
    import("vue"),
    import("@sentropic/design-system-vue")
  ]);

  const ds = dsVue as unknown as { Button: unknown; Modal: unknown; Drawer: unknown };

  let Demo: unknown;
  if (key === "modal") {
    const { createModalDemo } = await import("./live-demos/vue/ModalDemo.js");
    Demo = createModalDemo(Vue, ds, fr);
  } else {
    const { createDrawerDemo } = await import("./live-demos/vue/DrawerDemo.js");
    Demo = createDrawerDemo(Vue, ds, fr);
  }

  const app = Vue.createApp(Demo as never);
  app.mount(container);

  return {
    unmount() {
      app.unmount();
    }
  };
}
