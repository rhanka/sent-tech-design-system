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

  return {
    unmount() {
      app.unmount();
    }
  };
}
