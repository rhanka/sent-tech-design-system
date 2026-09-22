// Protocole de chronométrage commun à toutes les pages O3.
//   tData    : données de scène disponibles (ms depuis le début de navigation)
//   tStart   : appel du moteur de rendu
//   tReady   : scène complète dans le DOM, mise en page forcée (non quantifié par les trames)
//   tPainted : deux requestAnimationFrame après tReady (quantifié à ~16,7 ms)
export const N = Number(new URLSearchParams(location.search).get('n') || 35);
export const T = { data: null, start: null };

export function finish(extra = {}) {
  document.body.getBoundingClientRect();
  const tReady = performance.now();
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const tPainted = performance.now();
    const fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? null;
    const counts = typeof extra === 'function' ? extra() : extra;
    window.__result = { ok: true, n: N, tData: T.data, tStart: T.start, tReady, tPainted, fcp, ...counts };
  }));
}

export function fail(err) { window.__result = { ok: false, n: N, error: String(err).slice(0, 300) }; }

// xyflow n'est complet qu'après mesure des nœuds (ResizeObserver) puis fitView : on
// observe le DOM au lieu de sonder par trame, pour ne pas quantifier tReady.
// computed=true (pages SSR) : on lit les styles calculés, car un attribut style servi dans le HTML
// et bloqué par la CSP laisse la déclaration en ligne vide sans que la page le sache.
export function whenXyflowComplete(host, nodesExpected, edgesExpected, timeout = 20000, computed = false) {
  return new Promise((resolve, reject) => {
    const check = () => {
      const nodes = host.querySelectorAll('.svelte-flow__node');
      if (nodes.length !== nodesExpected) return false;
      for (const n of nodes) {
        if (computed) { const cs = getComputedStyle(n); if (cs.visibility !== 'visible' || cs.transform === 'none') return false; }
        else if (n.style.visibility !== 'visible') return false;
      }
      const paths = host.querySelectorAll('.svelte-flow__edge-path');
      if (paths.length !== edgesExpected) return false;
      for (const p of paths) if (!p.getAttribute('d')) return false;
      const vp = host.querySelector('.svelte-flow__viewport');
      if (computed) return !!vp && getComputedStyle(vp).transform !== 'none';
      return !!vp && !!vp.style.transform && vp.style.transform !== 'translate(0px, 0px) scale(1)';
    };
    if (check()) return resolve();
    const mo = new MutationObserver(() => { if (check()) { mo.disconnect(); clearTimeout(t); resolve(); } });
    mo.observe(host, { subtree: true, childList: true, attributes: true, attributeFilter: ['style', 'd', 'class'] });
    const t = setTimeout(() => { mo.disconnect(); reject(new Error('xyflow incomplet après ' + timeout + ' ms')); }, timeout);
  });
}

export function xyflowCounts(host) {
  const nodes = [...host.querySelectorAll('.svelte-flow__node')];
  const vp = host.querySelector('.svelte-flow__viewport');
  return {
    nodes: nodes.length,
    nodesVisible: nodes.filter((n) => getComputedStyle(n).visibility === 'visible').length,
    nodesPositioned: nodes.filter((n) => getComputedStyle(n).transform !== 'none').length,
    edges: host.querySelectorAll('.svelte-flow__edge-path').length,
    viewportTransform: vp ? getComputedStyle(vp).transform : null
  };
}

export function staticCounts() {
  return { nodes: document.querySelectorAll('.st-scene-node').length, edges: document.querySelectorAll('.st-scene-edge').length };
}
