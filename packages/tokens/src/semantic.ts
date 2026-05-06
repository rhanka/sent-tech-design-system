import { foundation } from "./foundation";

export const semantic = {
  surface: {
    default: foundation.color.slate[0],
    subtle: foundation.color.slate[10],
    raised: foundation.color.slate[0],
    inverse: foundation.color.slate[90],
    overlay: "rgb(15 23 42 / 0.48)"
  },
  text: {
    primary: foundation.color.slate[90],
    secondary: foundation.color.slate[60],
    muted: "#64748b",
    inverse: foundation.color.slate[0],
    link: foundation.color.blue[60]
  },
  border: {
    subtle: foundation.color.slate[20],
    strong: "#94a3b8",
    interactive: foundation.color.blue[60]
  },
  action: {
    primary: foundation.color.blue[60],
    primaryText: foundation.color.slate[0],
    secondary: foundation.color.slate[10],
    secondaryText: foundation.color.slate[90],
    danger: foundation.color.feedback.error
  },
  feedback: {
    success: foundation.color.feedback.success,
    warning: foundation.color.feedback.warning,
    error: foundation.color.feedback.error,
    info: foundation.color.feedback.info
  },
  status: {
    pending: foundation.color.feedback.warning,
    processing: foundation.color.feedback.info,
    completed: foundation.color.feedback.success,
    failed: foundation.color.feedback.error
  },
  data: {
    category1: "#4E79A7",
    category2: "#F28E2B",
    category3: "#E15759",
    category4: "#76B7B2",
    category5: "#59A14F",
    category6: "#EDC948",
    category7: "#B07AA1",
    category8: "#FF9DA7"
  }
} as const;
