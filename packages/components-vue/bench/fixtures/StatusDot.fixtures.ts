import type { Fixture } from './types.js';
export default [
  {
    "id": "default",
    "props": {}
  },
  {
    "id": "variant-1",
    "props": {
      "tone": "success",
      "label": "Online",
      "pulse": true
    }
  },
  {
    "id": "variant-2",
    "props": {
      "color": "red",
      "size": 0
    }
  },
  {
    "id": "variant-3",
    "props": {
      "tone": "error",
      "class": "consumer",
      "data-bench": "dot"
    }
  }
] satisfies Fixture[];
