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
  card: {
    background: semantic.surface.raised,
    border: semantic.border.subtle,
    radius: foundation.radius.lg,
    shadow: foundation.shadow.subtle
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
