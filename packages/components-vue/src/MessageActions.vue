<script setup lang="ts">
import { classNames } from './classNames.js';

export type MessageActionVariant = 'default' | 'danger';
export type MessageAction = {
  id?: string;
  label?: unknown;
  icon?: unknown;
  disabled?: boolean;
  variant?: MessageActionVariant;
  onClick?: () => void;
};

export type MessageActionsProps = {
  actions: MessageAction[];
  visibility?: 'always' | 'hover';
  class?: string;
};

defineOptions({ name: 'MessageActions', inheritAttrs: false });
const props = withDefaults(defineProps<MessageActionsProps>(), {
  visibility: 'hover', class: undefined,
});
</script>

<template>
  <div
    v-bind="$attrs"
    :class="classNames('st-messageActions', props.visibility === 'hover' && 'st-messageActions--hoverOnly', props.class)"
    role="group"
    aria-label="Actions du message"
  >
    <button
      v-for="(action, index) in props.actions"
      :key="action.id ?? index"
      type="button"
      :class="classNames('st-iconButton st-iconButton--sm', action.variant === 'danger' ? 'st-iconButton--danger' : 'st-iconButton--ghost')"
      :disabled="action.disabled"
      :aria-label="action.label != null ? String(action.label) : action.id"
      @click="action.onClick"
    >
      {{ action.icon ?? action.label }}
    </button>
  </div>
</template>
