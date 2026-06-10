// Île Vue : monte un arbre NodeSpec dans un conteneur DOM en utilisant le vrai
// package @sentropic/design-system-vue.
//
// 100 % côté client : tous les imports (vue, package Vue) sont dynamiques pour
// rester hors du bundle SSR/prerender. Les composants Vue du DS sont des
// composants à fonction de rendu (defineComponent + h), donc aucun compilateur
// SFC n'est requis : on construit l'arbre directement avec `h`.

import type { NodeSpec } from "./examples.js";
import { isComponentNode, isElementNode } from "./examples.js";
import type { IslandHandle } from "./react-island.js";

export type { IslandHandle } from "./react-island.js";

export async function mountVueIsland(
  container: HTMLElement,
  nodes: NodeSpec[]
): Promise<IslandHandle> {
  const [{ createApp, h, defineComponent }, dsVue] = await Promise.all([
    import("vue"),
    import("@sentropic/design-system-vue")
  ]);

  const components = dsVue as unknown as Record<string, unknown>;

  function toVNode(node: NodeSpec): unknown {
    if (typeof node === "string") {
      return node;
    }
    if (isComponentNode(node)) {
      const Comp = components[node.comp];
      const children = (node.children ?? []).map(toVNode);
      return h(
        Comp as never,
        { ...(node.props ?? {}) },
        children.length ? { default: () => children } : undefined
      );
    }
    if (isElementNode(node)) {
      const children = (node.children ?? []).map(toVNode);
      return h(
        node.el,
        { ...(node.props ?? {}) },
        (children.length ? children : undefined) as never
      );
    }
    return null;
  }

  const Root = defineComponent({
    name: "FrameworkPreviewVueRoot",
    setup() {
      return () => nodes.map(toVNode);
    }
  });

  const app = createApp(Root);
  app.mount(container);

  // Teardown défensif et idempotent.
  //
  // Pourquoi : l'hôte DOM (`container`) est PARTAGÉ entre les îles d'un même
  // TabbedExample (svelte inline / react / vue). Au changement d'onglet, l'île
  // entrante (`createRoot(container)` côté React, ou le rendu Svelte) peut vider
  // / remplacer les enfants de l'hôte AVANT que `app.unmount()` de l'ancienne
  // île Vue n'ait fini de parcourir son arbre. Vue marche alors sur des ancres
  // de fragment déjà détachées → `unmountComponent` lève (`reading 'nextSibling'`
  // en dev, `reading '$set'` sur le build minifié, même chemin de teardown).
  //
  // Garde-fous :
  //   • `disposed` rend `unmount()` idempotent (Vue 3 interdit un double
  //     `app.unmount()` sur la même app) ;
  //   • on n'appelle `app.unmount()` qu'une fois, puis on lâche la référence ;
  //   • le try/catch absorbe un teardown qui marcherait sur un DOM déjà retiré
  //     par l'île entrante — le rendu reste correct, la console reste propre.
  let appRef: ReturnType<typeof createApp> | null = app;
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
        // Teardown sur un hôte déjà nettoyé par l'île entrante : sans danger,
        // l'app est de toute façon abandonnée. On garde la console propre.
      }
    }
  };
}
