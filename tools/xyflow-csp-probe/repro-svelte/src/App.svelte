<script>
  import Carte from './Carte.svelte';
  const avecProprieteCss = __AVEC_PROP_CSS__;
</script>
{#if avecProprieteCss}
  <!-- Propriété CSS personnalisée passée À UN COMPOSANT : idiome Svelte -->
  <Carte --st-fond="#cfe" titre="avec propriété CSS" />
{:else}
  <Carte titre="sans propriété CSS" />
{/if}
