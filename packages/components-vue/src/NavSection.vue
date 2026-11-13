<script setup lang="ts">
import { ref, watch, useId } from 'vue';
import { classNames } from './classNames.js';
import Badge from './Badge.vue';
import Collapsible from './Collapsible.vue';
import Overline from './Overline.vue';


/** Niveau de titre porté par l'Overline d'en-tête de section. `h2`/`h3` quand la
 * section est une vraie région titrée d'un rail/drawer ; choisis selon la
 * profondeur du sommaire. */
export type NavSectionHeadingLevel = "h2" | "h3";


export type NavSectionProps = {
  /** Libellé de la section, rendu via Overline (small-caps muet). */
  label: string;
  /** Compteur optionnel → Badge circle en queue de l'en-tête. */
  count?: number;
  /** Si true, l'en-tête devient le trigger d'un Collapsible (aria-expanded)
   * qui montre/cache le contenu. Sinon : groupe titré statique. */
  collapsible?: boolean;
  /** État d'ouverture quand `collapsible`. */
  open?: boolean;
  /** Niveau de titre de l'Overline quand la section n'est pas repliable. */
  as?: NavSectionHeadingLevel;
  /** Notifié à chaque bascule d'ouverture (section repliable). */
  onToggle?: (open: boolean) => void;
  class?: string;
};
defineOptions({ name: 'NavSection', inheritAttrs: false });
const props = withDefaults(defineProps<NavSectionProps>(), { count: undefined, collapsible: false, open: true, as: "h3", onToggle: undefined, class: undefined });
defineSlots<{ default?: () => unknown; action?: () => unknown }>();
const emit = defineEmits<{ toggle: [open: boolean] }>();
const uid = `st-navSection-${useId()}`;
const internalOpen = ref(props.open);
watch(() => props.open, next => { internalOpen.value = next; });
function toggle(open: boolean) { internalOpen.value = open; emit('toggle', open); }
</script>

<template>
  <Collapsible v-if="props.collapsible" v-bind="$attrs" :open="internalOpen" :title="props.label" :aria-label="typeof props.count === 'number' ? `${props.label}, ${props.count}` : props.label" :class="classNames('st-navSection', 'st-navSection--collapsible', props.class)" @toggle="toggle"><slot /><template v-if="typeof props.count === 'number'" #trailing><Badge shape="circle" size="sm" :aria-label="`${props.count} éléments`">{{ props.count }}</Badge></template></Collapsible>
  <section v-else v-bind="$attrs" :class="classNames('st-navSection', 'st-navSection--static', props.class)" role="group" :aria-labelledby="`${uid}-label`"><div class="st-navSection__header"><Overline :as="props.as" :id="`${uid}-label`" class="st-navSection__label">{{ props.label }}<Badge v-if="typeof props.count === 'number'" shape="circle" size="sm" class="st-navSection__count" :aria-label="`${props.count} éléments`">{{ props.count }}</Badge></Overline><span v-if="$slots.action" class="st-navSection__action"><slot name="action" /></span></div><div class="st-navSection__body"><slot /></div></section>
</template>
