import type { Fixture } from './types.js';
export default [
  {
    "id": "default",
    "props": {
      "color": "red"
    }
  },
  {
    "id": "variant-1",
    "props": {
      "color": "var(--x)",
      "label": "Swatch",
      "shape": "circle",
      "size": 14
    }
  },
  {
    "id": "variant-2",
    "props": {
      "color": "blue",
      "size": 0,
      "shape": "pill"
    }
  },
  {
    "id": "variant-3",
    "props": {
      "color": "red",
      "class": "consumer",
      "data-bench": "swatch"
    }
  }
] satisfies Fixture[];
