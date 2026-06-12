// Île React : monte un arbre NodeSpec dans un conteneur DOM en utilisant le
// vrai package @sentropic/design-system-react.
//
// 100 % côté client : tous les imports (react, react-dom/client, package React)
// sont dynamiques pour rester hors du bundle SSR/prerender. La fonction renvoie
// un handle { unmount } afin que l'appelant démonte proprement au changement de
// framework ou à la destruction du composant.

import type { NodeSpec } from "./examples.js";
import { isComponentNode, isElementNode } from "./examples.js";

export interface IslandHandle {
  unmount(): void;
}

export async function mountReactIsland(
  container: HTMLElement,
  nodes: NodeSpec[]
): Promise<IslandHandle> {
  const [React, { createRoot }, dsReact] = await Promise.all([
    import("react"),
    import("react-dom/client"),
    import("@sentropic/design-system-react")
  ]);

  const components = dsReact as unknown as Record<
    string,
    React.ComponentType<Record<string, unknown>>
  >;

  let key = 0;
  function toElement(node: NodeSpec): React.ReactNode {
    if (typeof node === "string") {
      return node;
    }
    const k = `n${key++}`;
    if (isComponentNode(node)) {
      const Comp = components[node.comp];
      const children = (node.children ?? []).map(toElement);
      return React.createElement(
        Comp,
        { key: k, ...(node.props ?? {}) },
        children.length ? children : undefined
      );
    }
    if (isElementNode(node)) {
      const props = mapElementProps(node.props ?? {});
      const children = (node.children ?? []).map(toElement);
      return React.createElement(
        node.el,
        { key: k, ...props },
        children.length ? children : undefined
      );
    }
    return null;
  }

  const tree = React.createElement(React.Fragment, null, nodes.map(toElement));
  const root = createRoot(container);
  root.render(tree);

  return {
    unmount() {
      root.unmount();
    }
  };
}

// React utilise `className` au lieu de `class` sur les éléments natifs, et
// exige un OBJET pour `style` (un string déclenche une erreur de rendu qui fait
// planter toute l'île : d'où les rendus React vides). On convertit donc une
// chaîne CSS (`"a:b;c:d"`, partagée telle quelle avec Svelte/Vue) en objet de
// style React (camelCase) avant de la transmettre.
function mapElementProps(props: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (key === "class") {
      out.className = value;
    } else if (key === "style" && typeof value === "string") {
      out.style = parseStyleString(value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

// Convertit une chaîne `style` CSS en objet de style React. Les noms de
// propriétés en kebab-case sont mappés en camelCase (ex. `align-items` ->
// `alignItems`) ; les custom properties (`--st-*`) restent intactes.
function parseStyleString(css: string): Record<string, string> {
  const style: Record<string, string> = {};
  for (const declaration of css.split(";")) {
    const colon = declaration.indexOf(":");
    if (colon === -1) continue;
    const rawProp = declaration.slice(0, colon).trim();
    const value = declaration.slice(colon + 1).trim();
    if (!rawProp || !value) continue;
    const prop = rawProp.startsWith("--")
      ? rawProp
      : rawProp.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    style[prop] = value;
  }
  return style;
}
