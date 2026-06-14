// Ile Angular : monte un arbre NodeSpec dans un conteneur DOM avec le vrai
// package @sentropic/design-system-angular.
//
// 100 % cote client : Angular et le package DS Angular sont importes
// dynamiquement. Le compilateur Angular est charge avant le DS parce que la
// librairie locale est publiee en compilation partielle et n'est pas linkee par
// le build SvelteKit. Les styles globaux .st-* sont deja charges par le layout
// via le CSS React, byte-identique au CSS Angular.

import type {
  ApplicationRef,
  ComponentRef,
  EnvironmentInjector,
  Type
} from "@angular/core";
import type { NodeSpec } from "./examples.js";
import { isComponentNode, isElementNode } from "./examples.js";
import type { IslandHandle } from "./react-island.js";

export type { IslandHandle } from "./react-island.js";

type AngularComponents = Record<string, Type<unknown> | undefined>;

interface AngularRuntime {
  app: ApplicationRef;
  createComponent: typeof import("@angular/core").createComponent;
}

export async function mountAngularIsland(
  container: HTMLElement,
  nodes: NodeSpec[]
): Promise<IslandHandle> {
  const dsAngular = await loadAngularDesignSystem();
  const runtime = await createAngularRuntime();
  const refs: ComponentRef<unknown>[] = [];
  const cleanups: Array<() => void> = [];

  function toDomNode(node: NodeSpec): Node {
    if (typeof node === "string") {
      return container.ownerDocument.createTextNode(node);
    }

    if (isElementNode(node)) {
      const element = container.ownerDocument.createElement(node.el);
      applyElementProps(element, node.props ?? {});
      element.append(...(node.children ?? []).map(toDomNode));
      return element;
    }

    if (isComponentNode(node)) {
      const Comp = dsAngular[node.comp];
      if (!Comp) {
        return missingComponentNode(container, node.comp);
      }

      const host = container.ownerDocument.createElement(componentHostTag(Comp));
      const projectableNodes = (node.children ?? []).map(toDomNode);
      const ref = runtime.createComponent(Comp, {
        environmentInjector: runtime.app.injector as EnvironmentInjector,
        hostElement: host,
        projectableNodes: projectableNodes.length ? [projectableNodes] : undefined
      });

      runtime.app.attachView(ref.hostView);
      for (const [key, value] of Object.entries(node.props ?? {})) {
        if (key.startsWith("on") && typeof value === "function") {
          cleanups.push(wireComponentEvent(host, ref, key, value as EventListener));
        } else {
          ref.setInput(key, value);
        }
      }
      refs.push(ref);
      return host;
    }

    return container.ownerDocument.createTextNode("");
  }

  container.replaceChildren(...nodes.map(toDomNode));
  runtime.app.tick();

  let disposed = false;
  return {
    unmount() {
      if (disposed) return;
      disposed = true;
      for (const cleanup of cleanups.splice(0).reverse()) cleanup();
      for (const ref of refs.slice().reverse()) {
        try {
          runtime.app.detachView(ref.hostView);
          ref.destroy();
        } catch {
          // L'hote a pu etre vide par une ile entrante ; le ref est abandonne.
        }
      }
      try {
        runtime.app.destroy();
      } catch {
        // Teardown deja declenche par Angular : sans consequence.
      }
      container.replaceChildren();
    }
  };
}

function wireComponentEvent(
  host: HTMLElement,
  ref: ComponentRef<unknown>,
  propName: string,
  listener: EventListener
): () => void {
  const eventName = propName.slice(2, 3).toLowerCase() + propName.slice(3);
  const instance = ref.instance as Record<string, unknown>;
  const output = instance[eventName] as { subscribe?: (fn: EventListener) => { unsubscribe(): void } };

  if (output && typeof output.subscribe === "function") {
    const subscription = output.subscribe(listener);
    return () => subscription.unsubscribe();
  }

  const domEvent = eventName.toLowerCase();
  host.addEventListener(domEvent, listener);
  return () => host.removeEventListener(domEvent, listener);
}

async function loadAngularDesignSystem(): Promise<AngularComponents> {
  await import("@angular/compiler");
  return (await import("@sentropic/design-system-angular")) as unknown as AngularComponents;
}

async function createAngularRuntime(): Promise<AngularRuntime> {
  const [{ createApplication }, core] = await Promise.all([
    import("@angular/platform-browser"),
    import("@angular/core")
  ]);
  const app = await createApplication({
    providers: [core.provideZonelessChangeDetection()]
  });
  return { app, createComponent: core.createComponent };
}

function componentHostTag(component: Type<unknown>): string {
  const selectors = (
    component as Type<unknown> & {
      ɵcmp?: { selectors?: unknown[][] };
    }
  ).ɵcmp?.selectors;
  const selector = selectors
    ?.flat()
    .find((part): part is string => typeof part === "string" && /^[a-z]/.test(part));
  return selector ?? "div";
}

function applyElementProps(element: HTMLElement, props: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null) continue;

    if (key === "class") {
      element.setAttribute("class", String(value));
      continue;
    }

    if (key === "style" && typeof value === "string") {
      element.setAttribute("style", value);
      continue;
    }

    if (key.startsWith("on") && typeof value === "function") {
      element.addEventListener(key.slice(2).toLowerCase(), value as EventListener);
      continue;
    }

    if (typeof value === "boolean") {
      (element as unknown as Record<string, unknown>)[key] = value;
      if (value) element.setAttribute(key, "");
      continue;
    }

    if (key.startsWith("aria-") || key.startsWith("data-")) {
      element.setAttribute(key, String(value));
      continue;
    }

    if (key in element) {
      (element as unknown as Record<string, unknown>)[key] = value;
    } else {
      element.setAttribute(key, String(value));
    }
  }
}

function missingComponentNode(container: HTMLElement, componentName: string): HTMLElement {
  const node = container.ownerDocument.createElement("div");
  node.className = "angular-island-unavailable";
  node.setAttribute("role", "status");
  node.textContent = `Angular component missing: ${componentName}`;
  return node;
}
