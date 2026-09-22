<script>let { titre, class: cls = '' } = $props();</script>
<div class="carte {cls}">{titre}</div>
<style>
  .carte { background: var(--st-fond, #eee); padding: 10px; }
  :global(.theme-ocean) { --st-fond: #cfe; }
</style>
