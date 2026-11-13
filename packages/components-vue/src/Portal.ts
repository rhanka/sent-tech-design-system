export type PortalProps = {
  /**
   * Where to teleport the children. A CSS selector string or an actual
   * `HTMLElement`. Defaults to the document `<body>`.
   */
  target?: string | HTMLElement;
  /** When `true`, render inline in place (no teleportation). */
  disabled?: boolean;
  /** Optional class applied to the portal container element. */
  class?: string;
};

export { default as Portal } from './Portal.vue';
