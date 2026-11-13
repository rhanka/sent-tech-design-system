<script setup lang="ts">
import { computed } from 'vue';
import { classNames } from './classNames.js';

export type ConfigItemSourceLevel = 'code' | 'admin' | 'user';

export type ConfigItem = {
  id: string;
  name: string;
  key?: string;
  description?: string | null;
  /** Provenance : `code`/`admin` = système (verrouillé), `user` = personnalisé. */
  sourceLevel: ConfigItemSourceLevel;
  /** Identifiant du parent si l'item est une copie d'un défaut système. */
  parentId?: string | null;
  version?: number;
};

export type ConfigItemCardProps = {
  item: ConfigItem;
  hasCopy?: boolean;
  onCopy?: (id: string) => void;
  onEdit?: (id: string) => void;
  onReset?: (id: string) => void;
  onDelete?: (id: string) => void;
  disabled?: boolean;
  class?: string;
};

defineOptions({ name: 'ConfigItemCard', inheritAttrs: false });
const props = withDefaults(defineProps<ConfigItemCardProps>(), {
  hasCopy: false,
  onCopy: undefined,
  onEdit: undefined,
  onReset: undefined,
  onDelete: undefined,
  disabled: false,
  class: undefined,
});

const item = computed(() => props.item);
const isSystem = computed(() => item.value.sourceLevel === 'code' || item.value.sourceLevel === 'admin');
const isCopied = computed(() => item.value.sourceLevel === 'user' && !!item.value.parentId);
const isUserCreated = computed(() => item.value.sourceLevel === 'user' && !item.value.parentId);

const showCopy = computed(() => isSystem.value && !props.hasCopy && !!props.onCopy);
const showEdit = computed(() => (isCopied.value || isUserCreated.value) && !!props.onEdit);
const showReset = computed(() => isCopied.value && !!props.onReset);
const showDelete = computed(() => isUserCreated.value && !!props.onDelete);
const showActions = computed(() => showCopy.value || showEdit.value || showReset.value || showDelete.value);

function onCopyClicked() {
  props.onCopy?.(item.value.id);
}
function onEditClicked() {
  props.onEdit?.(item.value.id);
}
function onResetClicked() {
  props.onReset?.(item.value.id);
}
function onDeleteClicked() {
  props.onDelete?.(item.value.id);
}
defineSlots<{ "default"?: () => unknown }>();
</script>

<template>
  <article v-bind="{ ...($attrs), class: (classNames('st-configItemCard', props.class)) }"  :data-testid="`config-item-card-${item.key ?? item.id}`">
    <div class="st-configItemCard__header">
      <span class="st-configItemCard__name">{{ item.name }}</span>
      <span v-if="isSystem" class="st-configItemCard__badge st-configItemCard__badge--system"><svg class="st-configItemCard__badgeIcon" width="12" height="12" viewBox="0 0 14 14" aria-hidden="true" focusable="false"><path d="M4 6V4.5a3 3 0 0 1 6 0V6M3.5 6h7A1.5 1.5 0 0 1 12 7.5v3A1.5 1.5 0 0 1 10.5 12h-7A1.5 1.5 0 0 1 2 10.5v-3A1.5 1.5 0 0 1 3.5 6Z" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path></svg>Système</span>
      <span v-else-if="isCopied" class="st-configItemCard__badge st-configItemCard__badge--custom">Personnalisé</span>
    </div>
    <div v-if="item.key" class="st-configItemCard__key">{{ item.key }}</div>
    <p v-if="item.description" class="st-configItemCard__description">{{ item.description }}</p>
    <div v-if="showActions" class="st-configItemCard__actions">
      <button v-if="showCopy" type="button" class="st-configItemCard__action" title="Copier" aria-label="Copier" :disabled="props.disabled" @click="onCopyClicked"><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M5.5 5.5V3.75A1.25 1.25 0 0 1 6.75 2.5h5.5A1.25 1.25 0 0 1 13.5 3.75v5.5a1.25 1.25 0 0 1-1.25 1.25H10.5M3.75 5.5h5.5A1.25 1.25 0 0 1 10.5 6.75v5.5a1.25 1.25 0 0 1-1.25 1.25h-5.5A1.25 1.25 0 0 1 2.5 12.25v-5.5A1.25 1.25 0 0 1 3.75 5.5Z" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path></svg></button>
      <button v-if="showEdit" type="button" class="st-configItemCard__action" title="Éditer" aria-label="Éditer" :disabled="props.disabled" @click="onEditClicked"><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="m10.5 2.5 3 3L6 13l-3.5.5L3 10l7.5-7.5Z" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path></svg></button>
      <button v-if="showReset" type="button" class="st-configItemCard__action st-configItemCard__action--warning" title="Réinitialiser" aria-label="Réinitialiser" :disabled="props.disabled" @click="onResetClicked"><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M3 8a5 5 0 1 1 1.5 3.5M3 8V5M3 8h3" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path></svg></button>
      <button v-if="showDelete" type="button" class="st-configItemCard__action st-configItemCard__action--danger" title="Supprimer" aria-label="Supprimer" :disabled="props.disabled" @click="onDeleteClicked"><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M3 4.5h10M6 4.5V3.25A.75.75 0 0 1 6.75 2.5h2.5a.75.75 0 0 1 .75.75V4.5M4.25 4.5l.5 8A1 1 0 0 0 5.75 13.5h4.5a1 1 0 0 0 1-.99l.5-8" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path></svg></button>
    </div>
    <slot></slot>
  </article>
</template>
