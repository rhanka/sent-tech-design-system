import type { FlexAlign, FlexJustify } from './Flex.vue';
const ALIGN: Record<FlexAlign, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch",
  baseline: "baseline",
};
const JUSTIFY: Record<FlexJustify, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
  around: "space-around",
  evenly: "space-evenly",
};
export function alignValue(align: FlexAlign | undefined): string | undefined {
  return align ? ALIGN[align] : undefined;
}
export function justifyValue(justify: FlexJustify | undefined): string | undefined {
  return justify ? JUSTIFY[justify] : undefined;
}
