<script setup lang="ts">
import { scalarContent } from './slotContent.js';
import { classNames } from './classNames.js';
import Icon from './Icon.vue';
import { ICONS, type IconName } from './icon-data.js';

export type MessageActionVariant = 'default' | 'danger';
export type MessageAction = {
  id?: string;

  /** @slot action-content */
  label?: string | number;

  /** @slot action-icon */
  icon?: string | number;
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
defineSlots<{'action-content'?: (scope: {action: MessageAction; index: number}) => unknown; 'action-icon'?: (scope: {action: MessageAction; index: number}) => unknown;}>();
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
      :aria-label="action.label != null ? String(action.label) : action.id"
      @click="action.onClick"
    >
      <slot name="action-content" :action="action" :index="index"><slot name="action-icon" :action="action" :index="index"><Icon v-if="typeof action.icon === 'string' && Object.hasOwn(ICONS, action.icon)" :name="action.icon as IconName" :size="16" /><template v-else>{{ scalarContent(action.icon) || scalarContent(action.label) }}</template></slot></slot>
    </button>
  </div>
</template>
