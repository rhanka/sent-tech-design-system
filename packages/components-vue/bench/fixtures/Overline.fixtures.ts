import type { Fixture } from './types.js';
export default [
  {
    "id": "default",
    "props": {},
    "slots": {
      "default": "Label"
    }
  },
  {
    "id": "variant-1",
    "props": {
      "as": "h2"
    },
    "slots": {
      "default": "Label"
    }
  },
  {
    "id": "variant-2",
    "props": {
      "as": "h3",
      "class": "consumer"
    },
    "slots": {
      "default": "Label"
    }
  },
  {
    "id": "variant-3",
    "props": {
      "as": "div",
      "data-bench": "overline"
    },
    "slots": {
      "default": "Label"
    }
  }
] satisfies Fixture[];
