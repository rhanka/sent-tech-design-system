import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  convertEngramErdScene,
  m3ProfileRegistry,
  shippedExecutorBindings,
  type EngramErdScene,
} from '@sentropic/diagram-core';

const fixturePath = join(dirname(fileURLToPath(import.meta.url)), '../../../diagram-core/tests/fixtures/erd/ERD-SCENES.json');
const scene = (JSON.parse(readFileSync(fixturePath, 'utf8')).ontologies as EngramErdScene[])[0]!;

export function erdFixture() {
  return {
    ...convertEngramErdScene(scene),
    registry: m3ProfileRegistry,
    bindings: shippedExecutorBindings,
  };
}
