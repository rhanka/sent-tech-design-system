import type { Fixture } from './types.js';
export default [
  {
    "id": "default",
    "props": {
      "value": "Hello",
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
      "value": "Draft",
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
    "id": "placeholder",
    "props": {
      "value": "",
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
      "placeholder": "Compose here"
    }
  },
  {
    "id": "missing-messages",
    "props": {
      "value": "",
      "messages": {}
    }
  },
  {
    "id": "full-profile",
    "props": {
      "value": "# Heading\n\n**Bold**",
      "profile": "full",
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
  }
] satisfies Fixture[];
