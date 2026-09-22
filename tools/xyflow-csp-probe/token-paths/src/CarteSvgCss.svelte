<script>let { titre } = $props();</script>
<rect class="fond" width="120" height="40" />
<text x="8" y="24">{titre}</text>
<style>
  /* E' — même idiome qu'en E, mais la peinture passe par une règle CSS et non par l'attribut de présentation. */
  .fond { fill: var(--st-fond, #eee); }
</style>
