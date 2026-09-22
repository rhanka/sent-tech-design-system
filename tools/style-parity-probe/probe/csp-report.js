// Script classique (non module) : chargé avant mermaid, il capte les violations CSP.
window.__csp = [];
document.addEventListener('securitypolicyviolation', (e) => {
  window.__csp.push({ directive: e.effectiveDirective || e.violatedDirective, sample: (e.sample || '').slice(0, 120),
    source: (e.sourceFile || '').split('/').pop() + ':' + e.lineNumber });
});
