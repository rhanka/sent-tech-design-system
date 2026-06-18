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
import { noPureBlackWhiteRule } from "./noPureBlackWhiteRule.js";
import { rawColorValueRule } from "./rawColorValueRule.js";
import { fontFamilyTokenRule } from "./fontFamilyTokenRule.js";
import { displayBodyFontPairRule } from "./displayBodyFontPairRule.js";
import { lineLengthMaxWidthRule } from "./lineLengthMaxWidthRule.js";
import { h1InlineBadgeRule } from "./h1InlineBadgeRule.js";
import { statusIndicatorLabelRule } from "./statusIndicatorLabelRule.js";
import { redundantUrlLabelRule } from "./redundantUrlLabelRule.js";
import { autoFitCardGridRule } from "./autoFitCardGridRule.js";
import { focusVisibleRingRule } from "./focusVisibleRingRule.js";
import { viewportZoomRule } from "./viewportZoomRule.js";
import { darkModeRule } from "./darkModeRule.js";
import { navSystemPrimaryActionRule } from "./navSystemPrimaryActionRule.js";
import { navSystemOptionInteractiveRule } from "./navSystemOptionInteractiveRule.js";
import { navSystemColorStateRule } from "./navSystemColorStateRule.js";
import { navSystemDepthHierarchyRule } from "./navSystemDepthHierarchyRule.js";
import { navSystemSearchFillRule } from "./navSystemSearchFillRule.js";

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
  typographyScaleTokenRule,
  noPureBlackWhiteRule,
  rawColorValueRule,
  fontFamilyTokenRule,
  displayBodyFontPairRule,
  lineLengthMaxWidthRule,
  h1InlineBadgeRule,
  statusIndicatorLabelRule,
  redundantUrlLabelRule,
  autoFitCardGridRule,
  focusVisibleRingRule,
  viewportZoomRule,
  darkModeRule,
  navSystemPrimaryActionRule,
  navSystemOptionInteractiveRule,
  navSystemColorStateRule,
  navSystemDepthHierarchyRule,
  navSystemSearchFillRule
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
  typographyScaleTokenRule,
  noPureBlackWhiteRule,
  rawColorValueRule,
  fontFamilyTokenRule,
  displayBodyFontPairRule,
  lineLengthMaxWidthRule,
  h1InlineBadgeRule,
  statusIndicatorLabelRule,
  redundantUrlLabelRule,
  autoFitCardGridRule,
  focusVisibleRingRule,
  viewportZoomRule,
  darkModeRule,
  navSystemPrimaryActionRule,
  navSystemOptionInteractiveRule,
  navSystemColorStateRule,
  navSystemDepthHierarchyRule,
  navSystemSearchFillRule
};
