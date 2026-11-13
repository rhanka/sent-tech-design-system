import * as bench from './lib.mjs';
import { runWorker } from '../../../scripts/vue-conversion-bench/worker.mjs';
await runWorker(bench);
