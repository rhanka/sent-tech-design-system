// PR 280 moves native control attributes off wrappers. Apply the same bounded
// correction to archived dataviz captures containing those reviewed controls.
// Frozen fixtures and goldens remain byte-for-byte unchanged.
import { reviewCorrections as controlCorrections } from '../../components-vue/bench/review-corrections.mjs';
export function reviewCorrections(name, fixture, JSDOM) {
  if (name === 'EventFeedPanel') return controlCorrections(name, fixture, JSDOM);
  const affected = new Set(['CalculationEditor', 'DashboardFilterBar', 'FormatPanel', 'QueryBar', 'RangeSliderFilter', 'RelativeDateFilter', 'TopNFilter', 'ValueSlicer']);
  if (!affected.has(name)) return fixture;
  const tree = JSDOM.fragment(fixture.html);
  for (const field of tree.querySelectorAll('.st-field, .st-search, .st-choice--checkbox')) {
    const control = field.querySelector('input,select,textarea');
    if (!control || field.querySelector('.st-datepicker') || control.type === 'range') continue;
    const kind = field.classList.contains('st-choice--checkbox') ? 'Checkbox' : field.classList.contains('st-search') ? 'Search' : control.localName === 'select' ? 'Select' : control.localName === 'textarea' ? 'Textarea' : control.type === 'number' ? 'NumberInput' : 'Input';
    const corrected = controlCorrections(kind, { html: field.outerHTML }, JSDOM);
    field.replaceWith(JSDOM.fragment(corrected.html));
  }
  const host = tree.ownerDocument.createElement('div'); host.append(tree);
  return { ...fixture, html: host.innerHTML };
}
