import { expect, it } from 'vitest';

it('imports root and Vapor entries without editor peers and rejects only the editor entry', async () => {
  const ds = await import('@sentropic/design-system-vue');
  expect(ds.Button).toBeDefined();
  await expect(import('@sentropic/design-system-vue/rich-text-editor')).rejects.toThrow(/@tiptap\//);
  if (process.env.VUE_PACKED_MODE === 'vapor') {
    const vapor = await import('@sentropic/design-system-vue/vapor');
    expect(vapor.Button).toBeDefined();
    await expect(import('@sentropic/design-system-vue/vapor/rich-text-editor')).rejects.toThrow(/@tiptap\//);
  }
});
