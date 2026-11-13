import type { Fixture } from './types.js';
const slots = { topChrome: '<header>Header</header>', primaryRail: '<nav>Rail</nav>', navigationPanel: '<p>Navigation</p>', main: '<article>Main</article>', contextPanel: '<p>Context</p>', utilityPanel: '<p>Utility</p>', bottomPanel: '<footer>Tools</footer>' };
export default [
  { id: 'default', props: {}, slots: { default: '<p>Body</p>' } },
  { id: 'site', props: { variant: 'site', class: 'consumer', 'data-bench': 'shell' }, slots: { ...slots, default: '<p>Site body</p>' } },
  { id: 'panels', props: {}, slots },
  { id: 'accordion', props: { panelCollapse: 'accordion', panelResize: true, defaultPanelWidths: { navigationPanel: 220, contextPanel: 900 }, utilitySide: 'left' }, slots },
  { id: 'controlled', props: { panelResize: true, panelWidths: {}, utilityMode: 'floating', utilitySide: 'bottom', navigationPanelLabel: 'Custom', mainId: 'content', class: 'consumer', style: 'color: red', 'data-bench': 'shell' }, slots },
  { id: 'controlled-widths', props: { panelResize: true, panelWidths: { navigationPanel: 320, utilityPanel: 400 }, utilityMode: 'overlay' }, slots },
] satisfies Fixture[];
