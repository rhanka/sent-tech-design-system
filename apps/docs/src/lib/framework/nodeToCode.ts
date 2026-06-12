// nodeToCode : sérialise un arbre NodeSpec en extrait de code lisible pour un
// framework donné (Svelte / React / Vue).
//
// Best-effort : sert à alimenter le bloc « Voir le code » dépliable de
// TabbedExample. Le but est un rendu propre et copiable, pas un AST exact.
//   • Svelte / Vue   → <Button variant="primary">Primary</Button>
//   • React          → <Button variant="primary">Primary</Button> (class → className)
// Gère les props string / boolean / number / objet, et les enfants chaîne ou
// NodeSpec récursifs. Les wrappers de mise en page internes (div.fp-row /
// div.fp-stack) sont dépliés pour ne montrer que les éléments utiles.

import type { FrameworkId, NodeSpec } from "./examples";
import { isComponentNode, isElementNode } from "./examples";

/** Nom d'attribut selon le framework (React utilise className pour class). */
function attrName(key: string, fw: FrameworkId): string {
  if (key === "class") return fw === "react" ? "className" : "class";
  return key;
}

/** Entoure une chaîne de guillemets en évitant les conflits de quotes. */
function quote(value: string): string {
  if (!value.includes('"')) return `"${value}"`;
  if (!value.includes("'")) return `'${value}'`;
  return `"${value.replace(/"/g, '\\"')}"`;
}

/** Sérialise un objet/array en littéral JS lisible pour le framework. */
function jsonish(value: unknown, fw: FrameworkId): string {
  const json = JSON.stringify(value);
  if (fw === "vue") {
    // L'expression vit dans :prop="…" (guillemets doubles) → quotes simples dedans.
    return json.replace(/"/g, "'");
  }
  return json;
}

/** Construit la chaîne d'un attribut, ou null s'il doit être omis. */
function formatProp(key: string, value: unknown, fw: FrameworkId): string | null {
  if (value === undefined || value === null) return null;
  const name = attrName(key, fw);

  if (typeof value === "string") {
    return `${name}=${quote(value)}`;
  }
  if (typeof value === "boolean") {
    if (value) return name; // raccourci booléen vrai (disabled, invalid, …)
    return fw === "vue" ? `:${name}="false"` : `${name}={false}`;
  }
  if (typeof value === "number") {
    return fw === "vue" ? `:${name}="${value}"` : `${name}={${value}}`;
  }
  // objet / array
  const literal = jsonish(value, fw);
  return fw === "vue" ? `:${name}="${literal}"` : `${name}={${literal}}`;
}

/** Vrai pour les wrappers de mise en page internes (fp-row / fp-stack). */
function isLayoutWrapper(node: NodeSpec): boolean {
  return (
    isElementNode(node) &&
    node.el === "div" &&
    typeof node.props?.class === "string" &&
    (node.props.class as string).startsWith("fp-")
  );
}

function renderTag(
  tag: string,
  props: Record<string, unknown>,
  children: NodeSpec[],
  fw: FrameworkId,
  indent: string
): string {
  const attrs = Object.entries(props)
    .map(([k, v]) => formatProp(k, v, fw))
    .filter((a): a is string => a !== null);
  const single = attrs.length ? " " + attrs.join(" ") : "";

  const selfInline = `${indent}<${tag}${single} />`;
  const multilineAttrs = attrs.length > 1 && selfInline.length > 84;
  const attrBlock = attrs.map((a) => `${indent}  ${a}`).join("\n");

  // Sans enfant : balise auto-fermante.
  if (children.length === 0) {
    if (multilineAttrs) return `${indent}<${tag}\n${attrBlock}\n${indent}/>`;
    return selfInline;
  }

  // Enfants tous textuels : sur une ligne.
  if (children.every((c) => typeof c === "string")) {
    const text = children.join("");
    if (multilineAttrs) return `${indent}<${tag}\n${attrBlock}\n${indent}>${text}</${tag}>`;
    return `${indent}<${tag}${single}>${text}</${tag}>`;
  }

  // Enfants imbriqués : indentés.
  const inner = children.map((c) => nodeToString(c, fw, indent + "  ")).join("\n");
  if (multilineAttrs) {
    return `${indent}<${tag}\n${attrBlock}\n${indent}>\n${inner}\n${indent}</${tag}>`;
  }
  return `${indent}<${tag}${single}>\n${inner}\n${indent}</${tag}>`;
}

function nodeToString(node: NodeSpec, fw: FrameworkId, indent: string): string {
  if (typeof node === "string") return `${indent}${node}`;
  if (isComponentNode(node)) {
    return renderTag(node.comp, node.props ?? {}, node.children ?? [], fw, indent);
  }
  if (isElementNode(node)) {
    return renderTag(node.el, node.props ?? {}, node.children ?? [], fw, indent);
  }
  return "";
}

/** Sérialise une liste de NodeSpec en extrait de code du framework demandé. */
export function nodeToCode(nodes: NodeSpec[], fw: FrameworkId): string {
  const flat: NodeSpec[] = [];
  for (const node of nodes) {
    if (isLayoutWrapper(node) && isElementNode(node)) {
      flat.push(...(node.children ?? []));
    } else {
      flat.push(node);
    }
  }
  return flat.map((node) => nodeToString(node, fw, "")).join("\n");
}
