/** Framework-neutral Lucide nodes, lucide v0.562.0 (ISC license).
 * Copyright (c) Lucide Contributors. Permission to use, copy, modify, and/or
 * distribute this software for any purpose with or without fee is hereby
 * granted, provided that the above copyright notice and this permission
 * notice appear in all copies. THE SOFTWARE IS PROVIDED "AS IS" AND THE
 * AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE
 * AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES
 * OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER
 * IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE. */
export type IconNode = readonly (readonly [string, Readonly<Record<string, string | number>>])[];
export type IconGlyph = { readonly name?: string; readonly nodes: IconNode };
const glyphs = {
  "settings": {
    "name": "settings",
    "nodes": [
      [
        "path",
        {
          "d": "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"
        }
      ],
      [
        "circle",
        {
          "cx": "12",
          "cy": "12",
          "r": "3"
        }
      ]
    ]
  },
  "eye": {
    "name": "eye",
    "nodes": [
      [
        "path",
        {
          "d": "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"
        }
      ],
      [
        "circle",
        {
          "cx": "12",
          "cy": "12",
          "r": "3"
        }
      ]
    ]
  },
  "eye-off": {
    "name": "eye-off",
    "nodes": [
      [
        "path",
        {
          "d": "M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"
        }
      ],
      [
        "path",
        {
          "d": "M14.084 14.158a3 3 0 0 1-4.242-4.242"
        }
      ],
      [
        "path",
        {
          "d": "M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"
        }
      ],
      [
        "path",
        {
          "d": "m2 2 20 20"
        }
      ]
    ]
  },
  "layers": {
    "name": "layers",
    "nodes": [
      [
        "path",
        {
          "d": "M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"
        }
      ],
      [
        "path",
        {
          "d": "M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"
        }
      ],
      [
        "path",
        {
          "d": "M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"
        }
      ]
    ]
  },
  "target": {
    "name": "target",
    "nodes": [
      [
        "circle",
        {
          "cx": "12",
          "cy": "12",
          "r": "10"
        }
      ],
      [
        "circle",
        {
          "cx": "12",
          "cy": "12",
          "r": "6"
        }
      ],
      [
        "circle",
        {
          "cx": "12",
          "cy": "12",
          "r": "2"
        }
      ]
    ]
  },
  "x": {
    "name": "x",
    "nodes": [
      [
        "path",
        {
          "d": "M18 6 6 18"
        }
      ],
      [
        "path",
        {
          "d": "m6 6 12 12"
        }
      ]
    ]
  },
  "chevron-down": {
    "name": "chevron-down",
    "nodes": [
      [
        "path",
        {
          "d": "m6 9 6 6 6-6"
        }
      ]
    ]
  },
  "chevron-right": {
    "name": "chevron-right",
    "nodes": [
      [
        "path",
        {
          "d": "m9 18 6-6-6-6"
        }
      ]
    ]
  },
  "message-square": {
    "name": "message-square",
    "nodes": [
      [
        "path",
        {
          "d": "M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"
        }
      ]
    ]
  },
  "circle-dashed": {
    "name": "circle-dashed",
    "nodes": [
      [
        "path",
        {
          "d": "M10.1 2.182a10 10 0 0 1 3.8 0"
        }
      ],
      [
        "path",
        {
          "d": "M13.9 21.818a10 10 0 0 1-3.8 0"
        }
      ],
      [
        "path",
        {
          "d": "M17.609 3.721a10 10 0 0 1 2.69 2.7"
        }
      ],
      [
        "path",
        {
          "d": "M2.182 13.9a10 10 0 0 1 0-3.8"
        }
      ],
      [
        "path",
        {
          "d": "M20.279 17.609a10 10 0 0 1-2.7 2.69"
        }
      ],
      [
        "path",
        {
          "d": "M21.818 10.1a10 10 0 0 1 0 3.8"
        }
      ],
      [
        "path",
        {
          "d": "M3.721 6.391a10 10 0 0 1 2.7-2.69"
        }
      ],
      [
        "path",
        {
          "d": "M6.391 20.279a10 10 0 0 1-2.69-2.7"
        }
      ]
    ]
  }
} as const;
const controlGlyphs = {
  "loader-circle": {
    "name": "loader-circle",
    "nodes": [
      [
        "path",
        {
          "d": "M21 12a9 9 0 1 1-6.219-8.56"
        }
      ]
    ]
  },
  "circle-check": {
    "name": "circle-check",
    "nodes": [
      [
        "circle",
        {
          "cx": "12",
          "cy": "12",
          "r": "10"
        }
      ],
      [
        "path",
        {
          "d": "m9 12 2 2 4-4"
        }
      ]
    ]
  },
  "circle-alert": {
    "name": "circle-alert",
    "nodes": [
      [
        "circle",
        {
          "cx": "12",
          "cy": "12",
          "r": "10"
        }
      ],
      [
        "line",
        {
          "x1": "12",
          "x2": "12",
          "y1": "8",
          "y2": "12"
        }
      ],
      [
        "line",
        {
          "x1": "12",
          "x2": "12.01",
          "y1": "16",
          "y2": "16"
        }
      ]
    ]
  },
  "arrow-up": {
    "name": "arrow-up",
    "nodes": [
      [
        "path",
        {
          "d": "m5 12 7-7 7 7"
        }
      ],
      [
        "path",
        {
          "d": "M12 19V5"
        }
      ]
    ]
  },
  "chevron-left": {
    "name": "chevron-left",
    "nodes": [
      [
        "path",
        {
          "d": "m15 18-6-6 6-6"
        }
      ]
    ]
  },
  "send": {
    "name": "send",
    "nodes": [
      [
        "path",
        {
          "d": "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"
        }
      ],
      [
        "path",
        {
          "d": "m21.854 2.147-10.94 10.939"
        }
      ]
    ]
  },
  "x": {
    "name": "x",
    "nodes": [
      [
        "path",
        {
          "d": "M18 6 6 18"
        }
      ],
      [
        "path",
        {
          "d": "m6 6 12 12"
        }
      ]
    ]
  },
  "check": {
    "name": "check",
    "nodes": [
      [
        "path",
        {
          "d": "M20 6 9 17l-5-5"
        }
      ]
    ]
  },
  "copy": {
    "name": "copy",
    "nodes": [
      [
        "rect",
        {
          "height": "14",
          "rx": "2",
          "ry": "2",
          "width": "14",
          "x": "8",
          "y": "8"
        }
      ],
      [
        "path",
        {
          "d": "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
        }
      ]
    ]
  },
  "upload": {
    "name": "upload",
    "nodes": [
      [
        "path",
        {
          "d": "M12 3v12"
        }
      ],
      [
        "path",
        {
          "d": "m17 8-5-5-5 5"
        }
      ],
      [
        "path",
        {
          "d": "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
        }
      ]
    ]
  },
  "file": {
    "name": "file",
    "nodes": [
      [
        "path",
        {
          "d": "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"
        }
      ],
      [
        "path",
        {
          "d": "M14 2v5a1 1 0 0 0 1 1h5"
        }
      ]
    ]
  },
  "circle-chevron-down": {
    "name": "circle-chevron-down",
    "nodes": [
      [
        "circle",
        {
          "cx": "12",
          "cy": "12",
          "r": "10"
        }
      ],
      [
        "path",
        {
          "d": "m16 10-4 4-4-4"
        }
      ]
    ]
  },
  "ellipsis": {
    "name": "ellipsis",
    "nodes": [
      [
        "circle",
        {
          "cx": "12",
          "cy": "12",
          "r": "1"
        }
      ],
      [
        "circle",
        {
          "cx": "19",
          "cy": "12",
          "r": "1"
        }
      ],
      [
        "circle",
        {
          "cx": "5",
          "cy": "12",
          "r": "1"
        }
      ]
    ]
  },
  "search": {
    "name": "search",
    "nodes": [
      [
        "path",
        {
          "d": "m21 21-4.34-4.34"
        }
      ],
      [
        "circle",
        {
          "cx": "11",
          "cy": "11",
          "r": "8"
        }
      ]
    ]
  },
  "clock": {
    "name": "clock",
    "nodes": [
      [
        "path",
        {
          "d": "M12 6v6l4 2"
        }
      ],
      [
        "circle",
        {
          "cx": "12",
          "cy": "12",
          "r": "10"
        }
      ]
    ]
  }
} as const;
export const ICONS = { ...controlGlyphs, "settings": glyphs["settings"], "eye": glyphs["eye"], "eye-off": glyphs["eye-off"], "layers": glyphs["layers"], "target": glyphs["target"], "close": glyphs["x"], "chevron-down": glyphs["chevron-down"], "chevron-right": glyphs["chevron-right"], "comment": glyphs["message-square"], "circle-dashed": glyphs["circle-dashed"] } as const;
export type IconName = keyof typeof ICONS;
export const ICON_NAMES = Object.keys(ICONS) as IconName[];
