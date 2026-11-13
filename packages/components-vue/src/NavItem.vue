<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { classNames } from './classNames.js';
import SelectableRow from './SelectableRow.vue';
import ColorSwatch, { type ColorSwatchShape } from './ColorSwatch.vue';
import StatusDot, { type StatusDotTone } from './StatusDot.vue';
import Badge from './Badge.vue';


/** Profondeur dans l'arbre de nav → échelle typographique DÉCROISSANTE.
 * L0 = racine (base/600), chaque palier descend en taille ET en graisse pour
 * que la hiérarchie se LISE sans indentation seule. */
export type NavItemDepth = 0 | 1 | 2 | 3;


/** Ton sémantique de la rangée. `error` est un VRAI état (un « HTTP 403 »
 * devient rouge sémantique), pas une teinte décorative. */
export type NavItemStatus = "neutral" | "info" | "success" | "warning" | "error";


export type NavItemSwatch = {
  /** Couleur arbitraire (hex/rgb/var) → rendue par ColorSwatch. */
  color?: string;
  /** Ton sémantique → rendu par StatusDot (un point). Ignoré si `color`. */
  tone?: StatusDotTone;
  /** Forme de la pastille couleur (ColorSwatch). Défaut « square ». */
  shape?: ColorSwatchShape;
};


export type NavItemProps = {
  /** Clé de sélection, passée telle quelle à SelectableRow (data-value). */
  value?: string;
  /** Libellé principal (1ʳᵉ ligne). */
  title: string;
  /** 2ᵉ ligne MUETTE, ellipsée indépendamment du titre. */
  caption?: string;
  /** Profondeur (défaut 0) → échelle typo + indentation de la tête. */
  depth?: NavItemDepth;
  /** Pastille de tête : couleur arbitraire (ColorSwatch) ou ton (StatusDot). */
  swatch?: NavItemSwatch;
  /** Bulle de compte en queue (Badge circle/sm, tabular-nums). */
  count?: number;
  /** Ton sémantique de la rangée. */
  status?: NavItemStatus;
  /** Sélection (honorée en standalone ; la liste prime si encadrée). */
  selected?: boolean;
  /** Non-interactif. */
  disabled?: boolean;
  /** Rend la rangée comme un lien (ancre) — anatomie identique. */
  href?: string;
  /** Séparateur token-only rendu APRÈS la rangée. */
  divider?: boolean;
  /** Notifié à chaque bascule de sélection (rangée standalone). */
  onSelect?: (selected: boolean) => void;
  class?: string;
};
defineOptions({ name: 'NavItem', inheritAttrs: false });
const props = withDefaults(defineProps<NavItemProps>(), { value: undefined, caption: undefined, depth: 0, swatch: undefined, count: undefined, status: "neutral", selected: false, disabled: false, href: undefined, divider: false, onSelect: undefined, class: undefined });
defineSlots<{ leading?: () => unknown; trailing?: () => unknown }>();
const emit = defineEmits<{ select: [selected: boolean] }>();
const DEPTH_INDENT = ['0rem', '0.75rem', '1.5rem', '2.25rem'] as const;

    // Sélection standalone : SelectableRow vue est CONTRÔLÉ (il n'auto-toggle
    // pas), donc NavItem détient l'état interne et le rebascule à la rangée.
    const internalSelected = ref(props.selected);

    watch(
      () => props.selected,
      (next) => {
        internalSelected.value = next;
      },
    );


    function handleSelect(next: boolean) {
      internalSelected.value = next;

      emit("select", next);
    }
const safeDepth = computed(() => Math.min(Math.max(Math.trunc(Number(props.depth) || 0), 0), 3) as NavItemDepth);
const countLabel = computed(() => props.count != null ? `${props.count} ${props.title}` : undefined);
const depthStyle = computed(() => `--st-navItem-indent: var(--st-component-navItem-depth${safeDepth.value}-indent, ${DEPTH_INDENT[safeDepth.value]});`);
</script>

<template>
  <div v-bind="{ ...$attrs, class: classNames('st-navItem', `st-navItem--depth${safeDepth}`, props.status !== 'neutral' ? `st-navItem--status-${props.status}` : undefined, props.class), style: $attrs.style ? [depthStyle, $attrs.style] : depthStyle }">
    <SelectableRow :selected="internalSelected" :value="props.value" :href="props.href" :disabled="props.disabled" @select="handleSelect"><span class="st-navItem__title">{{ props.title }}</span><template v-if="$slots.leading || props.swatch" #leading><slot v-if="$slots.leading" name="leading" /><template v-else-if="props.swatch"><ColorSwatch v-if="props.swatch.color" :color="props.swatch.color" :shape="props.swatch.shape ?? 'square'" :size="14" /><StatusDot v-else :tone="props.swatch.tone ?? 'neutral'" :size="8" /></template></template><template v-if="$slots.trailing || props.count != null" #trailing><slot v-if="$slots.trailing" name="trailing" /><Badge v-else shape="circle" size="sm" :tone="props.status" :aria-label="countLabel">{{ props.count }}</Badge></template><template v-if="props.caption" #caption><span class="st-navItem__caption">{{ props.caption }}</span></template></SelectableRow>
    <hr v-if="props.divider" class="st-navItem__divider" aria-hidden="true" />
  </div>
</template>
