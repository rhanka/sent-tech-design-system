<script setup lang="ts">
  import { computed, useId } from "vue";
  import type {
    CollaborationActor,
    CollaborationCapabilities,
    CollabMessageKey,
    FieldBindingIdentity,
    LockSnapshot,
    PresenceSnapshot,
    RichTextMessages,
  } from "@sentropic/design-system-rich-text";
  import {
    collabUntranslatedDataValue,
    derivePresenceBadgeState,
    formatCollabUntranslatedMarker,
    validateCollaborationColor,
  } from "@sentropic/design-system-rich-text";

  export interface LockPresenceBadgeProps {
    lock: LockSnapshot | null;
    presence: PresenceSnapshot | null;
    capabilities: CollaborationCapabilities;
    messages: RichTextMessages;
    nowIso: string;
    readOnly?: boolean;
    binding?: FieldBindingIdentity | null;
    onRequestUnlock?: () => void;
    onAcceptUnlock?: () => void;
    onForceUnlock?: () => void;
    onReleaseLock?: () => void;
  }

  defineOptions({ name: "LockPresenceBadge", inheritAttrs: false });
  const props = withDefaults(defineProps<LockPresenceBadgeProps>(), {
    lock: null, presence: null, readOnly: false, binding: null,
  });
  const emit = defineEmits<{
    requestUnlock: [];
    acceptUnlock: [];
    forceUnlock: [];
    releaseLock: [];
  }>();

  function provided(key: CollabMessageKey): string | undefined {
    const candidate: unknown = props.messages?.[key];
    return typeof candidate === "string" ? candidate : undefined;
  }

  function resolveCollabLabel(key: CollabMessageKey): string {
    return provided(key) ?? formatCollabUntranslatedMarker(key);
  }

  function isMissing(key: CollabMessageKey): boolean {
    return provided(key) === undefined;
  }

  function fill(template: string, values: Record<string, string>): string {
    let out = template;
    for (const [name, value] of Object.entries(values)) {
      out = out.split(`{${name}}`).join(value);
    }
    return out;
  }

  function initialsOf(entry: CollaborationActor): string {
    const parts = entry.displayLabel.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "";
    if (parts.length === 1) {
      return ((parts[0] as string).slice(0, 1) ?? "").toUpperCase();
    }
    const first = (parts[0] as string).slice(0, 1) ?? "";
    const last = (parts[parts.length - 1] as string).slice(0, 1) ?? "";
    return (first + last).toUpperCase();
  }

  function avatarStyle(entry: CollaborationActor): string {
    return `--badge-actor:${validateCollaborationColor(entry.color)}`;
  }

  const scopeRef = computed(() => (
    props.presence?.scopeRef ?? props.lock?.unit.scopeRef ?? ""
  ));

  const state = computed(() => (
    derivePresenceBadgeState({
      presence: props.presence ?? { scopeRef: scopeRef.value, actors: [], total: 0 },
      lock: props.lock,
      capabilities: props.capabilities,
      currentActorId: props.capabilities.currentActorId,
      nowIso: props.nowIso,
      readOnly: props.readOnly,
    })
  ));

  const holder = computed(() => (state.value.lockActive ? (props.lock?.holder ?? null) : null));
  const requester = computed(() => (
    state.value.lockActive ? (props.lock?.unlockRequestedBy ?? null) : null
  ));
  const requesterId = computed(() => (requester.value?.actorId ?? null));
  const holderLabel = computed(() => (holder.value?.displayLabel ?? ""));
  const liveMode = computed(() => (props.binding !== null && props.binding !== undefined));

  const presenceText = computed(() => (
    fill(resolveCollabLabel("presenceLabel"), {
      count: String(state.value.total),
    })
  ));
  const lockText = computed(() => (
    state.value.lockActive && holder.value !== null
      ? fill(resolveCollabLabel("lockLabel"), { holder: holderLabel.value })
      : resolveCollabLabel("noLockLabel")
  ));
  const tooltip = computed(() => (
    !state.value.lockActive
      ? fill(resolveCollabLabel("tooltipUnlockedLabel"), {
          count: String(state.value.total),
        })
      : props.readOnly
        ? fill(resolveCollabLabel("tooltipLockedReadOnlyLabel"), {
            holder: holderLabel.value,
          })
        : fill(resolveCollabLabel("tooltipLockedLabel"), {
            holder: holderLabel.value,
          })
  ));
  const tooltipKey = computed(() => (
    !state.value.lockActive
      ? ("tooltipUnlockedLabel" as CollabMessageKey)
      : props.readOnly
        ? ("tooltipLockedReadOnlyLabel" as CollabMessageKey)
        : ("tooltipLockedLabel" as CollabMessageKey)
  ));
  const rosterText = computed(() => (
    fill(resolveCollabLabel("rosterLabel"), { count: String(state.value.total) })
  ));
  const requestText = computed(() => (resolveCollabLabel("unlockRequestLabel")));
  const acceptText = computed(() => (resolveCollabLabel("unlockAcceptLabel")));
  const forceText = computed(() => (resolveCollabLabel("unlockForceLabel")));
  const releaseText = computed(() => (resolveCollabLabel("unlockReleaseLabel")));

  function keyTextFor(entry: CollaborationActor): string {
    return fill(resolveCollabLabel("requesterKeyLabel"), {
      label: entry.displayLabel,
    });
  }

  function avatarLabelFor(entry: CollaborationActor): string {
    if (requesterId.value !== null && requesterId.value === entry.actorId) {
      return `${entry.displayLabel} ${keyTextFor(entry)}`;
    }
    return entry.displayLabel;
  }

  const tooltipId = `st-presence-badge-tooltip-${useId()}`;

  const nonReadOnlyState = computed(() => (
    derivePresenceBadgeState({
      presence: props.presence ?? { scopeRef: scopeRef.value, actors: [], total: 0 },
      lock: props.lock,
      capabilities: props.capabilities,
      currentActorId: props.capabilities.currentActorId,
      nowIso: props.nowIso,
      readOnly: false,
    })
  ));

  const showRequest = computed(() => (
    state.value.canRequestUnlock || (props.readOnly && nonReadOnlyState.value.canRequestUnlock)
  ));
  const showAccept = computed(() => (
    state.value.lockActive &&
      requester.value !== null &&
      (holder.value?.actorId === props.capabilities.currentActorId ||
        props.capabilities.canForceUnlock)
  ));
  const showForce = computed(() => (
    state.value.lockActive && props.capabilities.canForceUnlock
  ));
  const showRelease = computed(() => (
    state.value.lockActive &&
      holder.value !== null &&
      holder.value.actorId === props.capabilities.currentActorId
  ));
</script>

<template>
<div
  class="st-presence-badge"
  data-testid="presence-badge"
  :data-role="state.role"
  :data-lock-active="state.lockActive ? 'true' : 'false'"
  :data-live="liveMode ? 'true' : 'false'"
  :title="tooltip"
  :aria-label="rosterText"
  :data-untranslated="isMissing('rosterLabel')
    ? collabUntranslatedDataValue('rosterLabel')
    : null"
  tabindex="0"
  :aria-describedby="tooltipId"
>
  <div
    class="st-presence-badge__stack"
    data-testid="avatar-stack"
    role="list"
    :aria-label="rosterText"
    :data-untranslated="isMissing('rosterLabel')
      ? collabUntranslatedDataValue('rosterLabel')
      : null"
  >
    <template v-for="entry in state.actors" :key="entry.actorId">
      <span
        class="st-presence-badge__avatar"
        role="listitem"
        data-testid="avatar"
        :data-actor-id="entry.actorId"
        :data-kind="entry.kind"
        :aria-label="avatarLabelFor(entry)"
        :style="avatarStyle(entry)"
      >
        <span class="st-presence-badge__initials" aria-hidden="true"
          >{{ initialsOf(entry) }}</span
        >
        <template v-if="requesterId !== null && requesterId === entry.actorId">
          <span class="st-presence-badge__key" aria-hidden="true"></span>
          <span
            class="st-presence-badge__hidden"
            :data-testid="`requester-key-${entry.actorId}`"
            :data-untranslated="isMissing('requesterKeyLabel')
              ? collabUntranslatedDataValue('requesterKeyLabel')
              : null">{{ keyTextFor(entry) }}</span
          >
        </template>
      </span>
    </template>
  </div>
  <span
    class="st-presence-badge__count"
    data-testid="presence-count"
    :data-untranslated="isMissing('presenceLabel')
      ? collabUntranslatedDataValue('presenceLabel')
      : null">{{ presenceText }}</span
  >
  <span
    class="st-presence-badge__lock"
    data-testid="lock-status"
    :data-untranslated="isMissing(state.lockActive && holder !== null ? 'lockLabel' : 'noLockLabel')
      ? collabUntranslatedDataValue(
          state.lockActive && holder !== null ? 'lockLabel' : 'noLockLabel',
        )
      : null">{{ lockText }}</span
  >
  <ul
    class="st-presence-badge__roster"
    data-testid="roster"
    :aria-label="rosterText"
    :data-untranslated="isMissing('rosterLabel')
      ? collabUntranslatedDataValue('rosterLabel')
      : null"
  >
    <template v-for="entry in state.actors" :key="entry.actorId">
      <li
        class="st-presence-badge__member"
        data-testid="roster-item"
        :data-actor-id="entry.actorId"
      >
        <span class="st-presence-badge__name">{{ entry.displayLabel }}</span>
        <template v-if="entry.activity">
          <span
            class="st-presence-badge__activity"
            :data-testid="`activity-${entry.actorId}`"
          >
            <span
              class="st-presence-badge__activity-scope"
              :data-testid="`activity-scope-${entry.actorId}`"
              >{{ entry.activity.scopeRef }}</span
            >
            <span
              class="st-presence-badge__activity-state"
              :data-testid="`activity-state-${entry.actorId}`"
              >{{ entry.activity.state }}</span
            >
            <span
              class="st-presence-badge__activity-since"
              :data-testid="`activity-since-${entry.actorId}`"
              >{{ entry.activity.since }}</span
            >
          </span>
        </template>
      </li>
    </template>
  </ul>
  <div class="st-presence-badge__actions" data-testid="badge-actions">
    <template v-if="showRequest">
      <button
        type="button"
        class="st-presence-badge__action"
        data-testid="action-request"
        :data-untranslated="isMissing('unlockRequestLabel')
          ? collabUntranslatedDataValue('unlockRequestLabel')
          : null"
        :disabled="!state.canRequestUnlock"
        @click="emit('requestUnlock')">{{ requestText }}</button
      >
    </template>
    <template v-if="showAccept">
      <button
        type="button"
        class="st-presence-badge__action"
        data-testid="action-accept"
        :data-untranslated="isMissing('unlockAcceptLabel')
          ? collabUntranslatedDataValue('unlockAcceptLabel')
          : null"
        @click="emit('acceptUnlock')">{{ acceptText }}</button
      >
    </template>
    <template v-if="showForce">
      <button
        type="button"
        class="st-presence-badge__action"
        data-testid="action-force"
        :data-untranslated="isMissing('unlockForceLabel')
          ? collabUntranslatedDataValue('unlockForceLabel')
          : null"
        @click="emit('forceUnlock')">{{ forceText }}</button
      >
    </template>
    <template v-if="showRelease">
      <button
        type="button"
        class="st-presence-badge__action"
        data-testid="action-release"
        :data-untranslated="isMissing('unlockReleaseLabel')
          ? collabUntranslatedDataValue('unlockReleaseLabel')
          : null"
        @click="emit('releaseLock')">{{ releaseText }}</button
      >
    </template>
  </div>
  <span
    class="st-presence-badge__tooltip"
    :id="tooltipId"
    role="tooltip"
    data-testid="badge-tooltip"
    :data-untranslated="isMissing(tooltipKey)
      ? collabUntranslatedDataValue(tooltipKey)
      : null">{{ tooltip }}</span
  >
</div>

</template>

<style>
  .st-presence-badge {
    align-items: center;
    display: inline-flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-sm, 0.5rem);
  }

  .st-presence-badge__stack {
    align-items: center;
    display: inline-flex;
    flex-direction: row;
  }

  .st-presence-badge__stack > * {
    box-shadow: 0 0 0 2px var(--st-semantic-surface-default, #ffffff);
    position: relative;
  }

  .st-presence-badge__stack > * + * {
    margin-inline-start: -0.5rem;
  }

  .st-presence-badge__avatar {
    align-items: center;
    background-color: var(
      --badge-actor,
      var(--st-semantic-surface-subtle, #eef2f7)
    );
    border-radius: 50%;
    color: var(--st-semantic-text-inverse, #ffffff);
    display: inline-flex;
    flex: 0 0 auto;
    font-size: 0.6875rem;
    font-weight: 700;
    height: 1.75rem;
    justify-content: center;
    letter-spacing: 0.01em;
    line-height: 1;
    user-select: none;
    width: 1.75rem;
  }

  .st-presence-badge__initials {
    pointer-events: none;
  }

  .st-presence-badge__key {
    background-color: var(--st-semantic-surface-default, #ffffff);
    border: 1px solid var(--st-semantic-border-subtle, #cbd5e1);
    border-radius: 50%;
    bottom: -2px;
    height: 0.625rem;
    inset-inline-end: -2px;
    position: absolute;
    width: 0.625rem;
  }

  .st-presence-badge__key::after {
    background-color: var(--st-semantic-text-secondary, #64748b);
    border-radius: 50%;
    content: "";
    display: block;
    height: 0.25rem;
    margin: 0.125rem auto 0;
    width: 0.25rem;
  }

  .st-presence-badge__count,
  .st-presence-badge__lock {
    color: var(--st-semantic-text-secondary, #64748b);
    font-size: 0.75rem;
    line-height: 1.25;
  }

  .st-presence-badge__roster {
    display: block;
    flex-basis: 100%;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .st-presence-badge__member {
    display: inline;
  }

  .st-presence-badge__name {
    overflow: hidden;
  }

  .st-presence-badge__activity {
    display: inline-flex;
    gap: 0.25rem;
  }

  .st-presence-badge__actions {
    align-items: center;
    display: inline-flex;
    gap: 0.375rem;
  }

  .st-presence-badge__action {
    background-color: var(--st-semantic-surface-subtle, #eef2f7);
    border: 1px solid var(--st-semantic-border-subtle, #cbd5e1);
    border-radius: var(--st-radius-sm, 0.375rem);
    color: inherit;
    cursor: pointer;
    font-size: 0.75rem;
    line-height: 1.25;
    padding: 0.25rem 0.5rem;
  }

  .st-presence-badge__action:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  .st-presence-badge__tooltip {
    color: var(--st-semantic-text-secondary, #64748b);
    font-size: 0.75rem;
    line-height: 1.25;
  }

  .st-presence-badge__hidden {
    border: 0;
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    height: 1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  }
</style>
