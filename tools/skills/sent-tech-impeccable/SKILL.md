---
name: sent-tech-impeccable
description: "Run @sentropic/design-system-impeccable against a target and return findings as JSON for DS linting."
argument-hint: "audit <url | file.html | inline-html>"
user-invocable: true
allowed-tools:
  - Bash(node scripts/audit.mjs *)
---

Lightweight DS lint skill for Sentinel/Doc contexts.

## Command

- `sent-tech-impeccable audit <target>`
  - `<target>` supports URL, file path or inline HTML content.
  - The wrapper forwards to the workspace contract `design audit <target>`.

## Expected output

- JSON `AuditReport` on stdout.
- Exit code convention: `0` (clean), `1` (findings), `2` (runtime issue).
