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
import { archimateSkeletonProfile, bpmnSkeletonProfile, umlSkeletonProfile } from "./skeletons.js";

export * from "./generic.js";
export * from "./skeletons.js";

/** `generic@1` alone: the only complete profile of this lot. */
export const completeProfiles = [genericProfile] as const;

/** The three declared skeletons. No conformance to BPMN, ArchiMate or UML is claimed. */
export const skeletonProfiles = [bpmnSkeletonProfile, archimateSkeletonProfile, umlSkeletonProfile] as const;

export const defaultProfileRegistry: ProfileRegistry = createProfileRegistry([
  ...completeProfiles,
  ...skeletonProfiles,
]);
