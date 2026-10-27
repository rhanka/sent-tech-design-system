/**
 * The profiles this lot declares, and the registry that holds them.
 *
 * `defaultProfileRegistry` is a convenience for tests, fixtures and consumers
 * that want the four declared profiles. It is NOT ambient truth: every
 * validation entry point takes a registry, so a host can register its own
 * profiles and leave the skeletons out entirely.
 */

import { createProfileRegistry, type ProfileRegistry } from "../profile.js";
import { genericProfile } from "./generic.js";
import { generic2Profile } from "./generic2.js";
import { archimateSkeletonProfile, bpmnSkeletonProfile, umlSkeletonProfile } from "./skeletons.js";

export * from "./generic.js";
export * from "./generic2.js";
export * from "./skeletons.js";

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
]);
