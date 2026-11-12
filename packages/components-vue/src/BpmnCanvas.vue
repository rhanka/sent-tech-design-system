<script setup lang="ts">
defineOptions({ name: 'BpmnCanvas' });
import { computed, nextTick, onMounted, onUnmounted, shallowRef, watch } from 'vue';
import type { HostConfig, Diagnostic } from '@sentropic/design-system-elements/bpmn';
export interface BpmnCanvasProps {
    envelope?: unknown;
    hostConfig?: HostConfig;
}
const props = defineProps<BpmnCanvasProps>();
const root = shallowRef<HTMLElement>();
const body = shallowRef<HTMLElement>();
const state = shallowRef<'idle' | 'rendering' | 'rendered' | 'refused'>('idle');
const diagnostics = shallowRef<readonly Diagnostic[]>([]);
let firstTerminal!: () => void;
const ready = new Promise<void>(resolve => { firstTerminal = resolve; });
watch(state, value => { if (value === 'rendered' || value === 'refused')
    firstTerminal(); });
const islandHostConfig = shallowRef<HostConfig>();
const effectiveHostConfig = computed(() => props.hostConfig ?? islandHostConfig.value);
const theme = computed(() => ['sent-tech', 'forge', 'entropic'].includes(String(effectiveHostConfig.value?.theme)) ? String(effectiveHostConfig.value?.theme) : 'sent-tech');
const colorMode = computed(() => effectiveHostConfig.value?.colorScheme === 'light' || effectiveHostConfig.value?.colorScheme === 'dark' ? effectiveHostConfig.value.colorScheme : undefined);
let ticket = 0;
let stop: (() => void) | undefined;
let controller: AbortController | undefined;
let mounted = false;
let observer: MutationObserver | undefined;
async function ingest() {
    if (!mounted)
        return;
    const mine = ++ticket;
    controller?.abort();
    controller = new AbortController();
    const signal = controller.signal;
    stop?.();
    stop = undefined;
    state.value = 'rendering';
    let envelope = props.envelope;
    if (envelope === undefined) {
        const island = root.value?.querySelector('script[type="application/json"]');
        if (island) {
            try {
                envelope = JSON.parse(island.textContent ?? '');
            }
            catch {
                envelope = island.textContent;
            }
        }
    }
    const { prepareBpmnEnvelope } = await import('@sentropic/design-system-elements/bpmn');
    if (mine !== ticket)
        return;
    const prepared = await prepareBpmnEnvelope(envelope, effectiveHostConfig.value);
    if (mine !== ticket)
        return;
    diagnostics.value = prepared.diagnostics;
    if (prepared.payload === null) {
        state.value = 'refused';
        return;
    }
    state.value = 'rendered';
    await nextTick();
    const { renderBpmn } = await import('@sentropic/design-system-elements/bpmn-mount');
    if (mine !== ticket || body.value === undefined)
        return;
    const cleanup = await renderBpmn(body.value, prepared.payload, diagnostic => {
        if (mine !== ticket)
            return;
        if (!diagnostics.value.some(existing => existing.code === diagnostic.code && existing.path === diagnostic.path && existing.message === diagnostic.message))
            diagnostics.value = [...diagnostics.value, diagnostic];
    }, signal);
    if (mine !== ticket)
        cleanup();
    else
        stop = cleanup;
}
function refresh() {
    const expected = ticket + 1;
    void ingest().catch(error => {
        if (!mounted || ticket !== expected)
            return;
        state.value = 'refused';
        diagnostics.value = [{ code: 'engine-load-failed', path: '', message: String(error), severity: 'error', source: 'host' }];
    });
}
watch(() => [props.envelope, effectiveHostConfig.value], refresh);
onMounted(() => {
    mounted = true;
    const island = document.getElementById('st-host-config');
    try {
        islandHostConfig.value = island ? JSON.parse(island.textContent ?? '') as HostConfig : undefined;
    }
    catch {
        islandHostConfig.value = undefined;
    }
    observer = new MutationObserver(records => {
        const island = (node: Node) => node instanceof Element && (node.matches('script[type="application/json"]') || node.closest('script[type="application/json"]') !== null);
        if (records.some(record => island(record.target) || [...record.addedNodes, ...record.removedNodes].some(island)))
            refresh();
    });
    if (root.value)
        observer.observe(root.value, { childList: true, subtree: true, characterData: true });
    refresh();
});
onUnmounted(() => { mounted = false; ticket += 1; observer?.disconnect(); controller?.abort(); stop?.(); stop = undefined; });
defineExpose({ state, diagnostics, ready });
</script>

<template>
  <div ref="root" class="st-element__root" :data-st-theme="theme" :data-color-mode="colorMode">
    <div v-if="state === 'refused'" class="st-element__error" role="alert" data-st-error>
      <p class="st-element__errorTitle" data-st-error-title>The envelope does not render — {{ diagnostics.length }} {{ diagnostics.length === 1 ? 'diagnostic' : 'diagnostics' }}:</p>
      <ul class="st-element__errorList">
        <li v-for="diagnostic in diagnostics" :key="diagnostic.code + '|' + diagnostic.path + '|' + diagnostic.message" class="st-element__errorItem" data-st-error-item>
          <code class="st-element__errorCode" data-st-error-code>{{ diagnostic.code }}</code>
          <span class="st-element__errorPath" data-st-error-path>{{ diagnostic.path || '(envelope)' }}</span>
          <span class="st-element__errorMessage" data-st-error-message>{{ diagnostic.message }}</span>
        </li>
      </ul>
    </div>
    <div v-else-if="state === 'rendered'" ref="body" class="st-element__body"></div>
    <slot />
  </div>
</template>

<style>
.st-element__root { display: block; }
.st-element__body { min-height: var(--st-component-bpmnCanvas-minHeight); }
.st-element__error { border-radius: var(--st-radius-md); background: var(--st-semantic-surface-subtle); border: var(--st-component-diagramCard-ruleHeight) solid var(--st-semantic-feedback-error); padding: var(--st-spacing-3); color: var(--st-semantic-feedback-error); font-family: inherit; }
.st-element__errorTitle { margin: 0 0 var(--st-spacing-2); font-weight: var(--st-component-diagramCard-titleFontWeight); }
.st-element__errorList { margin: 0; padding: 0; list-style: none; }
.st-element__errorItem { display: grid; grid-template-columns: auto auto 1fr; gap: var(--st-spacing-2); margin: var(--st-spacing-1) 0; font-size: var(--st-component-button-anatomy-density-sm-fontSize); }
.st-element__errorCode, .st-element__errorPath { font-family: var(--st-font-mono); }
</style>
