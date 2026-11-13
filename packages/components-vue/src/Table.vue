<script setup lang="ts">
import { scalarContent } from './slotContent.js';
import { computed, useAttrs } from 'vue';
import { classNames } from './classNames.js';
export type TableColumn = {
  key: string;
  label: unknown;
  align?: 'left' | 'center' | 'right' | 'start' | 'end';
};
export type TableRow = Record<string, unknown>;
export type TableProps = {
  columns: TableColumn[];
  rows: TableRow[];
  caption?: unknown;
  class?: string;
};
defineOptions({ name: 'Table', inheritAttrs: false });
const props = withDefaults(defineProps<TableProps>(), {
  caption: () => 'Table',
  class: undefined,
});
const attrs = useAttrs();
const tableBindings = computed(() => ({

  class: classNames('st-table', props.class),
}));
defineSlots<{
  caption?: () => unknown;
  label?: (scope: { column: TableColumn }) => unknown;
}>();
</script>

<template>
  <div :class="'st-table-wrap'">
    <table v-bind="{ ...$attrs, ...tableBindings }">
      <caption>
        <slot v-if="$slots.caption" name="caption" /><template v-else>{{ scalarContent(props.caption) }}</template>
      </caption>
      <thead>
        <tr>
          <template v-for="col in props.columns" :key="col.key"
            ><th>
              <slot v-if="$slots.label" name="label" :column="col" /><template
                v-else
                >{{ scalarContent(col.label) }}</template
              >
            </th></template
          >
        </tr>
      </thead>
      <tbody>
        <template v-for="(row, index) in props.rows" :key="String(row.id ?? index)"
          ><tr>
            <template v-for="col in props.columns" :key="col.key"
              ><td
                :class="
                  classNames(
                    col.align === 'center' && 'st-table__cell--center',
                    (col.align === 'right' || col.align === 'end') &&
                      'st-table__cell--right',
                  )
                "
              >
                {{ String(row[col.key] ?? '') }}
              </td></template
            >
          </tr></template
        >
      </tbody>
    </table>
  </div>
</template>
