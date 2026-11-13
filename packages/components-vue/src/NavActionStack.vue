<script setup lang="ts">
import { computed } from 'vue';
import { classNames } from './classNames.js';
import Button from './Button.vue';
import Divider from './Divider.vue';
import Icon from './Icon.vue';
import type { IconGlyph } from './icon-data.js';


/** Hiérarchie ENCODÉE DANS LE TYPE : une seule action `primary` est légitime
 * dans une pile. `secondary` = action secondaire ; `ghost` = action discrète.
 * La couleur sémantique (danger) n'est PAS un `kind` — elle vit dans
 * `dangerZone`, rendue à part. Le mauvais chemin (4 « primaires » arc-en-ciel)
 * devient ainsi impossible à exprimer proprement. */
export type NavActionKind = "primary" | "secondary" | "ghost";


export type NavAction = {
  label: string;
  /** Icône optionnelle (composant), rendue avant le libellé. */
  icon?: IconGlyph;
  onClick?: () => void;
  href?: string;
  kind?: NavActionKind;
  disabled?: boolean;
};


/** Action destructrice, isolée sous un séparateur + un overline « Zone
 * sensible ». Toujours en ton danger, jamais alignée avec les actions
 * normales. Pas de `kind` : c'est une zone, pas une catégorie de couleur. */
export type NavActionDangerZone = {
  label: string;
  icon?: IconGlyph;
  onClick?: () => void;
  href?: string;
};


export type NavActionStackOrientation = "vertical" | "horizontal";


export type NavActionStackProps = {
  actions?: NavAction[];
  dangerZone?: NavActionDangerZone;
  /** Libellé de l'overline de la zone sensible. Défaut « Zone sensible ». */
  dangerLabel?: string;
  orientation?: NavActionStackOrientation;
  /** Étiquette a11y du groupe d'actions. */
  label?: string;
  class?: string;
};
defineOptions({ name: 'NavActionStack', inheritAttrs: false });
const props = withDefaults(defineProps<NavActionStackProps>(), { actions: () => [], dangerZone: undefined, dangerLabel: "Zone sensible", orientation: "vertical", label: "Actions", class: undefined });
defineSlots<{ 'action-icon'?: (scope: { action: NavAction; index: number }) => unknown; 'danger-icon'?: (scope: { action: NavActionDangerZone }) => unknown }>();

const normalizedActions = computed(() => {
  let primarySeen = false;
  return props.actions.map(action => { const kind: NavActionKind = action.kind ?? 'secondary'; if (kind === 'primary') { if (primarySeen) { console.warn(`[NavActionStack] Plusieurs actions « primary » fournies — « ${action.label} » dégradée en « secondary ». Une pile n'a qu'une action primaire.`); return { ...action, kind: 'secondary' as NavActionKind }; } primarySeen = true; } return { ...action, kind }; });
});
</script>

<template>
  <div v-bind="$attrs" :class="classNames('st-navActionStack', `st-navActionStack--${props.orientation}`, props.class)" role="group" :aria-label="props.label"><div class="st-navActionStack__actions"><template v-for="(action, index) in normalizedActions" :key="action.label"><a v-if="action.href && !action.disabled" :class="`st-button st-button--${action.kind} st-button--md st-navActionStack__item`" :href="action.href" @click="action.onClick"><slot v-if="$slots['action-icon']" name="action-icon" :action="action" :index="index" /><Icon v-else-if="action.icon" :glyph="action.icon" />{{ action.label }}</a><Button v-else :variant="action.kind" :disabled="action.disabled" class="st-navActionStack__item" @click="action.onClick"><slot v-if="$slots['action-icon']" name="action-icon" :action="action" :index="index" /><Icon v-else-if="action.icon" :glyph="action.icon" />{{ action.label }}</Button></template></div>
    <div v-if="props.dangerZone" class="st-navActionStack__danger" role="group" :aria-label="props.dangerLabel"><Divider /><span class="st-navActionStack__dangerLabel">{{ props.dangerLabel }}</span><a v-if="props.dangerZone.href" class="st-button st-button--danger st-button--md st-navActionStack__item st-navActionStack__dangerAction" :href="props.dangerZone.href" @click="props.dangerZone.onClick"><slot v-if="$slots['danger-icon']" name="danger-icon" :action="props.dangerZone" /><Icon v-else-if="props.dangerZone.icon" :glyph="props.dangerZone.icon" />{{ props.dangerZone.label }}</a><Button v-else variant="danger" class="st-navActionStack__item st-navActionStack__dangerAction" @click="props.dangerZone.onClick"><slot v-if="$slots['danger-icon']" name="danger-icon" :action="props.dangerZone" /><Icon v-else-if="props.dangerZone.icon" :glyph="props.dangerZone.icon" />{{ props.dangerZone.label }}</Button></div>
  </div>
</template>
