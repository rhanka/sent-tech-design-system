<script lang="ts">
let overflowMenuInstanceCounter = 0;
</script>

<script setup lang="ts">
import type { MenuLabelSlots } from './menu-label-slots.js';
import type { OverflowMenuPlacement } from "./OverflowMenu.js";
import { useAttrs, nextTick, onUnmounted, provide, ref, watch } from "vue";
import { Ellipsis } from "lucide-vue-next";
import { Menu } from "./Menu.js";
import type { MenuActionItem, MenuItem } from "./Menu.js";
import { MENU_HOST_KEY, type SubMenuSide } from "./menu-cascade.js";

function treeHasCascade(list: MenuItem[]): boolean {
  for (const item of list) {
    const tagged = item as {
      type?: string;
      kind?: string;
      children?: MenuItem[];
      items?: MenuItem[];
    };
    const kind = tagged.type ?? tagged.kind;
    if (Array.isArray(tagged.children) && tagged.children.length > 0)
      return true;
    if (Array.isArray(tagged.children) && treeHasCascade(tagged.children))
      return true;
    if (
      kind === "group" &&
      Array.isArray(tagged.items) &&
      treeHasCascade(tagged.items)
    )
      return true;
  }
  return false;
}

defineSlots<MenuLabelSlots>();

defineOptions({ name: "OverflowMenu", inheritAttrs: false });
const props = defineProps({
  items: { type: Array as () => MenuItem[], required: true },
  label: { type: String, default: "More" },
  open: { type: Boolean, default: undefined },
  dense: { type: Boolean, default: false },
  placement: {
    type: String as () => OverflowMenuPlacement,
    default: "bottom-start",
  },
  class: { type: String, default: undefined },
  submenuSide: { type: String as () => SubMenuSide, default: "auto" },
});
const emit = defineEmits(["update:open", "select"]);
const attrs = useAttrs();

const rootMenuId = `st-overflowmenu-${++overflowMenuInstanceCounter}`;
const localOpen = ref(false);
const hostRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLElement | null>(null);

const isOpen = () => (props.open !== undefined ? props.open : localOpen.value);

const setOpen = (val: boolean) => {
  if (props.open === undefined) localOpen.value = val;
  emit("update:open", val);
};

function requestClose(options: { focusTrigger: boolean }) {
  setOpen(false);
  if (options.focusTrigger) {
    triggerRef.value?.focus();
  }
}

provide(MENU_HOST_KEY, {
  rootMenuId,
  requestClose,
});

function handleMenuSelect(item: MenuActionItem, path?: string[]) {
  // Relay: first argument unchanged, path second for cascade leaves.
  // Flat menus keep the legacy single-argument call (AC-01).
  if (path !== undefined) {
    emit("select", item, path);
  } else {
    emit("select", item);
  }
  // Cascade Menu owns closing and modality-specific focus via requestClose.
  // Flat leaves retain the host's legacy close.
  if (path === undefined) setOpen(false);
}

function onTriggerKeyDown(event: KeyboardEvent) {
  if (!["ArrowDown", "Enter", " "].includes(event.key)) return;
  event.preventDefault();
  if (isOpen()) {
    focusFirst();
  } else {
    setOpen(true);
    void nextTick().then(() => focusFirst());
  }
}

function focusFirst() {
  const host = hostRef.value;
  const first = host?.querySelector<HTMLButtonElement>(
    '[role="menuitem"]:not(:disabled)',
  );
  first?.focus();
}

// Shadow-safe outside close (composedPath, §3.6): panels are inside the
// host element so they are never "outside". The previous `mousedown` +
// `host.contains` check is replaced.
const onPointerDown = (event: PointerEvent) => {
  if (hostRef.value && !hostRef.value.isConnected) return;
  if (event.defaultPrevented) return;
  if (!isOpen()) return;
  const composed = event as PointerEvent & {
    composedPath?: () => EventTarget[];
  };
  const path =
    typeof composed.composedPath === "function" ? composed.composedPath() : [];
  const target = event.target as Node | null;
  const host = hostRef.value;
  const inside =
    host !== undefined &&
    host !== null &&
    (path.length > 0
      ? path.includes(host)
      : Boolean(target && host.contains(target)));
  if (!inside) setOpen(false);
};

const onKeyDown = (event: KeyboardEvent) => {
  if (hostRef.value && !hostRef.value.isConnected) return;
  // A nested menu level already consumed this key (D4).
  if (event.defaultPrevented) return;
  if (event.key === "Escape" && isOpen()) {
    event.preventDefault();
    // Keyboard closes return focus to the trigger for cascade menus
    // only; flat menus keep their previous behaviour (§3.6, AC-01).
    requestClose({ focusTrigger: treeHasCascade(props.items) });
  }
};

watch(
  () => isOpen(),
  (open) => {
    if (open) {
      window.addEventListener("pointerdown", onPointerDown);
      window.addEventListener("keydown", onKeyDown);
    } else {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    }
  },
  { immediate: true },
);

onUnmounted(() => {
  window.removeEventListener("pointerdown", onPointerDown);
  window.removeEventListener("keydown", onKeyDown);
});
</script>
<template>
  <div
    v-bind="attrs"
    ref="hostRef"
    :class="[
      'st-overflowMenu',
      { 'st-overflowMenu--dense': props.dense },
      props.class,
    ]"
  >
    <button
      ref="triggerRef"
      type="button"
      class="st-overflowMenu__trigger"
      aria-haspopup="menu"
      :aria-expanded="isOpen() ? 'true' : 'false'"
      :aria-controls="isOpen() ? rootMenuId : undefined"
      :aria-label="props.label"
      @click="setOpen(!isOpen())"
      @keydown="onTriggerKeyDown"
    >
      <Ellipsis :size="18" :stroke-width="2.25" aria-hidden="true" />
    </button>
    <div
      v-if="isOpen()"
      :class="[
        'st-overflowMenu__list',
        'st-overflowMenu__list--' + props.placement,
      ]"
    >
      <Menu
        :items="props.items"
        :dense="props.dense && treeHasCascade(props.items)"
        :aria-label="props.label"
        :submenu-side="props.submenuSide"
        @select="handleMenuSelect"
      >
      <template v-if="$slots['item-label']" #item-label="scope"><slot name="item-label" v-bind="scope" /></template>
      <template v-if="$slots['group-label']" #group-label="scope"><slot name="group-label" v-bind="scope" /></template>
    </Menu>
    </div>
  </div>
</template>
