<script lang="ts">
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

  let {
    lock = null,
    presence = null,
    capabilities,
    messages,
    nowIso,
    readOnly = false,
    binding = null,
    onRequestUnlock,
    onAcceptUnlock,
    onForceUnlock,
    onReleaseLock,
  }: LockPresenceBadgeProps = $props();

  function provided(key: CollabMessageKey): string | undefined {
    const candidate: unknown = messages?.[key];
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

  const scopeRef = $derived(
    presence?.scopeRef ?? lock?.unit.scopeRef ?? "",
  );

  const state = $derived(
    derivePresenceBadgeState({
      presence: presence ?? { scopeRef, actors: [], total: 0 },
      lock,
      capabilities,
      currentActorId: capabilities.currentActorId,
      nowIso,
      readOnly,
    }),
  );

  const holder = $derived(state.lockActive ? (lock?.holder ?? null) : null);
  const requester = $derived(
    state.lockActive ? (lock?.unlockRequestedBy ?? null) : null,
  );
  const requesterId = $derived(requester?.actorId ?? null);
  const holderLabel = $derived(holder?.displayLabel ?? "");
  const liveMode = $derived(binding !== null && binding !== undefined);

  const presenceText = $derived(
    fill(resolveCollabLabel("presenceLabel"), {
      count: String(state.total),
    }),
  );
  const lockText = $derived(
    state.lockActive && holder !== null
      ? fill(resolveCollabLabel("lockLabel"), { holder: holderLabel })
      : resolveCollabLabel("noLockLabel"),
  );
  const tooltip = $derived(
    !state.lockActive
      ? fill(resolveCollabLabel("tooltipUnlockedLabel"), {
          count: String(state.total),
        })
      : readOnly
        ? fill(resolveCollabLabel("tooltipLockedReadOnlyLabel"), {
            holder: holderLabel,
          })
        : fill(resolveCollabLabel("tooltipLockedLabel"), {
            holder: holderLabel,
          }),
  );
  const tooltipKey = $derived(
    !state.lockActive
      ? ("tooltipUnlockedLabel" as CollabMessageKey)
      : readOnly
        ? ("tooltipLockedReadOnlyLabel" as CollabMessageKey)
        : ("tooltipLockedLabel" as CollabMessageKey),
  );
  const rosterText = $derived(
    fill(resolveCollabLabel("rosterLabel"), { count: String(state.total) }),
  );
  const requestText = $derived(resolveCollabLabel("unlockRequestLabel"));
  const acceptText = $derived(resolveCollabLabel("unlockAcceptLabel"));
  const forceText = $derived(resolveCollabLabel("unlockForceLabel"));
  const releaseText = $derived(resolveCollabLabel("unlockReleaseLabel"));

  function keyTextFor(entry: CollaborationActor): string {
    return fill(resolveCollabLabel("requesterKeyLabel"), {
      label: entry.displayLabel,
    });
  }

  const showRequest = $derived(
    state.lockActive &&
      holder !== null &&
      holder.actorId !== capabilities.currentActorId &&
      capabilities.canRequestUnlock,
  );
  const showAccept = $derived(
    state.lockActive &&
      requester !== null &&
      (holder?.actorId === capabilities.currentActorId ||
        capabilities.canForceUnlock),
  );
  const showForce = $derived(
    state.lockActive && capabilities.canForceUnlock,
  );
  const showRelease = $derived(
    state.lockActive &&
      holder !== null &&
      holder.actorId === capabilities.currentActorId,
  );
</script>

<div
  class="st-presence-badge"
  data-testid="presence-badge"
  data-role={state.role}
  data-lock-active={state.lockActive ? "true" : "false"}
  data-live={liveMode ? "true" : "false"}
  title={tooltip}
  aria-label={rosterText}
>
  <div
    class="st-presence-badge__stack"
    data-testid="avatar-stack"
    role="list"
    aria-label={rosterText}
  >
    {#each state.actors as entry (entry.actorId)}
      <span
        class="st-presence-badge__avatar"
        role="listitem"
        data-testid="avatar"
        data-actor-id={entry.actorId}
        data-kind={entry.kind}
        aria-label={entry.displayLabel}
        title={entry.displayLabel}
        style={avatarStyle(entry)}
      >
        <span class="st-presence-badge__initials" aria-hidden="true"
          >{initialsOf(entry)}</span
        >
        {#if requesterId !== null && requesterId === entry.actorId}
          <span class="st-presence-badge__key" aria-hidden="true"></span>
          <span class="st-presence-badge__hidden">{keyTextFor(entry)}</span>
        {/if}
      </span>
    {/each}
  </div>
  <span
    class="st-presence-badge__count"
    data-testid="presence-count"
    data-untranslated={isMissing("presenceLabel")
      ? collabUntranslatedDataValue("presenceLabel")
      : null}>{presenceText}</span
  >
  <span
    class="st-presence-badge__lock"
    data-testid="lock-status"
    data-untranslated={isMissing(state.lockActive && holder !== null ? "lockLabel" : "noLockLabel")
      ? collabUntranslatedDataValue(
          state.lockActive && holder !== null ? "lockLabel" : "noLockLabel",
        )
      : null}>{lockText}</span
  >
  <ul
    class="st-presence-badge__roster"
    data-testid="roster"
    aria-label={rosterText}
  >
    {#each state.actors as entry (entry.actorId)}
      <li
        class="st-presence-badge__member"
        data-testid="roster-item"
        data-actor-id={entry.actorId}
      >
        <span class="st-presence-badge__name">{entry.displayLabel}</span>
        {#if entry.activity}
          <span
            class="st-presence-badge__activity"
            data-testid={`activity-${entry.actorId}`}
          >
            <span
              class="st-presence-badge__activity-scope"
              data-testid={`activity-scope-${entry.actorId}`}
              >{entry.activity.scopeRef}</span
            >
            <span
              class="st-presence-badge__activity-state"
              data-testid={`activity-state-${entry.actorId}`}
              >{entry.activity.state}</span
            >
            <span
              class="st-presence-badge__activity-since"
              data-testid={`activity-since-${entry.actorId}`}
              >{entry.activity.since}</span
            >
          </span>
        {/if}
      </li>
    {/each}
  </ul>
  <div class="st-presence-badge__actions" data-testid="badge-actions">
    {#if showRequest}
      <button
        type="button"
        class="st-presence-badge__action"
        data-testid="action-request"
        data-untranslated={isMissing("unlockRequestLabel")
          ? collabUntranslatedDataValue("unlockRequestLabel")
          : null}
        disabled={!state.canRequestUnlock}
        onclick={() => onRequestUnlock?.()}>{requestText}</button
      >
    {/if}
    {#if showAccept}
      <button
        type="button"
        class="st-presence-badge__action"
        data-testid="action-accept"
        data-untranslated={isMissing("unlockAcceptLabel")
          ? collabUntranslatedDataValue("unlockAcceptLabel")
          : null}
        onclick={() => onAcceptUnlock?.()}>{acceptText}</button
      >
    {/if}
    {#if showForce}
      <button
        type="button"
        class="st-presence-badge__action"
        data-testid="action-force"
        data-untranslated={isMissing("unlockForceLabel")
          ? collabUntranslatedDataValue("unlockForceLabel")
          : null}
        onclick={() => onForceUnlock?.()}>{forceText}</button
      >
    {/if}
    {#if showRelease}
      <button
        type="button"
        class="st-presence-badge__action"
        data-testid="action-release"
        data-untranslated={isMissing("unlockReleaseLabel")
          ? collabUntranslatedDataValue("unlockReleaseLabel")
          : null}
        onclick={() => onReleaseLock?.()}>{releaseText}</button
      >
    {/if}
  </div>
  <span
    class="st-presence-badge__tooltip"
    data-testid="badge-tooltip"
    data-untranslated={isMissing(tooltipKey)
      ? collabUntranslatedDataValue(tooltipKey)
      : null}>{tooltip}</span
  >
</div>

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

  .st-presence-badge__stack > :global(*) {
    box-shadow: 0 0 0 2px var(--st-semantic-surface-default, #ffffff);
    position: relative;
  }

  .st-presence-badge__stack > :global(* + *) {
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
    display: none;
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
