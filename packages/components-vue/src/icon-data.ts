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
export const ICONS = { "settings": glyphs["settings"], "eye": glyphs["eye"], "eye-off": glyphs["eye-off"], "layers": glyphs["layers"], "target": glyphs["target"], "close": glyphs["x"], "chevron-down": glyphs["chevron-down"], "chevron-right": glyphs["chevron-right"], "circle-dashed": glyphs["circle-dashed"] } as const;
export type IconName = keyof typeof ICONS;
export const ICON_NAMES = Object.keys(ICONS) as IconName[];
