/**
 * The profiles this lot declares, and the registry that holds them.
 *
 * `defaultProfileRegistry` is a convenience for tests, fixtures and consumers
 * that want the four declared profiles. It is NOT ambient truth: every
 * validation entry point takes a registry, so a host can register its own
 * profiles and leave the skeletons out entirely.
 */

import { embeddedExecutorBindings, type ExecutorProfileBindings } from "../bindings.js";
import { createProfileRegistry, type ProfileRegistry } from "../profile.js";
import { genericProfile } from "./generic.js";
import { generic2Profile } from "./generic2.js";
import { archimateSkeletonProfile, bpmnSkeletonProfile, umlSkeletonProfile } from "./skeletons.js";
import { archimate2Profile } from "./archimate2.js";
import { uml2Profile } from "./uml2.js";

export * from "./generic.js";
export * from "./generic2.js";
export * from "./skeletons.js";
export * from "./archimate2.js";
export * from "./uml2.js";

/** `generic@1` alone: the only complete profile of this lot. */
export const completeProfiles = [genericProfile] as const;

/** The three declared skeletons. No conformance to BPMN, ArchiMate or UML is claimed. */
export const skeletonProfiles = [bpmnSkeletonProfile, archimateSkeletonProfile, umlSkeletonProfile] as const;

export const defaultProfileRegistry: ProfileRegistry = createProfileRegistry([
  ...completeProfiles,
  ...skeletonProfiles,
]);

/**
 * `generic@2` next to the @1 profiles (M3 §5.5). Kept separate from
 * `defaultProfileRegistry` so the four retained @1 rows keep their exact
 * native behaviour and diagnostics; a consumer opts into @2 explicitly.
 */
export const m3ProfileRegistry: ProfileRegistry = createProfileRegistry([
  ...completeProfiles,
  ...skeletonProfiles,
  generic2Profile,
  archimate2Profile,
  uml2Profile,
]);

/** All six @1/@2 ids for coexistence and reload witnesses (§3.13.2). */
export const allProfilesRegistry: ProfileRegistry = createProfileRegistry([
  ...completeProfiles,
  ...skeletonProfiles,
  generic2Profile,
  archimate2Profile,
  uml2Profile,
]);

/**
 * The shipped `executor-profile-bindings@1` table (M3 §5.3.1): one verifying
 * row per shipped profile, with its imposed adapter. Consumers pass it
 * explicitly; absence of a table never silently selects an adapter for a
 * profile outside the four retained identities.
 */
export const shippedExecutorBindings: ExecutorProfileBindings = embeddedExecutorBindings([
  ...completeProfiles,
  ...skeletonProfiles,
  generic2Profile,
  archimate2Profile,
  uml2Profile,
]);

/**
 * The packaged verified default rows for exactly the four retained @1
 * identities (M3 §5.3.1), each with `legacy-constraints@1`. Every other
 * profile, any version, requires its own verified row.
 */
export const retainedExecutorBindings: ExecutorProfileBindings = embeddedExecutorBindings([
  ...completeProfiles,
  ...skeletonProfiles,
]);
