import type { ComponentPublicInstance, VaporComponentInstance, VaporComponentOptions } from 'vue';

// vue-tsc preserves the SFC contract but emits a VDOM constructor. Reuse only
// its public contract; VDOM options and instance internals cannot describe Vapor.
export type VaporSfc<C extends new (...args: any[]) => { $props: Record<string, any>; $slots: unknown; $emit: unknown }> =
  VaporComponentOptions & {
    new (): VaporComponentInstance<InstanceType<C>['$props']>
      & Pick<InstanceType<C>, '$slots' | '$emit'>
      & Omit<InstanceType<C>, keyof ComponentPublicInstance>;
  };
