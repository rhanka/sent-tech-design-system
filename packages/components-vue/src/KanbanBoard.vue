<script setup lang="ts">
import { classNames } from './classNames.js';

export type KanbanBoardCard = {
  id: string;
  title: string;
  subtitle?: string;
  owner?: string;
  badgeLabel?: string;
  badgeTone?: string;
};

export type KanbanBoardColumn = { label: string; cards: KanbanBoardCard[] };

export type KanbanBoardProps = {
  columns: KanbanBoardColumn[];
  class?: string;
};

defineOptions({ name: 'KanbanBoard', inheritAttrs: false });
const props = withDefaults(defineProps<KanbanBoardProps>(), {
  class: undefined,
});
</script>

<template>
  <div v-bind="$attrs" :class="classNames('st-kb', props.class)">
    <div class="st-kb__board">
      <div v-for="(col, ci) in props.columns ?? []" :key="ci" class="st-kb__column">
        <div class="st-kb__column-head">
          <span class="st-kb__column-label">{{ col.label }}</span>
          <span class="st-kb__column-count">{{ String(col.cards.length) }}</span>
        </div>
        <div class="st-kb__column-body">
          <div v-for="card in col.cards" :key="card.id" class="st-kb__card">
            <div class="st-kb__card-header">
              <span class="st-kb__card-title">{{ card.title }}</span>
              <span v-if="card.badgeLabel" :class="classNames('st-badge', card.badgeTone ? `st-badge--${card.badgeTone}` : undefined)">{{ card.badgeLabel }}</span>
            </div>
            <p v-if="card.subtitle" class="st-kb__card-subtitle">{{ card.subtitle }}</p>
            <span v-if="card.owner" class="st-kb__card-owner">{{ card.owner }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
