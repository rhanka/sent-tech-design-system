/** The hostConfig shape the elements read (§6.5). */
export interface HostConfig {
  readonly theme?: unknown;
  readonly colorScheme?: unknown;
  readonly locale?: unknown;
  readonly assetBase?: unknown;
  readonly bpmn?: {
    readonly watermark?: {
      readonly hidden?: unknown;
      readonly license?: unknown;
    };
  };
}

export function bpmnWatermark(hostConfig: HostConfig | undefined):
  | { readonly hidden: true; readonly license: string }
  | undefined {
  const watermark = hostConfig?.bpmn?.watermark;
  if (watermark === undefined) return undefined;
  const { hidden, license } = watermark;
  if (hidden !== true) return undefined;
  if (typeof license !== "string" || license.trim() === "") return undefined;
  return { hidden: true, license };
}

export interface BpmnPayload { readonly kind: 'bpmn'; readonly xml: string; readonly assetBase: string | undefined; readonly watermark: { readonly hidden: true; readonly license: string } | undefined; }
