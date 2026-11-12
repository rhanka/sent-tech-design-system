/** Host-only resolution seam. References are opaque; the renderer never fetches. */
export interface DiagramResolutionContext {
  readonly diagramId: string;
  readonly targetRef: string;
  readonly documentRef: string;
  readonly renderComponent: string;
  readonly alt: string;
}

export interface ResolvedDiagram {
  readonly component: string;
  readonly props: Readonly<Record<string, unknown>>;
}

/** An envelope root is also accepted, with component props beside its id. */
export interface DiagramEnvelopeRoot {
  readonly component: string;
  readonly id: string;
  readonly [prop: string]: unknown;
}

export type DiagramResolver = (
  sourceRef: string,
  context: DiagramResolutionContext,
) => ResolvedDiagram | DiagramEnvelopeRoot | null | undefined |
  Promise<ResolvedDiagram | DiagramEnvelopeRoot | null | undefined>;
