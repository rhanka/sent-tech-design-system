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

  // Teardown défensif et idempotent : même garde-fou que vue-island.ts.
  // L'hôte est partagé entre îles ; l'île entrante peut vider le DOM avant la
  // fin de `app.unmount()`, ce qui ferait planter le parcours de teardown Vue
  // (`reading 'nextSibling'` en dev, `reading '$set'` sur le build minifié). On
  // garantit un seul unmount, on lâche la référence, et on absorbe un teardown
  // sur un hôte déjà nettoyé.
  let appRef: ReturnType<typeof Vue.createApp> | null = app;
  let disposed = false;

  return {
    unmount() {
      if (disposed) return;
      disposed = true;
      const current = appRef;
      appRef = null;
      if (!current) return;
      try {
        current.unmount();
      } catch {
        // Hôte déjà nettoyé par l'île entrante : sans danger.
      }
    }
  };
}

export async function mountAngularLiveDemo(
  container: HTMLElement,
  key: LiveDemoKey,
  fr: boolean
): Promise<IslandHandle> {
  const { mountAngularIsland } = await import("./angular-island.js");
  let current: IslandHandle | null = null;
  let disposed = false;

  if (key === "modal") {
    const state = { confirmOpen: false, footerOpen: false };
    const render = async () => {
      current?.unmount();
      current = null;
      if (disposed) return;
      const { createModalDemoNodes } = await import("./live-demos/angular/ModalDemo.js");
      current = await mountAngularIsland(container, createModalDemoNodes(fr, state, setState));
    };
    const setState = (next: Partial<typeof state>) => {
      Object.assign(state, next);
      void render();
    };

    await render();
  } else {
    const state = { rightOpen: false, leftOpen: false, footerOpen: false };
    const render = async () => {
      current?.unmount();
      current = null;
      if (disposed) return;
      const { createDrawerDemoNodes } = await import("./live-demos/angular/DrawerDemo.js");
      current = await mountAngularIsland(container, createDrawerDemoNodes(fr, state, setState));
    };
    const setState = (next: Partial<typeof state>) => {
      Object.assign(state, next);
      void render();
    };

    await render();
  }

  return {
    unmount() {
      disposed = true;
      current?.unmount();
      current = null;
    }
  };
}
