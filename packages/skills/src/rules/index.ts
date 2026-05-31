import type { Rule } from "../types.js";
import { lineLengthRule } from "./lineLengthRule.js";
import { noBareHexRule } from "./noBareHexRule.js";
import { noEmDashRule } from "./noEmDashRule.js";
import { singleFontRule } from "./singleFontRule.js";
import { sideTabOnRoundedRule } from "./sideTabOnRoundedRule.js";
import { touchTargetRule } from "./touchTargetRule.js";
import { headingHierarchyRule } from "./headingHierarchyRule.js";
import { underlineBorderRule } from "./underlineBorderRule.js";
import { crampedPaddingRule } from "./crampedPaddingRule.js";
import { motionSubtleRule } from "./motionSubtleRule.js";
import { paddingScaleTokenRule } from "./paddingScaleTokenRule.js";
import { railVsRadiusConsistencyRule } from "./railVsRadiusConsistencyRule.js";
import { gridVarianceRule } from "./gridVarianceRule.js";
import { contrastTokenPairRule } from "./contrastTokenPairRule.js";
import { typographyScaleTokenRule } from "./typographyScaleTokenRule.js";

export const defaultRules: Rule[] = [
  singleFontRule,
  noBareHexRule,
  noEmDashRule,
  sideTabOnRoundedRule,
  lineLengthRule,
  touchTargetRule,
  headingHierarchyRule,
  underlineBorderRule,
  crampedPaddingRule,
  motionSubtleRule,
  paddingScaleTokenRule,
  railVsRadiusConsistencyRule,
  gridVarianceRule,
  contrastTokenPairRule,
  typographyScaleTokenRule
];

export {
  lineLengthRule,
  noBareHexRule,
  noEmDashRule,
  singleFontRule,
  sideTabOnRoundedRule,
  touchTargetRule,
  headingHierarchyRule,
  underlineBorderRule,
  crampedPaddingRule,
  motionSubtleRule,
  paddingScaleTokenRule,
  railVsRadiusConsistencyRule,
  gridVarianceRule,
  contrastTokenPairRule,
  typographyScaleTokenRule
};
