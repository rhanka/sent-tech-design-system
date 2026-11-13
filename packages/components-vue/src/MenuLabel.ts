import { Fragment, h, type VNodeChild } from "vue";

// Private renderer preserving the pre-cascade label contract without adding
// an element inside the existing label/group wrappers.
export const MenuLabel = (props: { label: unknown }) =>
  h(Fragment, null, [props.label as VNodeChild]);
