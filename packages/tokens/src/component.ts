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
