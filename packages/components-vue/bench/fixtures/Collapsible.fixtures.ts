import type { Fixture } from './types.js';
export default [
  {
    "id": "default",
    "props": {
      "title": "Title"
    },
    "slots": {
      "default": "<p>Body</p>",
      "trailing": "<span>Count</span>"
    }
  },
  {
    "id": "variant-1",
    "props": {
      "title": "Title",
      "open": true
    },
    "slots": {
      "default": "<p>Body</p>",
      "trailing": "<span>Count</span>"
    }
  },
  {
    "id": "variant-2",
    "props": {
      "title": "Title",
      "disabled": true,
      "open": false
    },
    "slots": {
      "default": "<p>Body</p>",
      "trailing": "<span>Count</span>"
    }
  },
  {
    "id": "variant-3",
    "props": {
      "title": "Title",
      "open": true,
      "class": "consumer",
      "data-bench": "collapse"
    },
    "slots": {
      "default": "<p>Body</p>",
      "trailing": "<span>Count</span>"
    }
  }
] satisfies Fixture[];
