import { foundation } from "./foundation.js";
import { semantic } from "./semantic.js";

export const component = {
  button: {
    radius: foundation.radius.md,
    primaryBackground: semantic.action.primary,
    primaryText: semantic.action.primaryText,
    secondaryBackground: semantic.action.secondary,
    secondaryText: semantic.action.secondaryText
  },
  link: {
    text: semantic.text.link,
    hoverText: semantic.action.primary,
    disabledText: semantic.text.muted,
    focusRing: semantic.border.interactive
  },
  alert: {
    background: semantic.surface.raised,
    text: semantic.text.primary,
    border: semantic.border.subtle,
    infoBorder: semantic.feedback.info,
    successBorder: semantic.feedback.success,
    warningBorder: semantic.feedback.warning,
    errorBorder: semantic.feedback.error,
    radius: foundation.radius.lg
  },
  card: {
    background: semantic.surface.raised,
    border: semantic.border.subtle,
    radius: foundation.radius.lg,
    shadow: foundation.shadow.subtle
  },
  menu: {
    background: semantic.surface.raised,
    border: semantic.border.subtle,
    text: semantic.text.primary,
    itemHoverBackground: semantic.surface.subtle,
    disabledText: semantic.text.muted,
    radius: foundation.radius.md,
    shadow: foundation.shadow.medium
  },
  popover: {
    background: semantic.surface.raised,
    border: semantic.border.subtle,
    text: semantic.text.primary,
    shadow: foundation.shadow.floating,
    radius: foundation.radius.lg,
    zIndex: foundation.z.overlay
  },
  dropdown: {
    background: semantic.surface.default,
    border: semantic.border.subtle,
    text: semantic.text.primary,
    optionHoverBackground: semantic.surface.subtle,
    selectedBackground: semantic.action.primary,
    selectedText: semantic.action.primaryText,
    radius: foundation.radius.md,
    shadow: foundation.shadow.medium
  },
  input: {
    background: semantic.surface.default,
    border: semantic.border.subtle,
    focusRing: semantic.border.interactive,
    radius: foundation.radius.md
  },
  field: {
    labelText: semantic.text.primary,
    helpText: semantic.text.secondary,
    errorText: semantic.feedback.error,
    gap: foundation.spacing[2],
    maxWidth: "28rem"
  },
  control: {
    background: semantic.surface.default,
    text: semantic.text.primary,
    placeholderText: semantic.text.muted,
    border: semantic.border.subtle,
    hoverBorder: semantic.border.strong,
    focusRing: semantic.border.interactive,
    invalidBorder: semantic.feedback.error,
    disabledBackground: semantic.surface.subtle,
    disabledText: semantic.text.muted,
    radius: foundation.radius.md,
    smHeight: "2rem",
    mdHeight: "2.5rem",
    lgHeight: "3rem"
  },
  selection: {
    checkedBackground: semantic.action.primary,
    checkedText: semantic.action.primaryText,
    border: semantic.border.subtle,
    switchTrack: semantic.border.strong,
    switchTrackChecked: semantic.action.primary,
    switchThumb: semantic.surface.default
  },
  overlay: {
    backdrop: semantic.surface.overlay,
    surface: semantic.surface.raised,
    border: semantic.border.subtle,
    shadow: foundation.shadow.floating,
    radius: foundation.radius.lg,
    zIndex: foundation.z.modal
  },
  drawer: {
    backdrop: semantic.surface.overlay,
    surface: semantic.surface.raised,
    border: semantic.border.subtle,
    shadow: foundation.shadow.floating,
    width: "24rem",
    zIndex: foundation.z.modal
  },
  emptyState: {
    background: semantic.surface.subtle,
    border: semantic.border.subtle,
    titleText: semantic.text.primary,
    messageText: semantic.text.secondary,
    radius: foundation.radius.lg
  },
  loadingState: {
    indicator: semantic.action.primary,
    track: semantic.surface.subtle,
    text: semantic.text.secondary,
    radius: foundation.radius.pill
  },
  tooltip: {
    background: semantic.surface.inverse,
    text: semantic.text.inverse,
    radius: foundation.radius.md,
    shadow: foundation.shadow.medium,
    zIndex: foundation.z.overlay
  },
  toast: {
    background: semantic.surface.raised,
    text: semantic.text.primary,
    border: semantic.border.subtle,
    shadow: foundation.shadow.floating,
    radius: foundation.radius.lg,
    infoBorder: semantic.feedback.info,
    successBorder: semantic.feedback.success,
    warningBorder: semantic.feedback.warning,
    errorBorder: semantic.feedback.error,
    zIndex: foundation.z.toast
  },
  dataTable: {
    headerBackground: semantic.surface.subtle,
    rowBackground: semantic.surface.default,
    rowHoverBackground: semantic.surface.subtle,
    border: semantic.border.subtle,
    text: semantic.text.primary,
    captionText: semantic.text.secondary,
    radius: foundation.radius.lg
  },
  tabs: {
    activeText: semantic.text.primary,
    inactiveText: semantic.text.secondary,
    border: semantic.border.subtle,
    indicator: semantic.action.primary,
    panelBackground: semantic.surface.default
  },
  pagination: {
    background: semantic.surface.default,
    border: semantic.border.subtle,
    text: semantic.text.primary,
    activeBackground: semantic.action.primary,
    activeText: semantic.action.primaryText,
    disabledText: semantic.text.muted,
    radius: foundation.radius.md
  },
  breadcrumb: {
    text: semantic.text.secondary,
    currentText: semantic.text.primary,
    separator: semantic.text.muted,
    linkText: semantic.text.link
  },
  sideNav: {
    background: semantic.surface.default,
    border: semantic.border.subtle,
    itemText: semantic.text.secondary,
    activeBackground: semantic.surface.subtle,
    activeText: semantic.text.primary,
    width: "16rem"
  },
  chat: {
    userBubbleBackground: semantic.action.primary,
    userBubbleText: semantic.action.primaryText,
    assistantBubbleBackground: semantic.surface.subtle,
    assistantBubbleText: semantic.text.primary,
    composerSurface: semantic.surface.raised,
    toolCallSurface: semantic.surface.subtle
  },
  graph: {
    panelBackground: semantic.surface.inverse,
    panelText: semantic.text.inverse,
    edgeDefault: "rgb(226 232 240 / 0.56)",
    community1: semantic.data.category1,
    community2: semantic.data.category2,
    community3: semantic.data.category3,
    community4: semantic.data.category4
  }
} as const;
