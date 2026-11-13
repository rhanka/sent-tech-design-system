// Review-authorized behavior changes to the frozen SSR contract. The original
// captures stay immutable; this bounded adapter removes duplicate wrapper attrs
// and preserves explicit native IDs when attributes move to the control.
export function reviewCorrections(name, fixture, JSDOM) {
  const controls = new Set(['Input','Textarea','PasswordInput','NumberInput','Select','Checkbox','Radio','Search','Switch','Toggle','Table']);
  const tree = JSDOM.fragment(fixture.html), root = tree.firstElementChild;
  if (!root) return fixture;
  if (controls.has(name)) {
    const control = root.querySelector('input,textarea,select,table');
    const callerId = root.getAttribute('id');
    if (control && callerId && ['Select','Textarea','PasswordInput','NumberInput'].includes(name)) {
      const previous = control.id;
      control.id = callerId;
      for (const label of root.querySelectorAll('label')) if (label.htmlFor === previous) label.htmlFor = callerId;
    }
    for (const attr of [...root.attributes]) if (attr.name !== 'class') root.removeAttribute(attr.name);
  }
  if (['Drawer','NavDrawer','NavShell','Modal'].includes(name) && (root.classList.contains('st-drawer__backdrop') || root.classList.contains('st-modal__backdrop'))) {
    const panel = root.querySelector('aside,section');
    for (const attr of [...root.attributes]) if (attr.name !== 'class' && (attr.name === 'style' ? panel?.style.cssText === root.style.cssText : panel?.getAttribute(attr.name) === attr.value)) root.removeAttribute(attr.name);
  }
  if (name === 'MultiSelect' && root.querySelector('[data-invalid="true"]')) root.querySelector('.st-multiSelect__trigger')?.setAttribute('aria-invalid','true');
  // R2-m3 replaces the original static label ID with an instance identity.
  // Preserve the archived capture and normalize only that reviewed ID change.
  if (name === 'EventFeedPanel') root.querySelector('#st-eventFeedPanel-label')?.setAttribute('id', 'st-eventFeedPanel-0-label');
  const host = tree.ownerDocument.createElement('div'); host.append(tree);
  return {...fixture, html: host.innerHTML};
}
