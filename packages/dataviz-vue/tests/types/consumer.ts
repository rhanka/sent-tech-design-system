import * as classic from '../../dist/index.js';
import * as vapor from '../../dist/vapor/index.js';
for (const api of [classic, vapor]) {
  const csv: string = api.rowsToCsv([{ message: 'Hello' }], [{ key: 'message', label: 'Message' }]);
  const range = api.dateRangeToSpec({ start: new Date(0), end: null });
  const relative = api.relativeRangeToSpec(api.DEFAULT_RELATIVE_PRESETS[0].days, new Date(0));
  void [csv, range, relative];
}
