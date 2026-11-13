import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { data: { spans: [{ spanId: 'a', service: 'web', start: 0, duration: 40 }, { spanId: 'b', parentSpanId: 'a', service: 'api', start: 10, duration: 20 }, { spanId: 'c', service: 'db', start: 15, duration: 5 }] }, label: 'Trace' } },
  { id: 'single', props: { data: { spans: [{ spanId: 'a', service: 'web', start: 100, duration: 0 }] }, label: 'Single' } },
  { id: 'empty', props: { data: { spans: [] }, label: 'Empty' } },
  { id: 'default-data', props: { label: 'No data' } },
  { id: 'custom-size', props: { data: { spans: [{ spanId: 'a', service: 'web', start: 0, duration: 100 }] }, label: 'Sized', width: 900, height: 200 } },
  { id: 'custom-attrs', props: { data: { spans: [{ spanId: 'a', service: 'web', start: 0, duration: 10 }] }, class: 'consumer', style: 'color: red', 'data-bench': 'traceWaterfallChart' } },
] satisfies Fixture[];
