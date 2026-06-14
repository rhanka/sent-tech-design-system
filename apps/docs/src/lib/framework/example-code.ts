import type { ComponentName, FrameworkExample, FrameworkId, NodeSpec } from "./examples";
import { isComponentNode, isElementNode } from "./examples";
import { nodeToCode } from "./nodeToCode";

const PACKAGES: Record<FrameworkId, string> = {
  svelte: "@sentropic/design-system-svelte",
  react: "@sentropic/design-system-react",
  vue: "@sentropic/design-system-vue",
  angular: "@sentropic/design-system-angular"
};

export function frameworkPackage(framework: FrameworkId): string {
  return PACKAGES[framework];
}

export function exampleCode(example: FrameworkExample, framework: FrameworkId): string {
  const explicit = example.code[framework];
  if (explicit) return explicit;
  if (framework === "angular") return angularExampleCode(example.nodes);
  return "";
}

function angularExampleCode(nodes: NodeSpec[]): string {
  const components = collectComponents(nodes);
  const componentImports = components.length
    ? `import { ${components.join(", ")} } from "@sentropic/design-system-angular";\n`
    : "";
  const angularImports = components.length ? `  imports: [${components.join(", ")}],\n` : "";
  const template = indent(escapeTemplateLiteral(nodeToCode(nodes, "angular")), "    ");

  return `import { Component } from "@angular/core";
${componentImports}
@Component({
  selector: "demo",
  standalone: true,
${angularImports}  template: \`
${template}
  \`
})
export class DemoComponent {}`;
}

function collectComponents(nodes: NodeSpec[]): ComponentName[] {
  const found = new Set<ComponentName>();

  function visit(node: NodeSpec): void {
    if (typeof node === "string") return;
    if (isComponentNode(node)) {
      found.add(node.comp);
      for (const child of node.children ?? []) visit(child);
      return;
    }
    if (isElementNode(node)) {
      for (const child of node.children ?? []) visit(child);
    }
  }

  for (const node of nodes) visit(node);
  return [...found].sort();
}

function escapeTemplateLiteral(value: string): string {
  return value.replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

function indent(value: string, prefix: string): string {
  return value
    .split("\n")
    .map((line) => `${prefix}${line}`)
    .join("\n");
}
