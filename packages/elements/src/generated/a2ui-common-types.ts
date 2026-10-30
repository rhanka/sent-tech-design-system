/**
 * GENERATED FILE — do not edit. Regenerate with `npm run catalog:generate` in
 * packages/elements (the generator is the single source, §5.1).
 *
 * Two A2UI schema documents, vendored from @a2ui/web_core@0.14.0
 * (src/v0_9/schemas — the installed SDK ships no v0_9_1 set; only v0_8,
 * v0_9 and v1_0 exist, measured):
 *
 * 1. common_types.json (original $id https://a2ui.org/specification/v0_9/common_types.json,
 *    sha256 a7a349b1e9abda9dbdf2342ac9ac671d8da7a8576c7b29a9786331faf70b9900), $id rewritten to
 *    https://a2ui.org/specification/v0_9_1/common_types.json — the URI the catalogue's entries
 *    reference ComponentCommon by (§5.2).
 * 2. catalogs/basic/catalog.json (original $id https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json,
 *    sha256 5a41193fda4fd709a7cd0e603f16222fc60ca442fed1c452b17f2e667ad0fde5), $id rewritten to
 *    https://a2ui.org/specification/v0_9_1/catalog.json — the sibling name common_types
 *    references anyFunction by; compiling an entry's ComponentCommon
 *    graph needs it (accessibility -> dynamic values -> function calls).
 *
 * The validator registers both under their rewritten $ids (plus v0_9-URI
 * clones for the SDK's own absolute v0_9 references) so every entry
 * reference resolves without network or file access.
 */
export const a2uiCommonTypes: Record<string, unknown> = {
  "$defs": {
    "AccessibilityAttributes": {
      "description": "Attributes to enhance accessibility when using assistive technologies like screen readers.",
      "properties": {
        "description": {
          "$ref": "#/$defs/DynamicString",
          "description": "Additional information provided by assistive technologies about an element such as instructions, format requirements, or result of an action. For example, a mute button might have a label of 'Mute' and a description of 'Silences notifications about this conversation'."
        },
        "label": {
          "$ref": "#/$defs/DynamicString",
          "description": "A short string, typically 1 to 3 words, used by assistive technologies to convey the purpose or intent of an element. For example, an input field might have an accessible label of 'User ID' or a button might be labeled 'Submit'."
        }
      },
      "type": "object"
    },
    "Action": {
      "description": "Defines an interaction handler that can either trigger a server-side event or execute a local client-side function.",
      "oneOf": [
        {
          "additionalProperties": false,
          "description": "Triggers a server-side event.",
          "properties": {
            "event": {
              "additionalProperties": false,
              "description": "The event to dispatch to the server.",
              "properties": {
                "context": {
                  "additionalProperties": {
                    "$ref": "#/$defs/DynamicValue"
                  },
                  "description": "A JSON object containing the key-value pairs for the action context. Values can be literals or paths. Use literal values unless the value must be dynamically bound to the data model. Do NOT use paths for static IDs.",
                  "type": "object"
                },
                "name": {
                  "description": "The name of the action to be dispatched to the server.",
                  "type": "string"
                }
              },
              "required": [
                "name"
              ],
              "type": "object"
            }
          },
          "required": [
            "event"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "description": "Executes a local client-side function.",
          "properties": {
            "functionCall": {
              "$ref": "#/$defs/FunctionCall"
            }
          },
          "required": [
            "functionCall"
          ],
          "type": "object"
        }
      ]
    },
    "CheckRule": {
      "additionalProperties": false,
      "description": "A single validation rule applied to an input component.",
      "properties": {
        "condition": {
          "$ref": "#/$defs/DynamicBoolean"
        },
        "message": {
          "description": "The error message to display if the check fails.",
          "type": "string"
        }
      },
      "required": [
        "condition",
        "message"
      ],
      "type": "object"
    },
    "Checkable": {
      "description": "Properties for components that support client-side checks.",
      "properties": {
        "checks": {
          "description": "A list of checks to perform. These are function calls that must return a boolean indicating validity.",
          "items": {
            "$ref": "#/$defs/CheckRule"
          },
          "type": "array"
        }
      },
      "type": "object"
    },
    "ChildList": {
      "oneOf": [
        {
          "description": "A static list of child component IDs.",
          "items": {
            "$ref": "#/$defs/ComponentId"
          },
          "type": "array"
        },
        {
          "additionalProperties": false,
          "description": "A template for generating a dynamic list of children from a data model list. The `componentId` is the component to use as a template.",
          "properties": {
            "componentId": {
              "$ref": "#/$defs/ComponentId"
            },
            "path": {
              "description": "The path to the list of component property objects in the data model.",
              "type": "string"
            }
          },
          "required": [
            "componentId",
            "path"
          ],
          "type": "object"
        }
      ]
    },
    "ComponentCommon": {
      "properties": {
        "accessibility": {
          "$ref": "#/$defs/AccessibilityAttributes"
        },
        "id": {
          "$ref": "#/$defs/ComponentId"
        }
      },
      "required": [
        "id"
      ],
      "type": "object"
    },
    "ComponentId": {
      "description": "The unique identifier for a component, used for both definitions and references within the same surface.",
      "type": "string"
    },
    "DataBinding": {
      "additionalProperties": false,
      "properties": {
        "path": {
          "description": "A JSON Pointer path to a value in the data model.",
          "type": "string"
        }
      },
      "required": [
        "path"
      ],
      "type": "object"
    },
    "DynamicBoolean": {
      "description": "A boolean value that can be a literal, a path, or a function call returning a boolean.",
      "oneOf": [
        {
          "type": "boolean"
        },
        {
          "$ref": "#/$defs/DataBinding"
        },
        {
          "allOf": [
            {
              "$ref": "#/$defs/FunctionCall"
            },
            {
              "properties": {
                "returnType": {
                  "const": "boolean"
                }
              }
            }
          ]
        }
      ]
    },
    "DynamicNumber": {
      "description": "Represents a value that can be either a literal number, a path to a number in the data model, or a function call returning a number.",
      "oneOf": [
        {
          "type": "number"
        },
        {
          "$ref": "#/$defs/DataBinding"
        },
        {
          "allOf": [
            {
              "$ref": "#/$defs/FunctionCall"
            },
            {
              "properties": {
                "returnType": {
                  "const": "number"
                }
              }
            }
          ]
        }
      ]
    },
    "DynamicString": {
      "description": "Represents a string",
      "oneOf": [
        {
          "type": "string"
        },
        {
          "$ref": "#/$defs/DataBinding"
        },
        {
          "allOf": [
            {
              "$ref": "#/$defs/FunctionCall"
            },
            {
              "properties": {
                "returnType": {
                  "const": "string"
                }
              }
            }
          ]
        }
      ]
    },
    "DynamicStringList": {
      "description": "Represents a value that can be either a literal array of strings, a path to a string array in the data model, or a function call returning a string array.",
      "oneOf": [
        {
          "items": {
            "type": "string"
          },
          "type": "array"
        },
        {
          "$ref": "#/$defs/DataBinding"
        },
        {
          "allOf": [
            {
              "$ref": "#/$defs/FunctionCall"
            },
            {
              "properties": {
                "returnType": {
                  "const": "array"
                }
              }
            }
          ]
        }
      ]
    },
    "DynamicValue": {
      "description": "A value that can be a literal, a path, or a function call returning any type.",
      "oneOf": [
        {
          "type": "string"
        },
        {
          "type": "number"
        },
        {
          "type": "boolean"
        },
        {
          "type": "array"
        },
        {
          "$ref": "#/$defs/DataBinding"
        },
        {
          "$ref": "#/$defs/FunctionCall"
        }
      ]
    },
    "FunctionCall": {
      "description": "Invokes a named function on the client.",
      "oneOf": [
        {
          "$ref": "catalog.json#/$defs/anyFunction"
        }
      ],
      "properties": {
        "args": {
          "additionalProperties": {
            "anyOf": [
              {
                "$ref": "#/$defs/DynamicValue"
              },
              {
                "description": "A literal object argument (e.g. configuration).",
                "type": "object"
              }
            ]
          },
          "description": "Arguments passed to the function.",
          "type": "object"
        },
        "call": {
          "description": "The name of the function to call.",
          "type": "string"
        },
        "returnType": {
          "default": "boolean",
          "description": "The expected return type of the function call.",
          "enum": [
            "any",
            "array",
            "boolean",
            "number",
            "object",
            "string",
            "void"
          ],
          "type": "string"
        }
      },
      "required": [
        "call"
      ],
      "type": "object"
    }
  },
  "$id": "https://a2ui.org/specification/v0_9_1/common_types.json",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "description": "Common type definitions used across A2UI schemas.",
  "title": "A2UI Common Types"
};

export const a2uiSdkCatalogSchema: Record<string, unknown> = {
  "$defs": {
    "CatalogComponentCommon": {
      "properties": {
        "weight": {
          "description": "The relative weight of this component within a Row or Column. This is similar to the CSS 'flex-grow' property. Note: this may ONLY be set when the component is a direct descendant of a Row or Column.",
          "type": "number"
        }
      },
      "type": "object"
    },
    "anyComponent": {
      "discriminator": {
        "propertyName": "component"
      },
      "oneOf": [
        {
          "$ref": "#/components/Text"
        },
        {
          "$ref": "#/components/Image"
        },
        {
          "$ref": "#/components/Icon"
        },
        {
          "$ref": "#/components/Video"
        },
        {
          "$ref": "#/components/AudioPlayer"
        },
        {
          "$ref": "#/components/Row"
        },
        {
          "$ref": "#/components/Column"
        },
        {
          "$ref": "#/components/List"
        },
        {
          "$ref": "#/components/Card"
        },
        {
          "$ref": "#/components/Tabs"
        },
        {
          "$ref": "#/components/Modal"
        },
        {
          "$ref": "#/components/Divider"
        },
        {
          "$ref": "#/components/Button"
        },
        {
          "$ref": "#/components/TextField"
        },
        {
          "$ref": "#/components/CheckBox"
        },
        {
          "$ref": "#/components/ChoicePicker"
        },
        {
          "$ref": "#/components/Slider"
        },
        {
          "$ref": "#/components/DateTimeInput"
        }
      ]
    },
    "anyFunction": {
      "oneOf": [
        {
          "$ref": "#/functions/required"
        },
        {
          "$ref": "#/functions/regex"
        },
        {
          "$ref": "#/functions/length"
        },
        {
          "$ref": "#/functions/numeric"
        },
        {
          "$ref": "#/functions/email"
        },
        {
          "$ref": "#/functions/formatString"
        },
        {
          "$ref": "#/functions/formatNumber"
        },
        {
          "$ref": "#/functions/formatCurrency"
        },
        {
          "$ref": "#/functions/formatDate"
        },
        {
          "$ref": "#/functions/pluralize"
        },
        {
          "$ref": "#/functions/openUrl"
        },
        {
          "$ref": "#/functions/and"
        },
        {
          "$ref": "#/functions/or"
        },
        {
          "$ref": "#/functions/not"
        }
      ]
    },
    "theme": {
      "additionalProperties": true,
      "properties": {
        "agentDisplayName": {
          "description": "Text to be displayed next to the surface to identify the agent or tool that created it.",
          "type": "string"
        },
        "iconUrl": {
          "description": "A URL for an image that identifies the agent or tool associated with the surface.",
          "format": "uri",
          "type": "string"
        },
        "primaryColor": {
          "description": "The primary brand color used for highlights (e.g., primary buttons, active borders). Renderers may generate variants of this color for different contexts. Format: Hexadecimal code (e.g., '#00BFFF').",
          "pattern": "^#[0-9a-fA-F]{6}$",
          "type": "string"
        }
      },
      "type": "object"
    }
  },
  "$id": "https://a2ui.org/specification/v0_9_1/catalog.json",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "catalogId": "https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json",
  "components": {
    "AudioPlayer": {
      "allOf": [
        {
          "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/ComponentCommon"
        },
        {
          "$ref": "#/$defs/CatalogComponentCommon"
        },
        {
          "properties": {
            "component": {
              "const": "AudioPlayer"
            },
            "description": {
              "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/DynamicString",
              "description": "A description of the audio, such as a title or summary."
            },
            "url": {
              "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/DynamicString",
              "description": "The URL of the audio to be played."
            }
          },
          "required": [
            "component",
            "url"
          ],
          "type": "object"
        }
      ],
      "type": "object",
      "unevaluatedProperties": false
    },
    "Button": {
      "allOf": [
        {
          "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/ComponentCommon"
        },
        {
          "$ref": "#/$defs/CatalogComponentCommon"
        },
        {
          "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/Checkable"
        },
        {
          "properties": {
            "action": {
              "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/Action"
            },
            "child": {
              "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/ComponentId",
              "description": "The ID of the child component. Use a 'Text' component for a labeled button. Only use an 'Icon' if the requirements explicitly ask for an icon-only button."
            },
            "component": {
              "const": "Button"
            },
            "variant": {
              "default": "default",
              "description": "A hint for the button style. If omitted, a default button style is used. 'primary' indicates this is the main call-to-action button. 'borderless' means the button has no visual border or background, making its child content appear like a clickable link.",
              "enum": [
                "borderless",
                "default",
                "primary"
              ],
              "type": "string"
            }
          },
          "required": [
            "action",
            "child",
            "component"
          ],
          "type": "object"
        }
      ],
      "type": "object",
      "unevaluatedProperties": false
    },
    "Card": {
      "allOf": [
        {
          "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/ComponentCommon"
        },
        {
          "$ref": "#/$defs/CatalogComponentCommon"
        },
        {
          "properties": {
            "child": {
              "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/ComponentId",
              "description": "The ID of the single child component to be rendered inside the card. To display multiple elements, you MUST wrap them in a layout component (like Column or Row) and pass that container's ID here. Do NOT pass multiple IDs or a non-existent ID."
            },
            "component": {
              "const": "Card"
            }
          },
          "required": [
            "child",
            "component"
          ],
          "type": "object"
        }
      ],
      "type": "object",
      "unevaluatedProperties": false
    },
    "CheckBox": {
      "allOf": [
        {
          "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/ComponentCommon"
        },
        {
          "$ref": "#/$defs/CatalogComponentCommon"
        },
        {
          "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/Checkable"
        },
        {
          "properties": {
            "component": {
              "const": "CheckBox"
            },
            "label": {
              "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/DynamicString",
              "description": "The text to display next to the checkbox."
            },
            "value": {
              "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/DynamicBoolean",
              "description": "The current state of the checkbox (true for checked, false for unchecked)."
            }
          },
          "required": [
            "component",
            "label",
            "value"
          ],
          "type": "object"
        }
      ],
      "type": "object",
      "unevaluatedProperties": false
    },
    "ChoicePicker": {
      "allOf": [
        {
          "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/ComponentCommon"
        },
        {
          "$ref": "#/$defs/CatalogComponentCommon"
        },
        {
          "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/Checkable"
        },
        {
          "description": "A component that allows selecting one or more options from a list.",
          "properties": {
            "component": {
              "const": "ChoicePicker"
            },
            "displayStyle": {
              "default": "checkbox",
              "description": "The display style of the component.",
              "enum": [
                "checkbox",
                "chips"
              ],
              "type": "string"
            },
            "filterable": {
              "default": false,
              "description": "If true, displays a search input to filter the options.",
              "type": "boolean"
            },
            "label": {
              "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/DynamicString",
              "description": "The label for the group of options."
            },
            "options": {
              "description": "The list of available options to choose from.",
              "items": {
                "additionalProperties": false,
                "properties": {
                  "label": {
                    "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/DynamicString",
                    "description": "The text to display for this option."
                  },
                  "value": {
                    "description": "The stable value associated with this option.",
                    "type": "string"
                  }
                },
                "required": [
                  "label",
                  "value"
                ],
                "type": "object"
              },
              "type": "array"
            },
            "value": {
              "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/DynamicStringList",
              "description": "The list of currently selected values. This should be bound to a string array in the data model."
            },
            "variant": {
              "default": "mutuallyExclusive",
              "description": "A hint for how the choice picker should be displayed and behave.",
              "enum": [
                "multipleSelection",
                "mutuallyExclusive"
              ],
              "type": "string"
            }
          },
          "required": [
            "component",
            "options",
            "value"
          ],
          "type": "object"
        }
      ],
      "type": "object",
      "unevaluatedProperties": false
    },
    "Column": {
      "allOf": [
        {
          "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/ComponentCommon"
        },
        {
          "$ref": "#/$defs/CatalogComponentCommon"
        },
        {
          "description": "A layout component that arranges its children vertically. To create a grid layout, nest Rows within this Column.",
          "properties": {
            "align": {
              "default": "stretch",
              "description": "Defines the alignment of children along the cross axis (horizontally). This is similar to the CSS 'align-items' property.",
              "enum": [
                "center",
                "end",
                "start",
                "stretch"
              ],
              "type": "string"
            },
            "children": {
              "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/ChildList",
              "description": "Defines the children. Use an array of strings for a fixed set of children, or a template object to generate children from a data list. Children cannot be defined inline, they must be referred to by ID."
            },
            "component": {
              "const": "Column"
            },
            "justify": {
              "default": "start",
              "description": "Defines the arrangement of children along the main axis (vertically). Use 'spaceBetween' to push items to the edges (e.g. header at top, footer at bottom), or 'start'/'end'/'center' to pack them together.",
              "enum": [
                "center",
                "end",
                "spaceAround",
                "spaceBetween",
                "spaceEvenly",
                "start",
                "stretch"
              ],
              "type": "string"
            }
          },
          "required": [
            "children",
            "component"
          ],
          "type": "object"
        }
      ],
      "type": "object",
      "unevaluatedProperties": false
    },
    "DateTimeInput": {
      "allOf": [
        {
          "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/ComponentCommon"
        },
        {
          "$ref": "#/$defs/CatalogComponentCommon"
        },
        {
          "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/Checkable"
        },
        {
          "properties": {
            "component": {
              "const": "DateTimeInput"
            },
            "enableDate": {
              "default": false,
              "description": "If true, allows the user to select a date.",
              "type": "boolean"
            },
            "enableTime": {
              "default": false,
              "description": "If true, allows the user to select a time.",
              "type": "boolean"
            },
            "label": {
              "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/DynamicString",
              "description": "The text label for the input field."
            },
            "max": {
              "allOf": [
                {
                  "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/DynamicString"
                },
                {
                  "if": {
                    "type": "string"
                  },
                  "then": {
                    "oneOf": [
                      {
                        "format": "date"
                      },
                      {
                        "format": "time"
                      },
                      {
                        "format": "date-time"
                      }
                    ]
                  }
                }
              ],
              "description": "The maximum allowed date/time in ISO 8601 format."
            },
            "min": {
              "allOf": [
                {
                  "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/DynamicString"
                },
                {
                  "if": {
                    "type": "string"
                  },
                  "then": {
                    "oneOf": [
                      {
                        "format": "date"
                      },
                      {
                        "format": "time"
                      },
                      {
                        "format": "date-time"
                      }
                    ]
                  }
                }
              ],
              "description": "The minimum allowed date/time in ISO 8601 format."
            },
            "value": {
              "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/DynamicString",
              "description": "The selected date and/or time value in ISO 8601 format. If not yet set, initialize with an empty string."
            }
          },
          "required": [
            "component",
            "value"
          ],
          "type": "object"
        }
      ],
      "type": "object",
      "unevaluatedProperties": false
    },
    "Divider": {
      "allOf": [
        {
          "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/ComponentCommon"
        },
        {
          "$ref": "#/$defs/CatalogComponentCommon"
        },
        {
          "properties": {
            "axis": {
              "default": "horizontal",
              "description": "The orientation of the divider.",
              "enum": [
                "horizontal",
                "vertical"
              ],
              "type": "string"
            },
            "component": {
              "const": "Divider"
            }
          },
          "required": [
            "component"
          ],
          "type": "object"
        }
      ],
      "type": "object",
      "unevaluatedProperties": false
    },
    "Icon": {
      "allOf": [
        {
          "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/ComponentCommon"
        },
        {
          "$ref": "#/$defs/CatalogComponentCommon"
        },
        {
          "properties": {
            "component": {
              "const": "Icon"
            },
            "name": {
              "description": "The name of the icon to display.",
              "oneOf": [
                {
                  "enum": [
                    "accountCircle",
                    "add",
                    "arrowBack",
                    "arrowForward",
                    "attachFile",
                    "calendarToday",
                    "call",
                    "camera",
                    "check",
                    "close",
                    "delete",
                    "download",
                    "edit",
                    "error",
                    "event",
                    "fastForward",
                    "favorite",
                    "favoriteOff",
                    "folder",
                    "help",
                    "home",
                    "info",
                    "locationOn",
                    "lock",
                    "lockOpen",
                    "mail",
                    "menu",
                    "moreHoriz",
                    "moreVert",
                    "notifications",
                    "notificationsOff",
                    "pause",
                    "payment",
                    "person",
                    "phone",
                    "photo",
                    "play",
                    "print",
                    "refresh",
                    "rewind",
                    "search",
                    "send",
                    "settings",
                    "share",
                    "shoppingCart",
                    "skipNext",
                    "skipPrevious",
                    "star",
                    "starHalf",
                    "starOff",
                    "stop",
                    "upload",
                    "visibility",
                    "visibilityOff",
                    "volumeDown",
                    "volumeMute",
                    "volumeOff",
                    "volumeUp",
                    "warning"
                  ],
                  "type": "string"
                },
                {
                  "additionalProperties": false,
                  "properties": {
                    "svgPath": {
                      "type": "string"
                    }
                  },
                  "required": [
                    "svgPath"
                  ],
                  "type": "object"
                },
                {
                  "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/DataBinding"
                }
              ]
            }
          },
          "required": [
            "component",
            "name"
          ],
          "type": "object"
        }
      ],
      "type": "object",
      "unevaluatedProperties": false
    },
    "Image": {
      "allOf": [
        {
          "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/ComponentCommon"
        },
        {
          "$ref": "#/$defs/CatalogComponentCommon"
        },
        {
          "properties": {
            "component": {
              "const": "Image"
            },
            "description": {
              "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/DynamicString",
              "description": "Accessibility text for the image."
            },
            "fit": {
              "default": "fill",
              "description": "Specifies how the image should be resized to fit its container. This corresponds to the CSS 'object-fit' property.",
              "enum": [
                "contain",
                "cover",
                "fill",
                "none",
                "scaleDown"
              ],
              "type": "string"
            },
            "url": {
              "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/DynamicString",
              "description": "The URL of the image to display."
            },
            "variant": {
              "default": "mediumFeature",
              "description": "A hint for the image size and style.",
              "enum": [
                "avatar",
                "header",
                "icon",
                "largeFeature",
                "mediumFeature",
                "smallFeature"
              ],
              "type": "string"
            }
          },
          "required": [
            "component",
            "url"
          ],
          "type": "object"
        }
      ],
      "type": "object",
      "unevaluatedProperties": false
    },
    "List": {
      "allOf": [
        {
          "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/ComponentCommon"
        },
        {
          "$ref": "#/$defs/CatalogComponentCommon"
        },
        {
          "properties": {
            "align": {
              "default": "stretch",
              "description": "Defines the alignment of children along the cross axis.",
              "enum": [
                "center",
                "end",
                "start",
                "stretch"
              ],
              "type": "string"
            },
            "children": {
              "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/ChildList",
              "description": "Defines the children. Use an array of strings for a fixed set of children, or a template object to generate children from a data list."
            },
            "component": {
              "const": "List"
            },
            "direction": {
              "default": "vertical",
              "description": "The direction in which the list items are laid out.",
              "enum": [
                "horizontal",
                "vertical"
              ],
              "type": "string"
            }
          },
          "required": [
            "children",
            "component"
          ],
          "type": "object"
        }
      ],
      "type": "object",
      "unevaluatedProperties": false
    },
    "Modal": {
      "allOf": [
        {
          "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/ComponentCommon"
        },
        {
          "$ref": "#/$defs/CatalogComponentCommon"
        },
        {
          "properties": {
            "component": {
              "const": "Modal"
            },
            "content": {
              "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/ComponentId",
              "description": "The ID of the component to be displayed inside the modal."
            },
            "trigger": {
              "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/ComponentId",
              "description": "The ID of the component that opens the modal when interacted with (e.g., a button)."
            }
          },
          "required": [
            "component",
            "content",
            "trigger"
          ],
          "type": "object"
        }
      ],
      "type": "object",
      "unevaluatedProperties": false
    },
    "Row": {
      "allOf": [
        {
          "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/ComponentCommon"
        },
        {
          "$ref": "#/$defs/CatalogComponentCommon"
        },
        {
          "description": "A layout component that arranges its children horizontally. To create a grid layout, nest Columns within this Row.",
          "properties": {
            "align": {
              "default": "stretch",
              "description": "Defines the alignment of children along the cross axis (vertically). This is similar to the CSS 'align-items' property, but uses camelCase values (e.g., 'start').",
              "enum": [
                "center",
                "end",
                "start",
                "stretch"
              ],
              "type": "string"
            },
            "children": {
              "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/ChildList",
              "description": "Defines the children. Use an array of strings for a fixed set of children, or a template object to generate children from a data list. Children cannot be defined inline, they must be referred to by ID."
            },
            "component": {
              "const": "Row"
            },
            "justify": {
              "default": "start",
              "description": "Defines the arrangement of children along the main axis (horizontally). Use 'spaceBetween' to push items to the edges, or 'start'/'end'/'center' to pack them together.",
              "enum": [
                "center",
                "end",
                "spaceAround",
                "spaceBetween",
                "spaceEvenly",
                "start",
                "stretch"
              ],
              "type": "string"
            }
          },
          "required": [
            "children",
            "component"
          ],
          "type": "object"
        }
      ],
      "type": "object",
      "unevaluatedProperties": false
    },
    "Slider": {
      "allOf": [
        {
          "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/ComponentCommon"
        },
        {
          "$ref": "#/$defs/CatalogComponentCommon"
        },
        {
          "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/Checkable"
        },
        {
          "properties": {
            "component": {
              "const": "Slider"
            },
            "label": {
              "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/DynamicString",
              "description": "The label for the slider."
            },
            "max": {
              "description": "The maximum value of the slider.",
              "type": "number"
            },
            "min": {
              "default": 0,
              "description": "The minimum value of the slider.",
              "type": "number"
            },
            "value": {
              "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/DynamicNumber",
              "description": "The current value of the slider."
            }
          },
          "required": [
            "component",
            "max",
            "value"
          ],
          "type": "object"
        }
      ],
      "type": "object",
      "unevaluatedProperties": false
    },
    "Tabs": {
      "allOf": [
        {
          "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/ComponentCommon"
        },
        {
          "$ref": "#/$defs/CatalogComponentCommon"
        },
        {
          "properties": {
            "component": {
              "const": "Tabs"
            },
            "tabs": {
              "description": "An array of objects, where each object defines a tab with a title and a child component.",
              "items": {
                "additionalProperties": false,
                "properties": {
                  "child": {
                    "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/ComponentId",
                    "description": "The ID of the child component."
                  },
                  "title": {
                    "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/DynamicString",
                    "description": "The tab title."
                  }
                },
                "required": [
                  "child",
                  "title"
                ],
                "type": "object"
              },
              "minItems": 1,
              "type": "array"
            }
          },
          "required": [
            "component",
            "tabs"
          ],
          "type": "object"
        }
      ],
      "type": "object",
      "unevaluatedProperties": false
    },
    "Text": {
      "allOf": [
        {
          "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/ComponentCommon"
        },
        {
          "$ref": "#/$defs/CatalogComponentCommon"
        },
        {
          "properties": {
            "component": {
              "const": "Text"
            },
            "text": {
              "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/DynamicString",
              "description": "The text content to display. While simple Markdown formatting is supported (i.e. without HTML, images, or links), utilizing dedicated UI components is generally preferred for a richer and more structured presentation."
            },
            "variant": {
              "default": "body",
              "description": "A hint for the base text style.",
              "enum": [
                "body",
                "caption",
                "h1",
                "h2",
                "h3",
                "h4",
                "h5"
              ],
              "type": "string"
            }
          },
          "required": [
            "component",
            "text"
          ],
          "type": "object"
        }
      ],
      "type": "object",
      "unevaluatedProperties": false
    },
    "TextField": {
      "allOf": [
        {
          "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/ComponentCommon"
        },
        {
          "$ref": "#/$defs/CatalogComponentCommon"
        },
        {
          "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/Checkable"
        },
        {
          "properties": {
            "component": {
              "const": "TextField"
            },
            "label": {
              "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/DynamicString",
              "description": "The text label for the input field."
            },
            "validationRegexp": {
              "description": "A regular expression used for client-side validation of the input.",
              "type": "string"
            },
            "value": {
              "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/DynamicString",
              "description": "The value of the text field."
            },
            "variant": {
              "default": "shortText",
              "description": "The type of input field to display.",
              "enum": [
                "longText",
                "number",
                "obscured",
                "shortText"
              ],
              "type": "string"
            }
          },
          "required": [
            "component",
            "label"
          ],
          "type": "object"
        }
      ],
      "type": "object",
      "unevaluatedProperties": false
    },
    "Video": {
      "allOf": [
        {
          "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/ComponentCommon"
        },
        {
          "$ref": "#/$defs/CatalogComponentCommon"
        },
        {
          "properties": {
            "component": {
              "const": "Video"
            },
            "url": {
              "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/DynamicString",
              "description": "The URL of the video to display."
            }
          },
          "required": [
            "component",
            "url"
          ],
          "type": "object"
        }
      ],
      "type": "object",
      "unevaluatedProperties": false
    }
  },
  "description": "Unified catalog of basic A2UI components and functions.",
  "functions": {
    "and": {
      "description": "Performs a logical AND operation on a list of boolean values.",
      "properties": {
        "args": {
          "properties": {
            "values": {
              "description": "The list of boolean values to evaluate.",
              "items": {
                "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/DynamicBoolean"
              },
              "minItems": 2,
              "type": "array"
            }
          },
          "required": [
            "values"
          ],
          "type": "object",
          "unevaluatedProperties": false
        },
        "call": {
          "const": "and"
        },
        "returnType": {
          "const": "boolean"
        }
      },
      "required": [
        "args",
        "call"
      ],
      "type": "object",
      "unevaluatedProperties": false
    },
    "email": {
      "description": "Checks that the value is a valid email address.",
      "properties": {
        "args": {
          "properties": {
            "value": {
              "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/DynamicString"
            }
          },
          "required": [
            "value"
          ],
          "type": "object",
          "unevaluatedProperties": false
        },
        "call": {
          "const": "email"
        },
        "returnType": {
          "const": "boolean"
        }
      },
      "required": [
        "args",
        "call"
      ],
      "type": "object",
      "unevaluatedProperties": false
    },
    "formatCurrency": {
      "description": "Formats a number as a currency string.",
      "properties": {
        "args": {
          "properties": {
            "currency": {
              "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/DynamicString",
              "description": "The ISO 4217 currency code (e.g., 'USD', 'EUR')."
            },
            "decimals": {
              "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/DynamicNumber",
              "description": "Optional. The number of decimal places to show. Defaults to 0 or 2 depending on locale."
            },
            "grouping": {
              "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/DynamicBoolean",
              "description": "Optional. If true, uses locale-specific grouping separators (e.g. '1,000'). If false, returns raw digits (e.g. '1000'). Defaults to true."
            },
            "value": {
              "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/DynamicNumber",
              "description": "The monetary amount."
            }
          },
          "required": [
            "currency",
            "value"
          ],
          "type": "object",
          "unevaluatedProperties": false
        },
        "call": {
          "const": "formatCurrency"
        },
        "returnType": {
          "const": "string"
        }
      },
      "required": [
        "args",
        "call"
      ],
      "type": "object",
      "unevaluatedProperties": false
    },
    "formatDate": {
      "description": "Formats a timestamp into a string using a pattern.",
      "properties": {
        "args": {
          "properties": {
            "format": {
              "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/DynamicString",
              "description": "A Unicode TR35 date pattern string.\n\nToken Reference:\n- Year: 'yy' (26), 'yyyy' (2026)\n- Month: 'M' (1), 'MM' (01), 'MMM' (Jan), 'MMMM' (January)\n- Day: 'd' (1), 'dd' (01), 'E' (Tue), 'EEEE' (Tuesday)\n- Hour (12h): 'h' (1-12), 'hh' (01-12) - requires 'a' for AM/PM\n- Hour (24h): 'H' (0-23), 'HH' (00-23) - Military Time\n- Minute: 'mm' (00-59)\n- Second: 'ss' (00-59)\n- Period: 'a' (AM/PM)\n\nExamples:\n- 'MMM dd, yyyy' -> 'Jan 16, 2026'\n- 'HH:mm' -> '14:30' (Military)\n- 'h:mm a' -> '2:30 PM'\n- 'EEEE, d MMMM' -> 'Friday, 16 January'"
            },
            "value": {
              "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/DynamicValue",
              "description": "The date to format."
            }
          },
          "required": [
            "format",
            "value"
          ],
          "type": "object",
          "unevaluatedProperties": false
        },
        "call": {
          "const": "formatDate"
        },
        "returnType": {
          "const": "string"
        }
      },
      "required": [
        "args",
        "call"
      ],
      "type": "object",
      "unevaluatedProperties": false
    },
    "formatNumber": {
      "description": "Formats a number with the specified grouping and decimal precision.",
      "properties": {
        "args": {
          "properties": {
            "decimals": {
              "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/DynamicNumber",
              "description": "Optional. The number of decimal places to show. Defaults to 0 or 2 depending on locale."
            },
            "grouping": {
              "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/DynamicBoolean",
              "description": "Optional. If true, uses locale-specific grouping separators (e.g. '1,000'). If false, returns raw digits (e.g. '1000'). Defaults to true."
            },
            "value": {
              "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/DynamicNumber",
              "description": "The number to format."
            }
          },
          "required": [
            "value"
          ],
          "type": "object",
          "unevaluatedProperties": false
        },
        "call": {
          "const": "formatNumber"
        },
        "returnType": {
          "const": "string"
        }
      },
      "required": [
        "args",
        "call"
      ],
      "type": "object",
      "unevaluatedProperties": false
    },
    "formatString": {
      "description": "Performs string interpolation of data model values and other functions in the catalog functions list and returns the resulting string. The value string can contain interpolated expressions in the `${expression}` format. Supported expression types include: JSON Pointer paths to the data model (e.g., `${/absolute/path}` or `${relative/path}`), and client-side function calls (e.g., `${now()}`). Function arguments must be named (e.g., `${formatDate(value:${/currentDate}, format:'MM-dd')}`). To include a literal `${` sequence, escape it as `\\${`.",
      "properties": {
        "args": {
          "properties": {
            "value": {
              "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/DynamicString"
            }
          },
          "required": [
            "value"
          ],
          "type": "object",
          "unevaluatedProperties": false
        },
        "call": {
          "const": "formatString"
        },
        "returnType": {
          "const": "string"
        }
      },
      "required": [
        "args",
        "call"
      ],
      "type": "object",
      "unevaluatedProperties": false
    },
    "length": {
      "description": "Checks string length constraints.",
      "properties": {
        "args": {
          "anyOf": [
            {
              "required": [
                "min"
              ]
            },
            {
              "required": [
                "max"
              ]
            }
          ],
          "properties": {
            "max": {
              "description": "The maximum allowed length.",
              "minimum": 0,
              "type": "integer"
            },
            "min": {
              "description": "The minimum allowed length.",
              "minimum": 0,
              "type": "integer"
            },
            "value": {
              "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/DynamicString"
            }
          },
          "required": [
            "value"
          ],
          "type": "object",
          "unevaluatedProperties": false
        },
        "call": {
          "const": "length"
        },
        "returnType": {
          "const": "boolean"
        }
      },
      "required": [
        "args",
        "call"
      ],
      "type": "object",
      "unevaluatedProperties": false
    },
    "not": {
      "description": "Performs a logical NOT operation on a boolean value.",
      "properties": {
        "args": {
          "properties": {
            "value": {
              "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/DynamicBoolean",
              "description": "The boolean value to negate."
            }
          },
          "required": [
            "value"
          ],
          "type": "object",
          "unevaluatedProperties": false
        },
        "call": {
          "const": "not"
        },
        "returnType": {
          "const": "boolean"
        }
      },
      "required": [
        "args",
        "call"
      ],
      "type": "object",
      "unevaluatedProperties": false
    },
    "numeric": {
      "description": "Checks numeric range constraints.",
      "properties": {
        "args": {
          "anyOf": [
            {
              "required": [
                "min"
              ]
            },
            {
              "required": [
                "max"
              ]
            }
          ],
          "properties": {
            "max": {
              "description": "The maximum allowed value.",
              "type": "number"
            },
            "min": {
              "description": "The minimum allowed value.",
              "type": "number"
            },
            "value": {
              "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/DynamicNumber"
            }
          },
          "required": [
            "value"
          ],
          "type": "object",
          "unevaluatedProperties": false
        },
        "call": {
          "const": "numeric"
        },
        "returnType": {
          "const": "boolean"
        }
      },
      "required": [
        "args",
        "call"
      ],
      "type": "object",
      "unevaluatedProperties": false
    },
    "openUrl": {
      "description": "Opens the specified URL in a browser or handler. This function has no return value.",
      "properties": {
        "args": {
          "additionalProperties": false,
          "properties": {
            "url": {
              "description": "The URL to open.",
              "format": "uri",
              "type": "string"
            }
          },
          "required": [
            "url"
          ],
          "type": "object"
        },
        "call": {
          "const": "openUrl"
        },
        "returnType": {
          "const": "void"
        }
      },
      "required": [
        "args",
        "call"
      ],
      "type": "object",
      "unevaluatedProperties": false
    },
    "or": {
      "description": "Performs a logical OR operation on a list of boolean values.",
      "properties": {
        "args": {
          "properties": {
            "values": {
              "description": "The list of boolean values to evaluate.",
              "items": {
                "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/DynamicBoolean"
              },
              "minItems": 2,
              "type": "array"
            }
          },
          "required": [
            "values"
          ],
          "type": "object",
          "unevaluatedProperties": false
        },
        "call": {
          "const": "or"
        },
        "returnType": {
          "const": "boolean"
        }
      },
      "required": [
        "args",
        "call"
      ],
      "type": "object",
      "unevaluatedProperties": false
    },
    "pluralize": {
      "description": "Returns a localized string based on the Common Locale Data Repository (CLDR) plural category of the count (zero, one, two, few, many, other). Requires an 'other' fallback. For English, just use 'one' and 'other'.",
      "properties": {
        "args": {
          "properties": {
            "few": {
              "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/DynamicString",
              "description": "String for the 'few' category (e.g., small groups in Slavic languages)."
            },
            "many": {
              "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/DynamicString",
              "description": "String for the 'many' category (e.g., large groups in various languages)."
            },
            "one": {
              "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/DynamicString",
              "description": "String for the 'one' category (e.g., 1 item)."
            },
            "other": {
              "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/DynamicString",
              "description": "The default/fallback string (used for general plural cases)."
            },
            "two": {
              "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/DynamicString",
              "description": "String for the 'two' category (used in Arabic, Welsh, etc.)."
            },
            "value": {
              "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/DynamicNumber",
              "description": "The numeric value used to determine the plural category."
            },
            "zero": {
              "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/DynamicString",
              "description": "String for the 'zero' category (e.g., 0 items)."
            }
          },
          "required": [
            "other",
            "value"
          ],
          "type": "object",
          "unevaluatedProperties": false
        },
        "call": {
          "const": "pluralize"
        },
        "returnType": {
          "const": "string"
        }
      },
      "required": [
        "args",
        "call"
      ],
      "type": "object",
      "unevaluatedProperties": false
    },
    "regex": {
      "description": "Checks that the value matches a regular expression string.",
      "properties": {
        "args": {
          "properties": {
            "pattern": {
              "description": "The regex pattern to match against.",
              "type": "string"
            },
            "value": {
              "$ref": "https://a2ui.org/specification/v0_9/common_types.json#/$defs/DynamicString"
            }
          },
          "required": [
            "pattern",
            "value"
          ],
          "type": "object",
          "unevaluatedProperties": false
        },
        "call": {
          "const": "regex"
        },
        "returnType": {
          "const": "boolean"
        }
      },
      "required": [
        "args",
        "call"
      ],
      "type": "object",
      "unevaluatedProperties": false
    },
    "required": {
      "description": "Checks that the value is not null, undefined, or empty.",
      "properties": {
        "args": {
          "additionalProperties": false,
          "properties": {
            "value": {
              "description": "The value to check."
            }
          },
          "required": [
            "value"
          ],
          "type": "object"
        },
        "call": {
          "const": "required"
        },
        "returnType": {
          "const": "boolean"
        }
      },
      "required": [
        "args",
        "call"
      ],
      "type": "object",
      "unevaluatedProperties": false
    }
  },
  "title": "A2UI Basic Catalog"
};
