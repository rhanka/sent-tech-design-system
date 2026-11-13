import type { Fixture } from './types.js';
export default [
  {
    "id": "default",
    "props": {},
    "slots": {
      "logo": "<b>Logo</b>",
      "nav": "<a href=\"/\">Nav</a>",
      "actions": "<button>Action</button>",
      "drawer": "<p>Drawer</p>"
    }
  },
  {
    "id": "variant-1",
    "props": {
      "compact": true,
      "menuOpen": true,
      "brandName": "Brand"
    },
    "slots": {
      "logo": "<b>Logo</b>",
      "nav": "<a href=\"/\">Nav</a>",
      "actions": "<button>Action</button>",
      "drawer": "<p>Drawer</p>"
    }
  },
  {
    "id": "variant-2",
    "props": {
      "brandName": "Brand",
      "productName": "Product",
      "logoSrc": "/logo.svg"
    },
    "slots": {
      "logo": "<b>Logo</b>",
      "nav": "<a href=\"/\">Nav</a>",
      "actions": "<button>Action</button>",
      "drawer": "<p>Drawer</p>"
    }
  },
  {
    "id": "variant-3",
    "props": {
      "compact": true,
      "drawerId": "custom",
      "class": "consumer"
    },
    "slots": {
      "logo": "<b>Logo</b>",
      "nav": "<a href=\"/\">Nav</a>",
      "actions": "<button>Action</button>",
      "drawer": "<p>Drawer</p>"
    }
  }
] satisfies Fixture[];
