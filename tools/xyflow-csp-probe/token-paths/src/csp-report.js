window.__csp = [];
document.addEventListener('securitypolicyviolation', (e) => {
  window.__csp.push({ directive: e.effectiveDirective || e.violatedDirective, blockedURI: e.blockedURI,
    sample: (e.sample || '').slice(0, 200), source: (e.sourceFile || '').split('/').pop() + ':' + e.lineNumber + ':' + e.columnNumber });
});
