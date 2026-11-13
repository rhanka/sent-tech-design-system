import type { Fixture } from './types.js';
export default [
  {
    "id": "default",
    "props": {}
  },
  {
    "id": "variant-1",
    "props": {
      "orientation": "vertical",
      "spacing": 2
    }
  },
  {
    "id": "variant-2",
    "props": {
      "label": "Label",
      "variant": "dashed",
      "spacing": 0
    }
  },
  {
    "id": "variant-3",
    "props": {
      "class": "consumer",
      "spacing": 3,
      "style": {
        "color": "red"
      }
    }
  }
] satisfies Fixture[];
