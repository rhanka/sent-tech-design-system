import type { Fixture } from './types.js';
import { parseFullMarkdown } from '@sentropic/design-system-rich-text';
export default [
  {
    "id": "default",
    "props": {
      "value": {
        "format": "focus.markdown.p0@1",
        "blocks": [
          {
            "paragraphId": "p:1",
            "kind": "paragraph",
            "text": "Hello"
          }
        ]
      },
      "messages": {
        "editorLabel": "Editor",
        "placeholder": "Write here",
        "preservedBlockLabel": "Preserved {kind}",
        "externalConflictLabel": "Conflict",
        "presenceLabel": "{count} viewers",
        "lockLabel": "Held by {holder}",
        "noLockLabel": "Unlocked",
        "unlockRequestLabel": "Request unlock"
      }
    }
  },
  {
    "id": "disabled",
    "props": {
      "value": {
        "format": "focus.markdown.p0@1",
        "blocks": [
          {
            "paragraphId": "p:1",
            "kind": "paragraph",
            "text": "Hello"
          }
        ]
      },
      "messages": {
        "editorLabel": "Editor",
        "placeholder": "Write here",
        "preservedBlockLabel": "Preserved {kind}",
        "externalConflictLabel": "Conflict",
        "presenceLabel": "{count} viewers",
        "lockLabel": "Held by {holder}",
        "noLockLabel": "Unlocked",
        "unlockRequestLabel": "Request unlock"
      },
      "disabled": true,
      "class": "consumer"
    }
  },
  {
    "id": "missing-messages",
    "props": {
      "value": {
        "format": "focus.markdown.p0@1",
        "blocks": [
          {
            "paragraphId": "p:1",
            "kind": "paragraph",
            "text": "Hello"
          }
        ]
      },
      "messages": {}
    }
  },
  {
    "id": "live-lock",
    "props": {
      "value": {
        "format": "focus.markdown.p0@1",
        "blocks": [
          {
            "paragraphId": "p:1",
            "kind": "paragraph",
            "text": "Hello"
          }
        ]
      },
      "messages": {
        "editorLabel": "Editor",
        "placeholder": "Write here",
        "preservedBlockLabel": "Preserved {kind}",
        "externalConflictLabel": "Conflict",
        "presenceLabel": "{count} viewers",
        "lockLabel": "Held by {holder}",
        "noLockLabel": "Unlocked",
        "unlockRequestLabel": "Request unlock"
      },
      "lock": {
        "holder": {
          "actorId": "person:1",
          "kind": "human",
          "displayLabel": "Sam"
        }
      },
      "presence": {
        "total": 3,
        "actors": [
          {
            "actorId": "person:1",
            "kind": "human",
            "displayLabel": "Sam"
          }
        ]
      },
      "capabilities": {
        "canRequestUnlock": true
      }
    }
  },
  { id: "full-profile", props: { profile: "full", value: parseFullMarkdown('Full editor', () => 'p:1').document, messages: { editorLabel: "Editor", placeholder: "Write here", preservedBlockLabel: "Preserved {kind}", externalConflictLabel: "Conflict" } } }
] satisfies Fixture[];
