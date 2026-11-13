import type { Fixture } from './types.js';
export default [
  {
    "id": "default",
    "props": {
      "name": "chevron-down"
    }
  },
  {
    "id": "variant-1",
    "props": {
      "name": "settings",
      "title": "Settings",
      "size": 24,
      "strokeWidth": 3,
      "class": "consumer"
    }
  },
  {
    "id": "variant-2",
    "props": {
      "name": "close",
      "data-bench": "icon"
    }
  },
  {
    "id": "variant-3",
    "props": {
      "name": "circle-dashed",
      "title": ""
    }
  }
] satisfies Fixture[];
