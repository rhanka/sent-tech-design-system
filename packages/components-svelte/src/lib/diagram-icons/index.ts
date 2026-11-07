import DiagramIcon from "./DiagramIcon.svelte";
import {
  DIAGRAM_GLYPH_BASE,
  DIAGRAM_GLYPH_NAMES,
  DIAGRAM_GLYPH_VIEWBOX,
  DIAGRAM_GLYPHS,
  getDiagramGlyph,
  type DiagramGlyph,
} from "./registry.js";

export default DiagramIcon;
export { DiagramIcon, DIAGRAM_GLYPHS, DIAGRAM_GLYPH_NAMES, DIAGRAM_GLYPH_BASE, DIAGRAM_GLYPH_VIEWBOX, getDiagramGlyph };
export type { DiagramGlyph };
