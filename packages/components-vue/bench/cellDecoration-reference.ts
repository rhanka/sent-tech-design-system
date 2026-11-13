// Reference-only host for the original non-component rendering helper.
import { defineComponent } from 'vue';
import { renderCellDecorationIcon } from '../src/cellDecoration.js';
export const cellDecoration = defineComponent({
  props: { icon: String },
  setup: props => () => renderCellDecorationIcon(props.icon),
});
