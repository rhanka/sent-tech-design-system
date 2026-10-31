/**
 * Minimal ambient declaration for `bpmn-moddle` (MIT, 10.3.1): the package
 * ships generated element types under `./types` but no declaration for the
 * `"."` entry's `BpmnModdle` class, which is the only surface the F1 adapter
 * uses (`create`, `toXML`, `$descriptor.properties`).
 */

declare module "bpmn-moddle" {
  export interface ModdlePropertyDescriptor {
    readonly name: string;
    readonly isReference?: boolean;
    readonly isMany?: boolean;
  }

  export interface ModdleElement {
    readonly $descriptor: { readonly properties: readonly ModdlePropertyDescriptor[] };
    // Writable: the adapter resolves references by writing the referenced
    // element back into the property slot (moddle elements are plain objects).
    [property: string]: unknown;
  }

  export class BpmnModdle {
    create(type: string, attrs?: Record<string, unknown>): ModdleElement;
    toXML(element: ModdleElement, options?: { format?: boolean }): Promise<{ xml: string }>;
  }
}
