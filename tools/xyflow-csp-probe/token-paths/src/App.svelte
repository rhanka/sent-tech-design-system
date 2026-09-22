<script>
  import Carte from './Carte.svelte';
  import CarteSvg from './CarteSvg.svelte';
  import CarteSvgCss from './CarteSvgCss.svelte';
  const variante = __VARIANTE__;
  let hote = $state();
  $effect(() => { if (variante === 'cssom' && hote) hote.style.setProperty('--st-fond', '#cfe'); });
</script>

{#if variante === 'prop-composant'}
  <!-- A — l'idiome qui échoue : propriété CSS personnalisée passée à un composant -->
  <Carte --st-fond="#cfe" titre="A" />
{:else if variante === 'ancetre-directive'}
  <!-- B — variable posée sur un élément ancêtre, via la directive style: -->
  <div style:--st-fond="#cfe"><Carte titre="B" /></div>
{:else if variante === 'classe'}
  <!-- C — thématisation par classe -->
  <div class="theme-ocean"><Carte titre="C" /></div>
{:else if variante === 'cssom'}
  <!-- D — CSSOM après montage -->
  <div bind:this={hote}><Carte titre="D" /></div>
{:else if variante === 'prop-composant-svg'}
  <!-- E — même idiome qu'en A, mais dans l'espace de noms SVG -->
  <svg width="300" height="60"><CarteSvg --st-fond="#cfe" titre="E" /></svg>
{:else if variante === 'prop-composant-svg-css'}
  <!-- E' — même idiome qu'en E, peinture par règle CSS dans le composant -->
  <svg width="300" height="60"><CarteSvgCss --st-fond="#cfe" titre="E'" /></svg>
{:else if variante === 'svg-temoin-sans-jeton'}
  <!-- Témoin : même composant qu'en E sans propriété CSS, pour lire la valeur de repli (#eee) -->
  <svg width="300" height="60"><CarteSvg titre="T" /></svg>
{/if}
