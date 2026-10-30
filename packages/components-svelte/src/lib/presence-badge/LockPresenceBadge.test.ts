/**
 * CL-1B — presence/lock badge RED witnesses (spec §8 lot CL-1B, §6.4, §7.1).
 *
 * RED note: this file imports `./LockPresenceBadge.svelte`, created by
 * CL-1B. On the parent commit (f1533bdd) the module does not exist, so every
 * suite below fails there at import time. Each witness also fails for its
 * stated behavioral reason once the module exists but the behavior is absent
 * (see per-witness notes).
 *
 * Environment: jsdom via @testing-library/svelte. No network, no socket, no
 * timer: the provider double below resolves from an in-memory map with
 * Promise.resolve only.
 */
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/svelte";
import { tick } from "svelte";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  createPresenceSnapshot,
  derivePresenceBadgeState,
  isLockExpired,
} from "@sentropic/design-system-rich-text";
import type {
  CollaborationActor,
  CollaborationCapabilities,
  FieldBindingIdentity,
  LockSnapshot,
  PresenceSnapshot,
  RichTextMessages,
} from "@sentropic/design-system-rich-text";
import LockPresenceBadge from "./LockPresenceBadge.svelte";

const NOW = "2026-10-29T12:00:00.000Z";
const FUTURE = "2026-10-29T13:00:00.000Z";
const PAST = "2026-10-29T11:00:00.000Z";

const MESSAGES: RichTextMessages = {
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

const SELF = actor("actor:self", { displayLabel: "Self" });
const OTHER = actor("actor:other", {
  displayLabel: "Other",
  color: "#445566",
});
const THIRD = actor("actor:third", {
  displayLabel: "Third",
  color: "#778899",
});

function lockSnapshot(
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

function presenceOf(actors: readonly CollaborationActor[]): PresenceSnapshot {
  return createPresenceSnapshot({
    scopeRef: "scope:canvas-1",
    actors: [SELF, ...actors],
    currentActorId: SELF.actorId,
  });
}

function viewerCaps(): CollaborationCapabilities {
  return {
    currentActorId: SELF.actorId,
    canAcquire: false,
    canRequestUnlock: false,
    canForceUnlock: false,
  };
}

function editorCaps(): CollaborationCapabilities {
  return {
    currentActorId: SELF.actorId,
    canAcquire: true,
    canRequestUnlock: true,
    canForceUnlock: false,
  };
}

function adminCaps(): CollaborationCapabilities {
  return {
    currentActorId: SELF.actorId,
    canAcquire: true,
    canRequestUnlock: true,
    canForceUnlock: true,
  };
}

function badgeOf(
  testId: string,
  container: HTMLElement,
): HTMLElement | null {
  return container.querySelector(`[data-testid="${testId}"]`);
}

describe("CL-1B witness 1 — role from snapshots plus capabilities", () => {
  it("renders viewer, editor and admin differently for the same snapshot", async () => {
    const lock = lockSnapshot(OTHER, FUTURE);
    const presence = presenceOf([OTHER, THIRD]);
    const base = {
      lock,
      presence,
      messages: MESSAGES,
      nowIso: NOW,
    };
    const viewer = render(LockPresenceBadge, {
      props: { ...base, capabilities: viewerCaps() },
    });
    await tick();
    expect(
      badgeOf("presence-badge", viewer.container)?.getAttribute("data-role"),
    ).toBe("viewer");
    expect(
      viewer.queryByRole("button", { name: "SENTINEL-UNLOCK-REQUEST" }),
    ).toBeNull();
    expect(
      viewer.queryByRole("button", { name: "SENTINEL-UNLOCK-FORCE" }),
    ).toBeNull();
    viewer.unmount();

    const editor = render(LockPresenceBadge, {
      props: { ...base, capabilities: editorCaps() },
    });
    await tick();
    expect(
      badgeOf("presence-badge", editor.container)?.getAttribute("data-role"),
    ).toBe("viewer");
    const request = editor.getByRole("button", {
      name: "SENTINEL-UNLOCK-REQUEST",
    });
    expect((request as HTMLButtonElement).disabled).toBe(false);
    expect(
      editor.queryByRole("button", { name: "SENTINEL-UNLOCK-FORCE" }),
    ).toBeNull();
    editor.unmount();

    const admin = render(LockPresenceBadge, {
      props: { ...base, capabilities: adminCaps() },
    });
    await tick();
    expect(
      badgeOf("presence-badge", admin.container)?.getAttribute("data-role"),
    ).toBe("admin");
    expect(
      admin.getByRole("button", { name: "SENTINEL-UNLOCK-FORCE" }),
    ).not.toBeNull();
    admin.unmount();
  });

  it("derives holder and requester from the snapshots, never alone", async () => {
    const presence = presenceOf([OTHER]);
    const heldBySelf = render(LockPresenceBadge, {
      props: {
        lock: lockSnapshot(SELF, FUTURE),
        presence,
        capabilities: editorCaps(),
        messages: MESSAGES,
        nowIso: NOW,
      },
    });
    await tick();
    expect(
      badgeOf("presence-badge", heldBySelf.container)?.getAttribute(
        "data-role",
      ),
    ).toBe("holder");
    expect(
      heldBySelf.queryByRole("button", {
        name: "SENTINEL-UNLOCK-REQUEST",
      }),
    ).toBeNull();
    expect(
      heldBySelf.getByRole("button", { name: "SENTINEL-UNLOCK-RELEASE" }),
    ).not.toBeNull();
    heldBySelf.unmount();

    const requested = render(LockPresenceBadge, {
      props: {
        lock: lockSnapshot(OTHER, FUTURE, SELF),
        presence,
        capabilities: editorCaps(),
        messages: MESSAGES,
        nowIso: NOW,
      },
    });
    await tick();
    expect(
      badgeOf("presence-badge", requested.container)?.getAttribute(
        "data-role",
      ),
    ).toBe("requester");
    requested.unmount();
  });

  it("renders no lock state when the snapshot is absent", async () => {
    const { container, queryByRole } = render(LockPresenceBadge, {
      props: {
        lock: null,
        presence: presenceOf([OTHER]),
        capabilities: editorCaps(),
        messages: MESSAGES,
        nowIso: NOW,
      },
    });
    await tick();
    expect(badgeOf("lock-status", container)?.textContent).toBe(
      "SENTINEL-NO-LOCK",
    );
    expect(
      queryByRole("button", { name: "SENTINEL-UNLOCK-REQUEST" }),
    ).toBeNull();
    expect(
      queryByRole("button", { name: "SENTINEL-UNLOCK-FORCE" }),
    ).toBeNull();
    expect(
      queryByRole("button", { name: "SENTINEL-UNLOCK-RELEASE" }),
    ).toBeNull();
  });
});

describe("CL-1B witness 2 — expired lock renders as no lock", () => {
  it("treats an expired lock as absent in the badge state and the render", async () => {
    const presence = presenceOf([OTHER]);
    const expired = lockSnapshot(OTHER, PAST);
    expect(isLockExpired(expired, NOW)).toBe(true);
    const state = derivePresenceBadgeState({
      presence,
      lock: expired,
      capabilities: editorCaps(),
      currentActorId: SELF.actorId,
      nowIso: NOW,
    });
    expect(state.lockActive).toBe(false);
    expect(state.canRequestUnlock).toBe(false);

    const { container, queryByRole } = render(LockPresenceBadge, {
      props: {
        lock: expired,
        presence,
        capabilities: editorCaps(),
        messages: MESSAGES,
        nowIso: NOW,
      },
    });
    await tick();
    expect(badgeOf("lock-status", container)?.textContent).toBe(
      "SENTINEL-NO-LOCK",
    );
    expect(
      queryByRole("button", { name: "SENTINEL-UNLOCK-REQUEST" }),
    ).toBeNull();
  });
});

describe("CL-1B witness 3 — every visible string is injected", () => {
  it("renders sentinel messages and marks missing keys", async () => {
    const { container } = render(LockPresenceBadge, {
      props: {
        lock: lockSnapshot(OTHER, FUTURE),
        presence: presenceOf([OTHER, THIRD]),
        capabilities: editorCaps(),
        messages: MESSAGES,
        nowIso: NOW,
      },
    });
    await tick();
    expect(badgeOf("presence-count", container)?.textContent).toBe(
      "SENTINEL-PRESENCE-3",
    );
    expect(badgeOf("lock-status", container)?.textContent).toBe(
      "SENTINEL-LOCK-Other",
    );

    const missing = render(LockPresenceBadge, {
      props: {
        lock: lockSnapshot(OTHER, FUTURE),
        presence: presenceOf([OTHER]),
        capabilities: editorCaps(),
        messages: {
          editorLabel: "SENTINEL-EDITOR",
          placeholder: "SENTINEL-PLACEHOLDER",
          preservedBlockLabel: "SENTINEL-PRESERVED-{kind}",
          externalConflictLabel: "SENTINEL-CONFLICT",
        } as unknown as RichTextMessages,
        nowIso: NOW,
      },
    });
    await tick();
    expect(badgeOf("lock-status", missing.container)?.textContent).toBe(
      "⟦untranslated:collab.lockLabel⟧",
    );
    expect(
      badgeOf("lock-status", missing.container)?.getAttribute(
        "data-untranslated",
      ),
    ).toBe("collab.lockLabel");
    missing.unmount();
  });

  it("the component source carries no built-in literal", async () => {
    const source = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "LockPresenceBadge.svelte"),
      "utf8",
    );
    const markup =
      source.split("</script>").slice(-1)[0]?.split("<style")[0] ?? "";
    const literals = [...markup.matchAll(/>([^<>{}]+)</g)]
      .map((match) => (match[1] as string).trim())
      .filter((text) => text.length > 0);
    expect(literals).toEqual([]);
    const labelled = [...markup.matchAll(/(aria-label|placeholder)="([^"]+)"/g)].map(
      (match) => match[0],
    );
    expect(labelled).toEqual([]);
    expect(source.includes("User")).toBe(false);
  });
});

describe("CL-1B witness 4 — labels render as inert text", () => {
  it("does not interpret markup in display labels", async () => {
    const evil = actor("actor:evil", {
      displayLabel: "<b>SENTINEL-BOLD</b><img src=x>",
      color: "#123456",
    });
    const presence = createPresenceSnapshot({
      scopeRef: "scope:canvas-1",
      actors: [SELF, evil],
      currentActorId: SELF.actorId,
    });
    const { container } = render(LockPresenceBadge, {
      props: {
        lock: lockSnapshot(evil, FUTURE),
        presence,
        capabilities: viewerCaps(),
        messages: MESSAGES,
        nowIso: NOW,
      },
    });
    await tick();
    expect(container.querySelector("b")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
    expect(container.textContent).toContain(
      "<b>SENTINEL-BOLD</b><img src=x>",
    );
  });
});

describe("CL-1B witness 5 — in-memory provider double", () => {
  it("drives acquire, request, accept and force with badge state at each step", async () => {
    const fetchSpy =
      typeof globalThis.fetch === "function"
        ? vi.spyOn(globalThis, "fetch")
        : null;
    try {
      type Store = { holder: CollaborationActor | null; requester: CollaborationActor | null };
      const store: Store = { holder: null, requester: null };
      let acting: CollaborationActor = SELF;
      const snapshot = (): LockSnapshot =>
        lockSnapshot(store.holder, FUTURE, store.requester);
      const provider = {
        asActor(next: CollaborationActor): void {
          acting = next;
        },
        acquireLock(): Promise<{ acquired: boolean; lock: LockSnapshot }> {
          if (store.holder !== null) {
            return Promise.resolve({ acquired: false, lock: snapshot() });
          }
          store.holder = acting;
          store.requester = null;
          return Promise.resolve({ acquired: true, lock: snapshot() });
        },
        requestUnlock(): Promise<LockSnapshot> {
          store.requester = acting;
          return Promise.resolve(snapshot());
        },
        acceptUnlock(): Promise<LockSnapshot> {
          if (store.requester !== null) {
            store.holder = store.requester;
            store.requester = null;
          }
          return Promise.resolve(snapshot());
        },
        forceUnlock(): Promise<void> {
          store.holder = null;
          store.requester = null;
          return Promise.resolve();
        },
      };

      const presence = presenceOf([OTHER, THIRD]);
      const check = async (
        lock: LockSnapshot | null,
        caps: CollaborationCapabilities,
        expectedRole: string,
        expectedLockText: string,
      ): Promise<void> => {
        const state = derivePresenceBadgeState({
          presence,
          lock,
          capabilities: caps,
          currentActorId: SELF.actorId,
          nowIso: NOW,
        });
        expect(state.role).toBe(expectedRole);
        const view = render(LockPresenceBadge, {
          props: {
            lock,
            presence,
            capabilities: caps,
            messages: MESSAGES,
            nowIso: NOW,
          },
        });
        await tick();
        expect(
          badgeOf("presence-badge", view.container)?.getAttribute("data-role"),
        ).toBe(expectedRole);
        expect(badgeOf("lock-status", view.container)?.textContent).toBe(
          expectedLockText,
        );
        view.unmount();
      };

      provider.asActor(OTHER);
      const acquired = await provider.acquireLock();
      expect(acquired.acquired).toBe(true);
      await check(acquired.lock, editorCaps(), "viewer", "SENTINEL-LOCK-Other");

      provider.asActor(SELF);
      const requested = await provider.requestUnlock();
      expect(requested.unlockRequestedBy?.actorId).toBe(SELF.actorId);
      await check(requested, editorCaps(), "requester", "SENTINEL-LOCK-Other");

      provider.asActor(OTHER);
      const accepted = await provider.acceptUnlock();
      expect(accepted.holder?.actorId).toBe(SELF.actorId);
      expect(accepted.unlockRequestedBy).toBeNull();
      await check(accepted, editorCaps(), "holder", "SENTINEL-LOCK-Self");

      provider.asActor(SELF);
      await provider.forceUnlock();
      const forced = snapshot();
      expect(forced.holder).toBeNull();
      await check(forced, adminCaps(), "admin", "SENTINEL-NO-LOCK");

      expect(fetchSpy?.mock.calls.length ?? 0).toBe(0);
    } finally {
      fetchSpy?.mockRestore();
    }
  });
});

describe("CL-1B witness 6 — agent activity verbatim", () => {
  it("renders scope, state and since verbatim for an agent with activity", async () => {
    const agent = actor("actor:agent-1", {
      kind: "agent",
      displayLabel: "Agent One",
      color: "#00aa99",
      activity: {
        scopeRef: "SENTINEL-SCOPE",
        state: "holding",
        since: "SENTINEL-SINCE",
      },
    });
    const presence = createPresenceSnapshot({
      scopeRef: "scope:canvas-1",
      actors: [SELF, agent],
      currentActorId: SELF.actorId,
    });
    const { container } = render(LockPresenceBadge, {
      props: {
        lock: null,
        presence,
        capabilities: viewerCaps(),
        messages: MESSAGES,
        nowIso: NOW,
      },
    });
    await tick();
    const activity = badgeOf("activity-actor:agent-1", container);
    expect(activity).not.toBeNull();
    expect(activity?.textContent).toContain("SENTINEL-SCOPE");
    expect(activity?.textContent).toContain("holding");
    expect(activity?.textContent).toContain("SENTINEL-SINCE");
  });

  it("renders no scope line for an actor without activity", async () => {
    const { container } = render(LockPresenceBadge, {
      props: {
        lock: null,
        presence: presenceOf([OTHER]),
        capabilities: viewerCaps(),
        messages: MESSAGES,
        nowIso: NOW,
      },
    });
    await tick();
    expect(badgeOf("activity-actor:other", container)).toBeNull();
  });
});

describe("CL-1B witness 7 — B8 display half", () => {
  it("shows lock facts beside a live binding without driving editable", async () => {
    const binding: FieldBindingIdentity = {
      documentId: "canvas:artifact-1",
      sessionId: "session:1",
      fieldKey: "field:description",
    };
    const lock = lockSnapshot(OTHER, FUTURE);
    const presence = presenceOf([OTHER, THIRD]);
    const { container } = render(LockPresenceBadge, {
      props: {
        lock,
        presence,
        capabilities: editorCaps(),
        messages: MESSAGES,
        nowIso: NOW,
        binding,
      },
    });
    await tick();
    expect(badgeOf("lock-status", container)?.textContent).toBe(
      "SENTINEL-LOCK-Other",
    );
    expect(badgeOf("presence-count", container)?.textContent).toBe(
      "SENTINEL-PRESENCE-3",
    );
    expect(container.querySelector("[contenteditable]")).toBeNull();
    expect(container.querySelector('[role="textbox"]')).toBeNull();
    const badge = badgeOf("presence-badge", container);
    expect(badge?.getAttribute("data-editable")).toBeNull();
  });
});

describe("CL-1B composition — owner last, read-only, count versus list", () => {
  it("orders the holder last while keeping roster order otherwise", async () => {
    const holder = actor("actor:holder", { displayLabel: "Holder" });
    const first = actor("actor:first", { displayLabel: "First" });
    const second = actor("actor:second", { displayLabel: "Second" });
    const presence = createPresenceSnapshot({
      scopeRef: "scope:canvas-1",
      actors: [SELF, holder, first, second],
      currentActorId: SELF.actorId,
    });
    const state = derivePresenceBadgeState({
      presence,
      lock: lockSnapshot(holder, FUTURE),
      capabilities: viewerCaps(),
      currentActorId: SELF.actorId,
      nowIso: NOW,
    });
    expect(state.actors.map((entry) => entry.actorId)).toEqual([
      "actor:first",
      "actor:second",
      "actor:holder",
    ]);

    const { container } = render(LockPresenceBadge, {
      props: {
        lock: lockSnapshot(holder, FUTURE),
        presence,
        capabilities: viewerCaps(),
        messages: MESSAGES,
        nowIso: NOW,
      },
    });
    await tick();
    const order = [...container.querySelectorAll('[data-testid="avatar"]')].map(
      (node) => node.getAttribute("data-actor-id"),
    );
    expect(order[order.length - 1]).toBe("actor:holder");
  });

  it("disables request-unlock and omits the request wording in read-only mode", async () => {
    const lock = lockSnapshot(OTHER, FUTURE);
    const presence = presenceOf([OTHER]);
    const editable = render(LockPresenceBadge, {
      props: {
        lock,
        presence,
        capabilities: editorCaps(),
        messages: MESSAGES,
        nowIso: NOW,
        readOnly: false,
      },
    });
    await tick();
    const enabled = editable.getByRole("button", {
      name: "SENTINEL-UNLOCK-REQUEST",
    }) as HTMLButtonElement;
    expect(enabled.disabled).toBe(false);
    expect(
      badgeOf("presence-badge", editable.container)?.getAttribute("title"),
    ).toContain("SENTINEL-REQUEST-WORD");
    editable.unmount();

    const readOnly = render(LockPresenceBadge, {
      props: {
        lock,
        presence,
        capabilities: editorCaps(),
        messages: MESSAGES,
        nowIso: NOW,
        readOnly: true,
      },
    });
    await tick();
    const disabled = readOnly.getByRole("button", {
      name: "SENTINEL-UNLOCK-REQUEST",
    }) as HTMLButtonElement;
    expect(disabled.disabled).toBe(true);
    const title =
      badgeOf("presence-badge", readOnly.container)?.getAttribute("title") ??
      "";
    expect(title).not.toContain("SENTINEL-REQUEST-WORD");
    expect(title).toContain("Other");
    readOnly.unmount();
  });

  it("counts the current user while the avatar list excludes them", async () => {
    const presence = presenceOf([OTHER, THIRD]);
    expect(presence.total).toBe(3);
    expect(presence.actors.map((entry) => entry.actorId)).toEqual([
      "actor:other",
      "actor:third",
    ]);
    const { container } = render(LockPresenceBadge, {
      props: {
        lock: null,
        presence,
        capabilities: viewerCaps(),
        messages: MESSAGES,
        nowIso: NOW,
      },
    });
    await tick();
    expect(badgeOf("presence-count", container)?.textContent).toBe(
      "SENTINEL-PRESENCE-3",
    );
    expect(
      container.querySelectorAll('[data-testid="avatar"]').length,
    ).toBe(2);
  });

  it("invokes the four callbacks from their buttons", async () => {
    const onRequestUnlock = vi.fn();
    const onAcceptUnlock = vi.fn();
    const onForceUnlock = vi.fn();
    const onReleaseLock = vi.fn();
    const requested = render(LockPresenceBadge, {
      props: {
        lock: lockSnapshot(SELF, FUTURE, OTHER),
        presence: presenceOf([OTHER]),
        capabilities: adminCaps(),
        messages: MESSAGES,
        nowIso: NOW,
        onRequestUnlock,
        onAcceptUnlock,
        onForceUnlock,
        onReleaseLock,
      },
    });
    await tick();
    await fireEvent.click(
      requested.getByRole("button", { name: "SENTINEL-UNLOCK-ACCEPT" }),
    );
    await fireEvent.click(
      requested.getByRole("button", { name: "SENTINEL-UNLOCK-FORCE" }),
    );
    await fireEvent.click(
      requested.getByRole("button", { name: "SENTINEL-UNLOCK-RELEASE" }),
    );
    expect(onAcceptUnlock).toHaveBeenCalledTimes(1);
    expect(onForceUnlock).toHaveBeenCalledTimes(1);
    expect(onReleaseLock).toHaveBeenCalledTimes(1);
    expect(onRequestUnlock).not.toHaveBeenCalled();
    requested.unmount();

    const requestable = render(LockPresenceBadge, {
      props: {
        lock: lockSnapshot(OTHER, FUTURE),
        presence: presenceOf([OTHER]),
        capabilities: editorCaps(),
        messages: MESSAGES,
        nowIso: NOW,
        onRequestUnlock,
      },
    });
    await tick();
    await fireEvent.click(
      requestable.getByRole("button", { name: "SENTINEL-UNLOCK-REQUEST" }),
    );
    expect(onRequestUnlock).toHaveBeenCalledTimes(1);
    requestable.unmount();
  });
});
