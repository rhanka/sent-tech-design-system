/**
 * componentDark — dark-mode component layer.
 * Built by passing semanticDark + foundationDark into createComponent,
 * exactly like the light component is built from semantic + foundation.
 * createComponent vient du package tokens (export existant).
 */
import { createComponent } from "@sentropic/design-system-tokens";
import { semanticDark } from "./semantic.dark.js";
import { foundationDark } from "./foundation.dark.js";

export const componentDark = createComponent(semanticDark, foundationDark);
