<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { classNames } from './classNames.js';
export type IdentityUser = {
  displayName: string;
  email?: string;
  id?: string;
};
export type IdentityMenuProps = {
  user?: IdentityUser | null;
  isAuthenticated?: boolean;
  /**
   * État ouvert du dropdown (optionnellement contrôlé). Si fourni, le parent
   * contrôle ; sinon le composant gère un état interne. Aligné sur les 3 fw.
   */
  open?: boolean;
  devicesHref?: string;
  settingsHref?: string;
  loginLabel?: string;
  devicesLabel?: string;
  settingsLabel?: string;
  logoutLabel?: string;
  variant?: 'dropdown' | 'accordion';
  class?: string;
};
import { identityInitial } from './identity-initial.js';

defineOptions({ name: 'IdentityMenu' });
const props = withDefaults(defineProps<IdentityMenuProps>(), {
  user: null,
  isAuthenticated: false,
  open: undefined,
  devicesHref: '#',
  settingsHref: '#',
  loginLabel: 'Se connecter',
  devicesLabel: 'Appareils',
  settingsLabel: 'Paramètres',
  logoutLabel: 'Se déconnecter',
  variant: 'dropdown',
  class: undefined,
});
const emit = defineEmits<{
  login: [];
  logout: [];
  openChange: [value: boolean];
  'update:open': [value: boolean];
}>();
const internalOpen = ref(false);
const isOpen = computed(() =>
  props.open === undefined ? internalOpen.value : props.open,
);
const setOpen = (next: boolean) => {
  if (props.open === undefined) internalOpen.value = next;
  emit('openChange', next);
  emit('update:open', next);
};
const rootEl = ref<HTMLElement | null>(null);
const triggerEl = ref<HTMLButtonElement | null>(null);
let pendingFocus: 'first' | 'last' = 'first';
const onPointerDown = (event: PointerEvent) => {
  const target = event.target as Node | null;
  if (
    isOpen.value &&
    rootEl.value &&
    target &&
    !rootEl.value.contains(target)
  ) {
    // Clic extérieur : ferme ET restaure le focus sur le trigger.
    setOpen(false);
    triggerEl.value?.focus();
  }
};
watch(isOpen, (value) => {
  if (value) {
    document.addEventListener('pointerdown', onPointerDown);
    // À l'ouverture : focus le 1er item (ou le dernier sur ArrowUp).
    const which = pendingFocus;
    void nextTick(() => focusItem(which === 'last' ? -1 : 0));
    pendingFocus = 'first';
  } else {
    document.removeEventListener('pointerdown', onPointerDown);
  }
});
onBeforeUnmount(() =>
  document.removeEventListener('pointerdown', onPointerDown),
);
const getItems = () =>
  Array.from(
    rootEl.value?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
  );
const focusItem = (index: number) => {
  const items = getItems();
  if (!items.length) return;
  const len = items.length;
  items[((index % len) + len) % len]?.focus();
};
const closeAndFocusTrigger = () => {
  setOpen(false);
  triggerEl.value?.focus();
};
const onTriggerKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    pendingFocus = 'first';
    if (isOpen.value) void nextTick(() => focusItem(0));
    else setOpen(true);
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    pendingFocus = 'last';
    if (isOpen.value) void nextTick(() => focusItem(-1));
    else setOpen(true);
  } else if (event.key === 'Escape' && isOpen.value) {
    // Esc ferme aussi depuis le trigger (global au composant ouvert).
    event.preventDefault();
    closeAndFocusTrigger();
  }
};
const onMenuKeyDown = (event: KeyboardEvent) => {
  const items = getItems();
  const current = items.indexOf(document.activeElement as HTMLElement);
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    focusItem(current + 1);
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    focusItem(current - 1);
  } else if (event.key === 'Home') {
    event.preventDefault();
    focusItem(0);
  } else if (event.key === 'End') {
    event.preventDefault();
    focusItem(items.length - 1);
  } else if (event.key === 'Tab') {
    // Piège de focus : Tab/Shift+Tab bouclent DANS le menu.
    if (!items.length) return;
    event.preventDefault();
    focusItem(current + (event.shiftKey ? -1 : 1));
  } else if (event.key === 'Escape') {
    event.preventDefault();
    closeAndFocusTrigger();
  }
};
const onItemKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    (event.currentTarget as HTMLElement).click();
  }
};
const selectAndClose = () => {
  setOpen(false);
  triggerEl.value?.focus();
};
const user = computed(() => props.user);
const displayName = computed(
  () => user.value?.displayName || user.value?.email || 'User',
);
</script>

<template>
  <template v-if="!(props.isAuthenticated && user)"
    ><button
      :type="'button'"
      :class="
        classNames(
          'st-identityMenu__login',
          props.variant === 'accordion' && 'st-identityMenu__login--accordion',
          props.class,
        )
      "
      @click="() => emit('login')"
    >
      {{ props.loginLabel }}
    </button></template
  ><template v-else
    ><div
      ref="rootEl"
      :class="
        classNames(
          'st-identityMenu',
          props.variant === 'accordion' && 'st-identityMenu--accordion',
          props.class,
        )
      "
    >
      <button
        :type="'button'"
        ref="triggerEl"
        :class="'st-identityMenu__trigger'"
        :aria-haspopup="'menu'"
        :aria-expanded="isOpen ? 'true' : 'false'"
        :aria-label="`Compte de ${displayName}`"
        @click="() => setOpen(!isOpen)"
        @keydown="onTriggerKeyDown"
      >
        <span :class="'st-identityMenu__avatar'" :aria-hidden="'true'">{{
          identityInitial(user)
        }}</span>
        <span :class="'st-identityMenu__meta'"
          ><span :class="'st-identityMenu__name'">{{ displayName }}</span>
          <template v-if="props.variant === 'accordion' && user.email"
            ><span :class="'st-identityMenu__email'">{{
              user.email
            }}</span></template
          ><template v-else></template
        ></span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
          focusable="false"
          :class="
            classNames(
              'st-identityMenu__chevron',
              isOpen && 'st-identityMenu__chevron--open',
            )
          "
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <template v-if="isOpen"
        ><div
          :class="'st-identityMenu__menu'"
          :role="'menu'"
          :tabindex="'-1'"
          :aria-label="`Menu de ${displayName}`"
          @keydown="onMenuKeyDown"
        >
          <a
            :href="props.devicesHref"
            :class="'st-identityMenu__item'"
            :role="'menuitem'"
            :tabindex="'-1'"
            @click="selectAndClose"
            @keydown="onItemKeyDown"
            >{{ props.devicesLabel }}</a
          >
          <a
            :href="props.settingsHref"
            :class="'st-identityMenu__item'"
            :role="'menuitem'"
            :tabindex="'-1'"
            @click="selectAndClose"
            @keydown="onItemKeyDown"
            >{{ props.settingsLabel }}</a
          >
          <div
            :class="'st-identityMenu__divider'"
            :role="'separator'"
            :aria-hidden="'true'"
          ></div>
          <button
            :type="'button'"
            :class="'st-identityMenu__item st-identityMenu__item--danger'"
            :role="'menuitem'"
            :tabindex="'-1'"
            @click="
              () => {
                setOpen(false);
                triggerEl?.focus();
                emit('logout');
              }
            "
          >
            {{ props.logoutLabel }}
          </button>
        </div></template
      ><template v-else></template></div
  ></template>
</template>
