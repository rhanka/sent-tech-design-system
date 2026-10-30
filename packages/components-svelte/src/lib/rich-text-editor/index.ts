import ComposerEditor from "./ComposerEditor.svelte";
import type { ComposerEditorProps } from "./ComposerEditor.svelte";
import RichTextEditor from "./RichTextEditor.svelte";
import type { RichTextEditorProps } from "./RichTextEditor.svelte";
import type { RichTextEditorHandle } from "@sentropic/design-system-rich-text";
import type { ComposerEditorHandle } from "@sentropic/design-system-rich-text";

export default RichTextEditor;
export { RichTextEditor, ComposerEditor };
export type {
  RichTextEditorProps,
  RichTextEditorHandle,
  ComposerEditorProps,
  ComposerEditorHandle,
};
