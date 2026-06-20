<script lang="ts" module>
  export type KanbanBoardTone = "neutral" | "info" | "success" | "warning" | "error";

  export interface KanbanBoardCard {
    id: string;
    title: string;
    subtitle?: string;
    owner?: string;
    badgeLabel?: string;
    badgeTone?: KanbanBoardTone;
    progress?: number;
  }

  export interface KanbanBoardColumn {
    label: string;
    badgeTone?: KanbanBoardTone;
    cards: KanbanBoardCard[];
  }

  export type KanbanBoardProps = {
    columns: KanbanBoardColumn[];
    progressLabel?: string;
  };
</script>

<script lang="ts">
  import Badge from "./Badge.svelte";
  import Card from "./Card.svelte";
  import Avatar from "./Avatar.svelte";
  import ProgressBar from "./ProgressBar.svelte";

  let { columns, progressLabel }: KanbanBoardProps = $props();
</script>

<div class="st-kb">
  {#each columns as col}
    <div class="st-kb__column">
      <div class="st-kb__head">
        <span class="st-kb__colLabel">{col.label}</span>
        <Badge tone={col.badgeTone ?? "neutral"}>{col.cards.length}</Badge>
      </div>
      <div class="st-kb__body">
        {#each col.cards as card (card.id)}
          <Card class="st-kb__card">
            <div class="st-kb__cardInner">
              <div class="st-kb__cardTop">
                <span class="st-kb__cardTitle">{card.title}</span>
                {#if card.badgeLabel}
                  <Badge tone={card.badgeTone ?? "neutral"}>{card.badgeLabel}</Badge>
                {/if}
              </div>
              {#if card.subtitle}
                <span class="st-kb__cardSubtitle">{card.subtitle}</span>
              {/if}
              {#if card.progress !== undefined}
                <ProgressBar
                  value={card.progress}
                  max={100}
                  label={progressLabel ?? "Progression"}
                  showValue
                  size="sm"
                />
              {/if}
              {#if card.owner}
                <div class="st-kb__cardOwner">
                  <Avatar name={card.owner} size="sm" />
                  <span class="st-kb__ownerName">{card.owner}</span>
                </div>
              {/if}
            </div>
          </Card>
        {/each}
      </div>
    </div>
  {/each}
</div>

<style>
  .st-kb {
    display: flex;
    gap: var(--st-spacing-4, 1rem);
    padding: var(--st-spacing-6, 1.5rem);
    overflow-x: auto;
    align-items: flex-start;
    background: var(--st-semantic-surface-default);
    min-block-size: 100%;
  }
  .st-kb__column {
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-3, 0.75rem);
    min-inline-size: 18rem;
    flex-shrink: 0;
  }
  .st-kb__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--st-spacing-2, 0.5rem) var(--st-spacing-3, 0.75rem);
    background: var(--st-semantic-surface-raised);
    border: 1px solid var(--st-semantic-border-subtle);
    border-radius: var(--st-radius-md, 0.5rem);
  }
  .st-kb__colLabel {
    font-weight: 650;
    font-size: 0.875rem;
    color: var(--st-semantic-text-primary);
  }
  .st-kb__body {
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-2, 0.5rem);
  }
  .st-kb__cardInner {
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-2, 0.5rem);
    padding: var(--st-spacing-3, 0.75rem);
  }
  .st-kb__cardTop {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--st-spacing-2, 0.5rem);
  }
  .st-kb__cardTitle {
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--st-semantic-text-primary);
  }
  .st-kb__cardSubtitle {
    font-size: 0.75rem;
    color: var(--st-semantic-text-secondary);
  }
  .st-kb__cardOwner {
    display: flex;
    align-items: center;
    gap: var(--st-spacing-2, 0.5rem);
  }
  .st-kb__ownerName {
    font-size: 0.75rem;
    color: var(--st-semantic-text-secondary);
  }
</style>
