<script setup lang="ts">
import { scalarContent } from './slotContent.js';
import { classNames } from './classNames.js';

export type MessageActionVariant = 'default' | 'danger';
export type MessageAction = {
  id?: string;

  /** @slot action-content */
  label?: unknown;

  /** @slot action-content */
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
defineSlots<{'action-content'?: (scope: {action: MessageAction; index: number}) => unknown;}>();
</script>

<template>
  <div
    v-bind="{ ...($attrs), class: (classNames('st-messageActions', props.visibility === 'hover' && 'st-messageActions--hoverOnly', props.class)) }"

    role="group"
    aria-label="Actions du message"
  >
    <button
      v-for="(action, index) in props.actions"
      :key="action.id ?? index"
      type="button"
      :class="classNames('st-iconButton st-iconButton--sm', action.variant === 'danger' ? 'st-iconButton--danger' : 'st-iconButton--ghost')"
      :disabled="action.disabled"
      :aria-label="typeof action.label === 'string' ? action.label : action.id"
      @click="action.onClick"
    >
      <slot name="action-content" :action="action" :index="index">{{ scalarContent(action.icon ?? action.label) }}</slot>
    </button>
  </div>
</template>
