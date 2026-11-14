// PR 280 moves native control attributes off wrappers. Apply the same bounded
// correction to archived dataviz captures containing those reviewed controls.
// Frozen fixtures and goldens remain byte-for-byte unchanged.
import { reviewCorrections as controlCorrections } from '../../components-vue/bench/review-corrections.mjs';
export function reviewCorrections(name, fixture, JSDOM) {
  if (name === 'EventFeedPanel') return controlCorrections(name, fixture, JSDOM);
  const affected = new Set(['AdvancedPivotDataTable', 'CalculationEditor', 'DashboardActiveFilters', 'DashboardFilterBar', 'FormatPanel', 'PivotDataTable', 'QueryBar', 'RangeSliderFilter', 'RecordsTable', 'SelectionLegend', 'RelativeDateFilter', 'TopNFilter', 'ValueSlicer']);
  if (!affected.has(name)) return fixture;
  const tree = JSDOM.fragment(fixture.html);
  for (const field of tree.querySelectorAll('.st-field, .st-search, .st-choice--checkbox')) {
    const control = field.querySelector('input,select,textarea');
    if (!control || field.querySelector('.st-datepicker') || control.type === 'range') continue;
    const kind = field.classList.contains('st-choice--checkbox') ? 'Checkbox' : field.classList.contains('st-search') ? 'Search' : control.localName === 'select' ? 'Select' : control.localName === 'textarea' ? 'Textarea' : control.type === 'number' ? 'NumberInput' : 'Input';
    const corrected = controlCorrections(kind, { html: field.outerHTML }, JSDOM);
    field.replaceWith(JSDOM.fragment(corrected.html));
  }
  // PR 286 routes these specific DS glyphs through Icon. Preserve geometry,
  // size and names while applying its reviewed class, focus and stroke policy.
  for (const svg of tree.querySelectorAll('.st-filterPill__remove > svg.lucide-x, .st-selectionChip__clear > svg.lucide-x, .st-search__icon > svg.lucide-search, .st-search__clear > svg.lucide-x, .st-multiSelect__tagRemove > svg.lucide-x, .st-multiSelect__caret > svg.lucide-chevron-down')) {
    const classes = svg.getAttribute('class').split(/\s+/);
    if (!classes.includes('st-icon')) classes.splice(1, 0, 'st-icon');
    svg.setAttribute('class', classes.join(' '));
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('stroke-width', '2.25');
  }
  // PR 286 removes duplicated table attrs from the outer wrapper; the table
  // remains their sole owner. Remove only attributes duplicated on that table.
  for (const wrapper of tree.querySelectorAll('.st-dataTable-wrap')) {
    const table = wrapper.querySelector(':scope > table.st-dataTable');
    for (const attr of [...wrapper.attributes]) if (attr.name !== 'class' && table?.getAttribute(attr.name) === attr.value) wrapper.removeAttribute(attr.name);
  }
  const host = tree.ownerDocument.createElement('div'); host.append(tree);
  return { ...fixture, html: host.innerHTML };
}
