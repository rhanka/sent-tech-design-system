<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { classNames } from './classNames.js';
import { scalarContent } from './slotContent.js';


export type ToastTone = "info" | "success" | "warning" | "error";


export type ToastItem = {
  id: string;
  tone?: ToastTone;
  title: unknown;
  message?: unknown;
  actions?: unknown;
};


export type ToastProps = {
  onClose?: () => void;
  onDismiss?: (id: string) => void;
  tone?: ToastTone;
  title?: unknown;
  message?: unknown;
  items?: ToastItem[];
  autoDismiss?: boolean;
  duration?: number;
  class?: string;
  locale?: string;
  closeLabel?: string;
  dismissLabel?: (title: unknown) => string;
};
defineOptions({ name: 'Toast', inheritAttrs: false });
const props = withDefaults(defineProps<ToastProps>(), { tone: "info", title: undefined, message: undefined, items: undefined, autoDismiss: false, duration: 5000, class: undefined, locale: "fr-FR", closeLabel: undefined, dismissLabel: undefined });
defineSlots<{ default?: () => unknown; title?: (scope: { item?: ToastItem; index?: number }) => unknown; message?: (scope: { item?: ToastItem; index?: number }) => unknown; actions?: (scope: { item?: ToastItem; index?: number }) => unknown }>();
const emit = defineEmits<{ close: []; dismiss: [id: string] }>();



    const isFr = computed(() => (props.locale ?? "fr-FR").toLowerCase().startsWith("fr"));

    const resolvedCloseLabel = computed(() => props.closeLabel ?? (isFr.value ? "Fermer" : "Close"));

    const resolvedDismissLabel = computed(() => props.dismissLabel ?? ((title: unknown) => isFr.value ? `Fermer ${String(title)}` : `Dismiss ${String(title)}`));

    const hasClose = () => typeof props.onClose === 'function';
    const hasDismiss = () => typeof props.onDismiss === 'function';
    const roleFor = (t: string) => (t === "error" ? "alert" : "status");

    let timer: ReturnType<typeof setTimeout> | null = null;


    const startAutoDismiss = () => {
      if (props.autoDismiss && props.items?.length) {
        timer = setTimeout(() => {
          emit("dismiss", props.items![0].id);
        }, props.duration);
      }
    };


    const clearTimer = () => {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    };


    onMounted(() => startAutoDismiss());

    onUnmounted(() => clearTimer());
</script>

<template>
  <div v-if="props.items?.length" v-bind="$attrs" :class="classNames('st-toastQueue', props.class)">
    <section v-for="(item, index) in props.items" :key="item.id" :class="classNames('st-toast', `st-toast--${item.tone ?? 'info'}`)" :role="roleFor(item.tone ?? 'info')">
      <div class="st-toast__content"><h2 class="st-toast__title"><slot v-if="$slots['title']" name="title" :item="item" :index="index" /><template v-else>{{ scalarContent(item.title) }}</template></h2><p v-if="item.message || $slots.message" class="st-toast__message"><slot v-if="$slots['message']" name="message" :item="item" :index="index" /><template v-else>{{ scalarContent(item.message) }}</template></p></div>
      <div v-if="item.actions || $slots.actions" class="st-toast__actions"><slot v-if="$slots['actions']" name="actions" :item="item" :index="index" /><template v-else>{{ scalarContent(item.actions) }}</template></div>
      <button v-if="hasDismiss()" type="button" :aria-label="resolvedDismissLabel(item.title)" @click="emit('dismiss', item.id)">{{ resolvedCloseLabel }}</button>
    </section>
  </div>
  <section v-else v-bind="$attrs" :class="classNames('st-toast', `st-toast--${props.tone}`, props.class)" :role="roleFor(props.tone)">
    <div class="st-toast__content"><h2 class="st-toast__title"><slot v-if="$slots['title']" name="title" /><template v-else>{{ scalarContent(props.title) }}</template></h2><p v-if="props.message || $slots.message" class="st-toast__message"><slot v-if="$slots['message']" name="message" /><template v-else>{{ scalarContent(props.message) }}</template></p><slot v-else /></div>
    <div v-if="$slots.actions" class="st-toast__actions"><slot name="actions" /></div>
    <button v-if="hasClose()" type="button" @click="emit('close')">{{ resolvedCloseLabel }}</button>
  </section>
</template>
