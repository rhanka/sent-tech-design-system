<script lang="ts">
  // GapRail.svelte : rail droit du triptyque compare.
  // Affiche les écarts (Δ) lus UNIQUEMENT du registre compare-gaps.json.
  // INVARIANT : aucune mesure de style côté navigateur. Tous les Δ viennent du JSON.
  // Les notes/valeurs sont rendues en interpolation texte (jamais {@html}).

  import { deriveStatus } from "./registry.mjs";
  import { listGaps, GAPS_REGISTRY, type GapEntry } from "./compare-store.svelte";

  interface Props {
    themeId: string;
    component: string;
    scenario: string;
    collapsed?: boolean;
  }

  let { themeId, component, scenario, collapsed = $bindable(false) }: Props = $props();

  const gaps = $derived(listGaps(themeId, component, scenario));
  const currentHash = GAPS_REGISTRY.manifestHash;

  function derivedStatus(entry: GapEntry): string {
    return deriveStatus(entry, currentHash);
  }

  const STATUS_LABEL: Record<string, string> = {
    open: "Ouvert",
    escape: "Impossible",
    fixed: "Résolu",
    stale: "Périmé",
    regressed: "Régression",
  };

  const STATUS_COLOR: Record<string, string> = {
    open: "var(--gap-open, #b45309)",
    escape: "var(--gap-escape, #64748b)",
    fixed: "var(--gap-fixed, #15803d)",
    stale: "var(--gap-stale, #7c3aed)",
    regressed: "var(--gap-regressed, #dc2626)",
  };
</script>

<aside
  class="gap-rail"
  class:gap-rail--collapsed={collapsed}
  aria-label="Rail des écarts de fidélité"
>
  <header class="gap-rail__header">
    <span class="gap-rail__title">
      Écarts
      {#if gaps.length > 0}
        <span class="gap-rail__count">{gaps.length}</span>
      {/if}
    </span>
    <button
      type="button"
      class="gap-rail__toggle"
      onclick={() => (collapsed = !collapsed)}
      aria-expanded={!collapsed}
      aria-label={collapsed ? "Déplier le rail des écarts" : "Replier le rail des écarts"}
    >
      {collapsed ? "▶" : "◀"}
    </button>
  </header>

  {#if !collapsed}
    <div class="gap-rail__body">
      {#if gaps.length === 0}
        <p class="gap-rail__empty">Aucun écart enregistré pour ce scénario.</p>
      {:else}
        <ul class="gap-rail__list" role="list">
          {#each gaps as gap (gap.theme + "/" + gap.component + "/" + gap.scenario + "/" + gap.state + "/" + gap.property)}
            {@const status = derivedStatus(gap)}
            <li class="gap-item">
              <div class="gap-item__header">
                <code class="gap-item__prop">{gap.property}</code>
                <span
                  class="gap-item__status"
                  style="color: {STATUS_COLOR[status] ?? STATUS_COLOR.open}"
                  title={STATUS_LABEL[status] ?? status}
                >{STATUS_LABEL[status] ?? status}</span>
              </div>
              <dl class="gap-item__delta">
                <div class="gap-item__row">
                  <dt class="gap-item__label">Ours</dt>
                  <dd class="gap-item__value">{gap.ours}</dd>
                </div>
                <div class="gap-item__row">
                  <dt class="gap-item__label">Réf</dt>
                  <dd class="gap-item__value">{gap.ref}</dd>
                </div>
                <div class="gap-item__row gap-item__row--delta">
                  <dt class="gap-item__label">Δ</dt>
                  <dd class="gap-item__value gap-item__value--delta">{gap.delta}</dd>
                </div>
              </dl>
              {#if gap.note}
                <p class="gap-item__note">{gap.note}</p>
              {/if}
            </li>
          {/each}
        </ul>

        <div class="gap-rail__meta">
          <span class="gap-rail__meta-row">Registre : {GAPS_REGISTRY.generatedAt?.slice(0, 10) ?? "?"}</span>
          {#if GAPS_REGISTRY.dsVersion}
            <span class="gap-rail__meta-row">DS v{GAPS_REGISTRY.dsVersion}</span>
          {/if}
        </div>
      {/if}

      <!-- Lot 3 : bouton désactivé/placeholder, hors périmètre Lot 2 -->
      <button
        type="button"
        class="gap-rail__report-btn"
        disabled
        aria-disabled="true"
        title="Signalement disponible en Lot 3"
      >
        ⚑ Signaler un gap
      </button>
    </div>
  {/if}
</aside>

<style>
  .gap-rail {
    display: flex;
    flex-direction: column;
    border-left: 1px solid #e2e8f0;
    background: #fafbfc;
    min-width: 0;
    overflow: hidden;
    transition: min-width 0.2s ease, max-width 0.2s ease;
  }

  @media (prefers-reduced-motion: reduce) {
    .gap-rail {
      transition: none;
    }
  }

  .gap-rail--collapsed {
    min-width: 2.5rem;
    max-width: 2.5rem;
    flex-shrink: 0;
  }

  .gap-rail__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.625rem 0.75rem;
    border-bottom: 1px solid #e2e8f0;
    position: sticky;
    top: 0;
    background: #fafbfc;
    z-index: 1;
  }

  .gap-rail--collapsed .gap-rail__header {
    flex-direction: column;
    padding: 0.5rem 0.375rem;
    justify-content: flex-start;
  }

  .gap-rail__title {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #475569;
    display: flex;
    align-items: center;
    gap: 0.375rem;
    white-space: nowrap;
  }

  .gap-rail--collapsed .gap-rail__title {
    writing-mode: vertical-rl;
    transform: rotate(180deg);
  }

  .gap-rail__count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.25rem;
    height: 1.25rem;
    padding: 0 0.25rem;
    border-radius: 9999px;
    background: #f59e0b;
    color: #fff;
    font-size: 0.6875rem;
    font-weight: 700;
  }

  .gap-rail__toggle {
    background: none;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.6875rem;
    padding: 0.125rem 0.3rem;
    color: #64748b;
    line-height: 1;
    flex-shrink: 0;
  }

  .gap-rail__toggle:hover {
    background: #f1f5f9;
  }

  .gap-rail__body {
    flex: 1;
    overflow-y: auto;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .gap-rail__empty {
    color: #94a3b8;
    font-size: 0.8125rem;
    font-style: italic;
    margin: 0;
  }

  .gap-rail__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
  }

  .gap-item {
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 0.5rem 0.625rem;
    background: #fff;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .gap-item__header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .gap-item__prop {
    font-size: 0.75rem;
    font-weight: 600;
    color: #1e293b;
    word-break: break-all;
  }

  .gap-item__status {
    font-size: 0.6875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    white-space: nowrap;
  }

  .gap-item__delta {
    margin: 0;
    display: grid;
    gap: 0.125rem;
  }

  .gap-item__row {
    display: flex;
    gap: 0.375rem;
    align-items: baseline;
  }

  .gap-item__label {
    font-size: 0.6875rem;
    color: #94a3b8;
    min-width: 1.75rem;
    font-weight: 600;
  }

  .gap-item__value {
    font-size: 0.6875rem;
    color: #475569;
    word-break: break-all;
    font-family: ui-monospace, "SF Mono", monospace;
  }

  .gap-item__value--delta {
    font-weight: 700;
    color: #b45309;
  }

  .gap-item__note {
    font-size: 0.6875rem;
    color: #64748b;
    font-style: italic;
    margin: 0;
    line-height: 1.4;
  }

  .gap-rail__meta {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    padding-top: 0.5rem;
    border-top: 1px solid #f1f5f9;
  }

  .gap-rail__meta-row {
    font-size: 0.625rem;
    color: #94a3b8;
  }

  .gap-rail__report-btn {
    align-self: flex-start;
    background: none;
    border: 1px dashed #cbd5e1;
    border-radius: 4px;
    color: #94a3b8;
    cursor: not-allowed;
    font-size: 0.75rem;
    padding: 0.375rem 0.625rem;
    opacity: 0.6;
  }
</style>
