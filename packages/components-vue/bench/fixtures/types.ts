export type Fixture = {
  /** The first entry must be named default; G5 mounts it. */
  id: string;
  props: Record<string, unknown>;
  /** Literal template markup; a scope is a Vue slot destructuring expression. */
  slots?: Record<string, string | { html: string; scope: string }>;
  /** Only for a VNode-prop → named-slot migration; applied to the old .ts host. */
  legacyProps?: Record<string, unknown>;
};
