import { mount, unmount } from 'svelte';
import { createApp, h } from 'vue';
import { compileTheme, sentTechTheme } from '@sentropic/design-system-themes';
import { m3ProfileRegistry, shippedExecutorBindings } from '@sentropic/diagram-core';

import architecture from '../../packages/diagram-canvas/tests/layout/dc2a/fixtures/h-cond/appctx-architecture.semantic.json';
import architectureView from '../../packages/diagram-canvas/tests/layout/dc2a/fixtures/h-cond/appctx-architecture.view-architecture.json';
import schema1 from '../../packages/diagram-core/tests/fixtures/layout-hints-2/schema-1.json';
import schema3 from '../../packages/diagram-core/tests/fixtures/layout-hints-2/schema-3.json';
import schema6 from '../../packages/diagram-core/tests/fixtures/layout-hints-2/schema-6.json';
import schema13 from '../../packages/diagram-core/tests/fixtures/layout-hints-2/schema-13.json';
import ref1 from '../../packages/diagram-core/tests/fixtures/layout-hints-2/ref-1.json';
import ref2 from '../../packages/diagram-core/tests/fixtures/layout-hints-2/ref-2.json';
import ref3 from '../../packages/diagram-core/tests/fixtures/layout-hints-2/ref-3.json';
import archiMetier from '../../packages/diagram-core/tests/fixtures/layout-hints-2/archi-metier.json';
import archiApplicative from '../../packages/diagram-core/tests/fixtures/layout-hints-2/archi-applicative.json';
import archiTechnologique from '../../packages/diagram-core/tests/fixtures/layout-hints-2/archi-technologique.json';
import retroA from '../../packages/diagram-core/tests/fixtures/layout-hints-2/retro-a.json';
import retroB from '../../packages/diagram-core/tests/fixtures/layout-hints-2/retro-b.json';
import retroC from '../../packages/diagram-core/tests/fixtures/layout-hints-2/retro-c.json';

import {
  H2_GENERIC_SCENE_SPECS,
  H2_OVERLAY_CATALOG,
  buildBrowserSafeGenericScene,
  buildH2Appctx16x9Fixture,
  measureH2SceneResiduals,
} from '../../packages/diagram-canvas/test-support/h2ReferenceFixtures.ts';

import Harness from './Harness.svelte';
import VueFigure from '../../packages/components-vue/src/DiagramSceneFigure.vue';
import '../../packages/components-vue/src/styles.css';

const PAYLOADS = {
  'schema-1': schema1,
  'schema-3': schema3,
  'schema-6': schema6,
  'schema-13': schema13,
  'ref-1': ref1,
  'ref-2': ref2,
  'ref-3': ref3,
  'archi-metier': archiMetier,
  'archi-applicative': archiApplicative,
  'archi-technologique': archiTechnologique,
  'retro-a': retroA,
  'retro-b': retroB,
  'retro-c': retroC,
};

const style = document.createElement('style');
style.textContent = compileTheme(sentTechTheme);
document.head.append(style);

const sceneSelect = document.getElementById('scene-select');
const frameworkSelect = document.getElementById('framework-select');
const frameSelect = document.getElementById('frame-select');
const captureFile = document.getElementById('capture-file');
const captureOpacity = document.getElementById('capture-opacity');
const overlayImg = document.getElementById('overlay-img');
const stageWrap = document.getElementById('stage-wrap');
const mountTarget = document.getElementById('figure-mount');
const sceneTitle = document.getElementById('scene-title');
const refMeta = document.getElementById('ref-meta');
const carriesEl = document.getElementById('carries');
const residualsBody = document.getElementById('residuals-body');
const metricsEl = document.getElementById('metrics');
const offsetReadout = document.getElementById('offset-readout');

for (const meta of H2_OVERLAY_CATALOG) {
  const opt = document.createElement('option');
  opt.value = meta.id;
  opt.textContent = `${meta.figureLabel} — ${meta.id}`;
  sceneSelect.append(opt);
}

let activeTeardown = null;

function buildSceneProps(sceneId) {
  const common = {
    registry: m3ProfileRegistry,
    bindings: shippedExecutorBindings,
    labels: { fit: 'Ajuster' },
    title: sceneId,
  };
  if (sceneId === 'appctx-architecture') {
    const built = buildH2Appctx16x9Fixture(architecture, architectureView);
    return { ...common, document: built.document, view: built.view, presentation: built.presentation, hints: built.hints, defaultFolds: [] };
  }
  const payload = PAYLOADS[sceneId];
  const spec = H2_GENERIC_SCENE_SPECS[sceneId];
  const built = buildBrowserSafeGenericScene({
    id: sceneId,
    entities: spec.entities,
    relations: spec.relations,
    hintsV2: payload.hints,
  });
  return { ...common, document: built.document, presentation: built.presentation, hints: built.hints, defaultFolds: [] };
}

function renderMetrics(sceneId, layoutResult) {
  if (!layoutResult || layoutResult.status !== 'laid-out') {
    metricsEl.textContent = `Layout refused: ${JSON.stringify(layoutResult?.refusals ?? [])}`;
    offsetReadout.textContent = '';
    return;
  }
  const m = measureH2SceneResiduals(sceneId, layoutResult);
  const cards = [
    ['Painted W x H', `${Math.round(m.paintedWidth)} x ${Math.round(m.paintedHeight)}`],
    ['Aspect Ratio', `${m.aspectRatio.toFixed(4)} (${m.deltaFrom16x9Pct >= 0 ? '+' : ''}${m.deltaFrom16x9Pct.toFixed(2)}% vs 16:9)`],
    ['Route Conflicts', String(m.conflictCount)],
    ['Unplaced Labels', String(m.unplacedLabelCount)],
    ['Combs / Fallbacks', `${m.combCount} / ${m.combFallbackCount}`],
    ['F-6 Gaps > Token', String(m.paintedGapsAboveToken)],
  ];
  metricsEl.replaceChildren(
    ...cards.map(([label, value]) => {
      const div = document.createElement('div');
      div.className = 'metric';
      const labelEl = document.createElement('span');
      labelEl.textContent = label;
      const valueEl = document.createElement('strong');
      valueEl.textContent = value;
      div.append(labelEl, valueEl);
      return div;
    }),
  );
  const detail = {};
  if (m.t09) detail.T09_schema3 = m.t09;
  if (m.t49AndT50) detail.T49_T50_ref3 = m.t49AndT50;
  if (m.t37) detail.T37_ref1_NE1_laneDrifts = m.t37;
  if (m.t45) detail.T45_ref2_NE4_tierDeltas = m.t45;
  offsetReadout.textContent = Object.keys(detail).length > 0
    ? JSON.stringify(detail, null, 2)
    : 'No scene-specific offset probe (standard composition & fold invariants active).';
}

function renderScene() {
  if (activeTeardown) {
    activeTeardown();
    activeTeardown = null;
  }
  mountTarget.replaceChildren();
  const sceneId = sceneSelect.value;
  const framework = frameworkSelect.value;
  const meta = H2_OVERLAY_CATALOG.find((item) => item.id === sceneId) ?? H2_OVERLAY_CATALOG[0];

  sceneTitle.textContent = meta.title;
  refMeta.textContent = meta.capturePx
    ? `Reference capture: ${meta.figureLabel} (${meta.capturePx.width} x ${meta.capturePx.height} px, ratio ${(meta.capturePx.width / meta.capturePx.height).toFixed(3)})`
    : `Reference: ${meta.figureLabel} (no static PNG capture dimensions)`;

  carriesEl.replaceChildren(
    ...meta.carries.map((row) => {
      const span = document.createElement('span');
      span.className = 'tag tag-ok';
      span.textContent = row;
      return span;
    }),
  );
  residualsBody.replaceChildren(
    ...meta.residuals.map((r) => {
      const tr = document.createElement('tr');
      const tdRows = document.createElement('td');
      tdRows.textContent = r.rows.join(', ');
      const tdTag = document.createElement('td');
      const badge = document.createElement('span');
      badge.className = 'tag tag-ne';
      badge.textContent = r.ne;
      tdTag.append(badge);
      const tdSummary = document.createElement('td');
      tdSummary.textContent = r.summary;
      const tdRestored = document.createElement('td');
      tdRestored.textContent = r.restoredIn;
      const tdTrack = document.createElement('td');
      const code = document.createElement('code');
      code.textContent = r.trackItem;
      tdTrack.append(code);
      tr.append(tdRows, tdTag, tdSummary, tdRestored, tdTrack);
      return tr;
    }),
  );

  const props = {
    ...buildSceneProps(sceneId),
    onLayout: (layoutResult) => renderMetrics(sceneId, layoutResult),
  };
  if (framework === 'svelte') {
    const instance = mount(Harness, { target: mountTarget, props: { props } });
    activeTeardown = () => unmount(instance);
  } else {
    const app = createApp({ render: () => h(VueFigure, props) });
    app.mount(mountTarget);
    activeTeardown = () => app.unmount();
  }
}

const params = new URLSearchParams(location.search);
if (params.has('scene') && H2_OVERLAY_CATALOG.some((m) => m.id === params.get('scene'))) {
  sceneSelect.value = params.get('scene');
}
if (params.get('framework') === 'vue') frameworkSelect.value = 'vue';

sceneSelect.addEventListener('change', renderScene);
frameworkSelect.addEventListener('change', renderScene);
frameSelect.addEventListener('change', () => {
  stageWrap.dataset.frame = frameSelect.value;
});
captureOpacity.addEventListener('input', () => {
  overlayImg.style.opacity = String(Number(captureOpacity.value) / 100);
});
let activeOverlayUrl = null;
captureFile.addEventListener('change', () => {
  if (activeOverlayUrl) {
    URL.revokeObjectURL(activeOverlayUrl);
    activeOverlayUrl = null;
  }
  const file = captureFile.files?.[0];
  if (!file) {
    overlayImg.style.display = 'none';
    overlayImg.removeAttribute('src');
    return;
  }
  activeOverlayUrl = URL.createObjectURL(file);
  overlayImg.src = activeOverlayUrl;
  overlayImg.style.opacity = String(Number(captureOpacity.value) / 100);
  overlayImg.style.display = 'block';
});

renderScene();
