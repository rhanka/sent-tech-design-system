// Ile Angular : monte un arbre NodeSpec dans un conteneur DOM avec le vrai
// package @sentropic/design-system-angular.
//
// 100 % cote client : Angular et le package DS Angular sont importes
// dynamiquement. Le compilateur Angular est charge avant le DS parce que la
// librairie locale est publiee en compilation partielle et n'est pas linkee par
// le build SvelteKit. Les styles globaux .st-* sont deja charges par le layout
// via le CSS React, byte-identique au CSS Angular.
//
// Pourquoi un composant hote compile a la volee (JIT) plutot qu'un arbre de
// `createComponent` imbriques : une requete `@ContentChildren` ne resout QUE du
// contenu declare dans un template. Des instances creees par `createComponent`
// et passees en `projectableNodes` sont des noeuds DOM projetes, jamais des
// noeuds de template : la requete ne les voit pas, et un composant parent qui
// coordonne ses enfants (PanelStack -> PanelSection : forme, section depliee,
// unique proprietaire du defilement) ne decouvre rien du tout. L'echec est
// silencieux — pas d'exception, juste un rendu faux qui contredit la page.
// On genere donc un composant hote dont le TEMPLATE contient l'arbre complet :
// les enfants redeviennent du contenu declare, les requetes de contenu les
// voient, et la coordination parent/enfant fonctionne comme dans une
// application Angular ordinaire. Le compilateur JIT est deja charge ci-dessus
// (le package est publie en compilation partielle, donc deja linke a chaud).

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

type AngularCore = typeof import("@angular/core");

interface AngularRuntime {
  app: ApplicationRef;
  core: AngularCore;
}

/** Definition Ivy d'un composant, lue en reflexion pour generer le template. */
type IvyComponentDef = {
  selectors?: unknown[][];
  inputs?: Record<string, unknown>;
  outputs?: Record<string, unknown>;
};

/** Elements HTML sans balise fermante : Angular refuse `<br></br>`. */
const VOID_ELEMENTS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
]);

/** Attribut statique pose sur les noeuds `el` du template genere. Une
 *  directive y reagit a la creation de l'element pour lui appliquer
 *  `applyElementProps` (semantique propriete/attribut/booleen inchangee), puis
 *  le retire. */
const ELEMENT_MARKER = "data-st-island-el";

/** Element hote du composant genere, cree par l'ile dans le conteneur. */
const ISLAND_HOST_TAG = "st-docs-angular-island";

const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;
const TAG_NAME = /^[a-zA-Z][a-zA-Z0-9-]*$/;

/** Etat de generation d'un plan de montage. */
interface IslandPlan {
  template: string;
  imports: Type<unknown>[];
  /** Props par index de noeud, lues par les liaisons `[input]` du template. */
  values: Record<string, unknown>[];
  /** Props des noeuds `el`, appliquees a la creation de chaque element. */
  elements: Array<{ index: number; props: Record<string, unknown> }>;
}

/** Instance du composant hote genere : uniquement des donnees + un relais
 *  d'evenement. Les noms `v`/`fire` sont cites par le template genere. */
class AngularIslandHost {
  v: Record<string, unknown>[] = [];

  fire(index: number, key: string, event: unknown): void {
    const handler = this.v[index]?.[key];
    if (typeof handler === "function") (handler as (arg: unknown) => void)(event);
  }
}

export async function mountAngularIsland(
  container: HTMLElement,
  nodes: NodeSpec[]
): Promise<IslandHandle> {
  const dsAngular = await loadAngularDesignSystem();
  const runtime = await createAngularRuntime();

  const plan = planIsland(nodes, dsAngular);
  const HostComponent = compileIslandHost(runtime.core, plan);

  // Angular RETIRE du document l'element hote d'une vue racine quand on la
  // detache (`detachView`, `destroy`). Le conteneur appartient a la page
  // (Svelte) et sert aux iles suivantes — changement d'onglet, re-rendu d'une
  // demo live a chaque clic : il ne doit jamais etre cet hote. On donne donc a
  // Angular un element a lui, sans boite (`display: contents`), pour que les
  // noeuds de la demo restent des enfants de mise en page du conteneur,
  // exactement comme avant.
  const host = container.ownerDocument.createElement(ISLAND_HOST_TAG);
  host.style.display = "contents";
  container.replaceChildren(host);

  const ref = runtime.core.createComponent(HostComponent, {
    environmentInjector: runtime.app.injector as EnvironmentInjector,
    hostElement: host
  }) as ComponentRef<AngularIslandHost>;

  // Les valeurs doivent etre en place avant la premiere detection de
  // changement : c'est elle qui applique les liaisons `[input]`.
  ref.instance.v = plan.values;

  runtime.app.attachView(ref.hostView);
  runtime.app.tick();

  // `createComponent` estampille l'element hote d'un `ng-version` que personne
  // ne lit.
  host.removeAttribute("ng-version");

  let disposed = false;
  return {
    unmount() {
      if (disposed) return;
      disposed = true;
      try {
        runtime.app.detachView(ref.hostView);
        ref.destroy();
      } catch {
        // L'hote a pu etre vide par une ile entrante ; le ref est abandonne.
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

// --- Generation du plan ----------------------------------------------------

function planIsland(nodes: NodeSpec[], dsAngular: AngularComponents): IslandPlan {
  const plan: IslandPlan = { template: "", imports: [], values: [], elements: [] };
  const seen = new Set<Type<unknown>>();

  const nextIndex = (props: Record<string, unknown>): number => {
    plan.values.push(props);
    return plan.values.length - 1;
  };

  const emit = (node: NodeSpec): string => {
    if (typeof node === "string") return escapeText(node);

    if (isElementNode(node)) {
      const tag = TAG_NAME.test(node.el) ? node.el : "div";
      const props = node.props ?? {};
      const index = nextIndex(props);
      plan.elements.push({ index, props });
      const open = `<${tag} ${ELEMENT_MARKER}="${index}">`;
      if (VOID_ELEMENTS.has(tag)) return open;
      return `${open}${(node.children ?? []).map(emit).join("")}</${tag}>`;
    }

    if (isComponentNode(node)) {
      const Comp = dsAngular[node.comp];
      if (!Comp) {
        // Placeholder pose par le template, habille par `applyElementProps` :
        // Angular applique toujours une classe statique en dernier, l'ordre des
        // attributs du marqueur resterait sinon different de l'ancien rendu.
        const props = { class: "angular-island-unavailable", role: "status" };
        const index = nextIndex(props);
        plan.elements.push({ index, props });
        return `<div ${ELEMENT_MARKER}="${index}">${escapeText(
          `Angular component missing: ${node.comp}`
        )}</div>`;
      }

      if (!seen.has(Comp)) {
        seen.add(Comp);
        plan.imports.push(Comp);
      }

      const def = componentDef(Comp);
      const tag = componentHostTag(Comp);
      const props = node.props ?? {};
      const index = nextIndex(props);
      const bindings = componentBindings(node.comp, props, def, index);
      const children = (node.children ?? []).map(emit).join("");
      return `<${tag}${bindings}>${children}</${tag}>`;
    }

    return "";
  };

  plan.template = nodes.map(emit).join("");
  return plan;
}

/**
 * Traduit les props d'un noeud composant en liaisons de template, en se
 * reglant sur la definition Ivy du composant pour rester a l'identique du
 * montage imperatif precedent :
 *   - `onXxx` fonction -> `(xxx)` si `xxx` est un @Output declare, sinon
 *     `(xxx en minuscules)`, c'est-a-dire un ecouteur DOM sur l'hote — les
 *     deux branches de l'ancien `wireComponentEvent`, decidees sur la
 *     definition plutot que sur l'instance ;
 *   - toute autre cle DECLAREE comme @Input -> `[cle]`, l'equivalent template
 *     de `ComponentRef.setInput` (alias, `ngOnChanges` et marquage compris).
 * Une cle qui n'est ni l'un ni l'autre etait deja sans effet (`setInput`
 * l'ignore hors mode dev, ou leve) : on la signale et on l'ignore.
 */
function componentBindings(
  componentName: string,
  props: Record<string, unknown>,
  def: IvyComponentDef,
  index: number
): string {
  const inputs = def.inputs ?? {};
  const outputs = def.outputs ?? {};
  let out = "";

  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith("on") && typeof value === "function") {
      const eventName = key.slice(2, 3).toLowerCase() + key.slice(3);
      const bound = Object.prototype.hasOwnProperty.call(outputs, eventName)
        ? eventName
        : eventName.toLowerCase();
      out += ` (${bound})="fire(${index},'${escapeExpressionString(key)}',$event)"`;
      continue;
    }

    if (!Object.prototype.hasOwnProperty.call(inputs, key)) {
      console.warn(
        `[angular-island] "${key}" n'est pas un @Input declare de ${componentName} — prop ignoree.`
      );
      continue;
    }

    // Un @Input peut porter un nom public qui n'est pas un identifiant
    // (`@Input("aria-label")`) : l'acces indexe couvre les deux cas.
    const read = IDENTIFIER.test(key)
      ? `v[${index}].${key}`
      : `v[${index}]['${escapeExpressionString(key)}']`;
    out += ` [${key}]="${read}"`;
  }

  return out;
}

function compileIslandHost(core: AngularCore, plan: IslandPlan): Type<AngularIslandHost> {
  const propsByIndex = new Map(plan.elements.map((entry) => [entry.index, entry.props]));

  // Applique les props d'un noeud `el` au moment ou Angular cree l'element
  // (attributs statiques deja poses, enfants pas encore crees) — le meme
  // instant que l'ancien montage imperatif. Cela vaut aussi pour un element
  // projete dans une vue qui ne sera creee que plus tard, par exemple le corps
  // d'un Collapsible ouvert par l'utilisateur : l'element, declare dans CE
  // template, existe des la creation de la vue hote, meme detache du document.
  const ElementPropsDirective = class {
    constructor() {
      const element = core.inject(core.ElementRef).nativeElement as HTMLElement;
      const props = propsByIndex.get(Number(element.getAttribute(ELEMENT_MARKER)));
      element.removeAttribute(ELEMENT_MARKER);
      if (props) applyElementProps(element, props);
    }
  };
  core.Directive({ selector: `[${ELEMENT_MARKER}]`, standalone: true })(ElementPropsDirective);

  // Une classe NEUVE par montage : le template genere lui est propre.
  const HostClass = class extends AngularIslandHost {};
  return core.Component({
    selector: ISLAND_HOST_TAG,
    standalone: true,
    imports: [...plan.imports, ElementPropsDirective],
    encapsulation: core.ViewEncapsulation.None,
    // Les textes du NodeSpec sont du contenu, pas de la mise en forme de
    // template : Angular ne doit ni les recadrer ni supprimer ceux qui ne
    // contiennent que des espaces.
    preserveWhitespaces: true,
    template: plan.template
  })(HostClass) as unknown as Type<AngularIslandHost>;
}

// --- Echappements ----------------------------------------------------------

/** Texte litteral dans un template Angular : entites HTML + accolades neutralisees
 *  pour qu'aucune chaine du NodeSpec ne soit lue comme une interpolation. */
function escapeText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\{/g, "&#123;")
    .replace(/\}/g, "&#125;");
}

function escapeExpressionString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

// --- Chargement du runtime -------------------------------------------------

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
  return { app, core };
}

function componentDef(component: Type<unknown>): IvyComponentDef {
  return (component as Type<unknown> & { ɵcmp?: IvyComponentDef }).ɵcmp ?? {};
}

function componentHostTag(component: Type<unknown>): string {
  const selector = componentDef(component)
    .selectors?.flat()
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
