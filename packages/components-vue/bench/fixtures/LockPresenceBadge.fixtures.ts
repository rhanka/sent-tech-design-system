import type { CollaborationActor, CollaborationCapabilities, LockSnapshot, PresenceSnapshot, RichTextMessages } from '@sentropic/design-system-rich-text';
import { createPresenceSnapshot } from '@sentropic/design-system-rich-text';
import type { Fixture } from './types.js';
export const NOW = "2026-10-29T12:00:00.000Z";
const FUTURE = "2026-10-29T13:00:00.000Z";
const PAST = "2026-10-29T11:00:00.000Z";

export const MESSAGES: RichTextMessages = {
  editorLabel: "SENTINEL-EDITOR",
  placeholder: "SENTINEL-PLACEHOLDER",
  preservedBlockLabel: "SENTINEL-PRESERVED-{kind}",
  externalConflictLabel: "SENTINEL-CONFLICT",
  presenceLabel: "SENTINEL-PRESENCE-{count}",
  lockLabel: "SENTINEL-LOCK-{holder}",
  unlockRequestLabel: "SENTINEL-UNLOCK-REQUEST",
  noLockLabel: "SENTINEL-NO-LOCK",
  unlockAcceptLabel: "SENTINEL-UNLOCK-ACCEPT",
  unlockForceLabel: "SENTINEL-UNLOCK-FORCE",
  unlockReleaseLabel: "SENTINEL-UNLOCK-RELEASE",
  tooltipLockedLabel: "SENTINEL-TOOLTIP-LOCKED-{holder}-SENTINEL-REQUEST-WORD",
  tooltipLockedReadOnlyLabel: "SENTINEL-TOOLTIP-READONLY-{holder}",
  tooltipUnlockedLabel: "SENTINEL-TOOLTIP-UNLOCKED",
  rosterLabel: "SENTINEL-ROSTER",
  requesterKeyLabel: "SENTINEL-KEY-{label}",
};

function actor(
  actorId: string,
  overrides: Partial<CollaborationActor> = {},
): CollaborationActor {
  return {
    actorId,
    kind: "human",
    displayLabel: actorId,
    color: "#112233",
    ...overrides,
  };
}

export const SELF = actor("actor:self", { displayLabel: "Self" });
export const OTHER = actor("actor:other", {
  displayLabel: "Other",
  color: "#445566",
});
export const THIRD = actor("actor:third", {
  displayLabel: "Third",
  color: "#778899",
});

export function lockSnapshot(
  holder: CollaborationActor | null,
  expiresAt: string | null,
  requester: CollaborationActor | null = null,
): LockSnapshot {
  return {
    unit: { scopeRef: "scope:canvas-1" },
    holder,
    expiresAt,
    unlockRequestedBy: requester,
  };
}

export function presenceOf(actors: readonly CollaborationActor[]): PresenceSnapshot {
  return createPresenceSnapshot({
    scopeRef: "scope:canvas-1",
    actors: [SELF, ...actors],
    currentActorId: SELF.actorId,
  });
}

export function viewerCaps(): CollaborationCapabilities {
  return {
    currentActorId: SELF.actorId,
    canAcquire: false,
    canRequestUnlock: false,
    canForceUnlock: false,
  };
}

export function editorCaps(): CollaborationCapabilities {
  return {
    currentActorId: SELF.actorId,
    canAcquire: true,
    canRequestUnlock: true,
    canForceUnlock: false,
  };
}

export function adminCaps(): CollaborationCapabilities {
  return {
    currentActorId: SELF.actorId,
    canAcquire: true,
    canRequestUnlock: true,
    canForceUnlock: true,
  };
}


const base = { lock: null, presence: presenceOf([OTHER, THIRD]), capabilities: editorCaps(), messages: MESSAGES, nowIso: NOW };
export default [
  { id: 'default', props: base },
  { id: 'locked', props: { ...base, lock: lockSnapshot(OTHER, FUTURE) } },
  { id: 'read-only', props: { ...base, lock: lockSnapshot(OTHER, FUTURE), readOnly: true } },
  { id: 'holder-admin-request', props: { ...base, lock: lockSnapshot(SELF, FUTURE, THIRD), capabilities: adminCaps(), binding: { documentId: 'doc:1', sessionId: 'session:1', fieldKey: 'body' } } },
  { id: 'expired-missing-messages', props: { ...base, lock: lockSnapshot(OTHER, PAST), messages: {} } },
  { id: 'activity-inert-label', props: { ...base, presence: presenceOf([{ ...THIRD, displayLabel: '<b>Agent</b>', kind: 'agent', activity: { scopeRef: 'scope:agent', state: 'holding', since: NOW } }]) } },
] satisfies Fixture[];
