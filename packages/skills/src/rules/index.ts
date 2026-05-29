import type { Rule } from "../types.js";
import { lineLengthRule } from "./lineLengthRule.js";
import { noBareHexRule } from "./noBareHexRule.js";
import { noEmDashRule } from "./noEmDashRule.js";
import { singleFontRule } from "./singleFontRule.js";
import { sideTabOnRoundedRule } from "./sideTabOnRoundedRule.js";
import { touchTargetRule } from "./touchTargetRule.js";
import { headingHierarchyRule } from "./headingHierarchyRule.js";
import { underlineBorderRule } from "./underlineBorderRule.js";

export const defaultRules: Rule[] = [
  singleFontRule,
  noBareHexRule,
  noEmDashRule,
  sideTabOnRoundedRule,
  lineLengthRule,
  touchTargetRule,
  headingHierarchyRule,
  underlineBorderRule
];

export {
  lineLengthRule,
  noBareHexRule,
  noEmDashRule,
  singleFontRule,
  sideTabOnRoundedRule,
  touchTargetRule,
  headingHierarchyRule,
  underlineBorderRule
};
