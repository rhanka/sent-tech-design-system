import { getValidator, registerPort } from './validator.js';
import { normalizeEnvelopeInput } from '../validate/envelope.js';
import { engineLoadFailed, type Diagnostic } from '../validate/diagnostics.js';
import { bpmnWatermark, type HostConfig, type BpmnPayload } from './bpmn-types.js';
export type { HostConfig, BpmnPayload } from './bpmn-types.js';
export type { Diagnostic } from '../validate/diagnostics.js';

/** Shared Svelte/Vue envelope boundary. Validate before loading the BPMN engine. */
export async function prepareBpmnEnvelope(envelope: unknown, hostConfig?: HostConfig): Promise<{
  payload: BpmnPayload | null; diagnostics: readonly Diagnostic[];
}> {
  try {
    const normalized = normalizeEnvelopeInput(envelope);
    const input = normalized.ok ? normalized.value : envelope;
    const first = getValidator().validate(input);
    const component = (input as { root?: { component?: unknown } })?.root?.component;
    if (typeof component === 'string' && component !== 'BpmnCanvas') return { payload: null, diagnostics: [{
      code: 'unknown-component', path: '/root/component',
      message: `<st-bpmn-canvas> requires root.component "BpmnCanvas", got "${component}"`,
      severity: 'error', source: 'catalog', detail: { expected: 'BpmnCanvas', found: component },
    }] };
    const errors = first.filter(diagnostic => diagnostic.severity === 'error');
    if (!normalized.ok || (errors.length > 0 && !errors.every(diagnostic => diagnostic.code === 'host-capability-missing' &&
      (diagnostic.detail as { chunk?: unknown } | undefined)?.chunk === 'bpmn-canvas'))) return { payload: null, diagnostics: first };
    const engine = await import('./dom/engines/bpmn-canvas.js');
    registerPort('bpmn-canvas', engine.port);
    const diagnostics = getValidator().validate(input);
    if (diagnostics.some(diagnostic => diagnostic.severity === 'error')) return { payload: null, diagnostics };
    const result = await engine.toXml((input as { root: { document: unknown } }).root.document);
    if (!result.ok) return { payload: null, diagnostics: [{ code: 'semantic-invalid', path: '/root/document',
      message: result.message, severity: 'error', source: 'bpmn-canvas', detail: { code: result.code } }] };
    return { diagnostics, payload: { kind: 'bpmn', xml: result.xml,
      assetBase: typeof hostConfig?.assetBase === 'string' ? hostConfig.assetBase : undefined,
      watermark: bpmnWatermark(hostConfig) } };
  } catch (error) {
    return { payload: null, diagnostics: [engineLoadFailed('bpmn-canvas', error instanceof Error ? error.message : String(error))] };
  }
}
