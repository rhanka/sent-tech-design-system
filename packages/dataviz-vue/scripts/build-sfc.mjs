import '../../../scripts/vue-sfc-build.mjs';
import { rmSync } from 'node:fs';
import { files } from '../../../scripts/vue-vapor-source.mjs';

// Remove maps left by older vue-tsc builds: their virtual JS was overwritten.
for (const file of files('dist').filter(file => file.endsWith('.map'))) rmSync(file);
