# Sent Tech Design System Foundation V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first shippable slice of the Sent Tech design system: monorepo scaffold, token/theme compiler, runtime tenant theme contract, first Svelte components, and bilingual component documentation.

**Architecture:** Use an npm workspace monorepo with focused packages. Tokens and themes are framework-agnostic TypeScript packages that emit CSS variables. Svelte components consume only semantic/component CSS variables, and the docs app imports the real components.

**Tech Stack:** npm workspaces, TypeScript, Svelte 5, SvelteKit docs app, Vite, Vitest, Testing Library Svelte, axe checks, JSON Schema-style runtime validation.

---

## Scope Check

This plan implements the V1 foundation only. The full spec includes additional subsystems that should become separate plans after this one:

- full stable component catalog beyond the first primitives
- visual regression infrastructure
- external design system adapters beyond the initial adapter shape
- Entropic Chat UI components after the Entropic refactor stabilizes
- Graphify full graph rendering
- product migrations in `sentech-forge`, `entropic`, `spa-transpose-cv`, `nc-fullstack`, and `graphify`

This plan still includes chat tokens and chat contracts so Entropic can refactor against a stable design-system boundary without freezing chat components too early.

## File Structure

- `package.json`: root workspace scripts and dev dependencies.
- `.gitignore`: generated output, dependencies, caches.
- `README.md`: public-facing repo orientation in FR/EN.
- `tsconfig.base.json`: shared TypeScript config.
- `packages/tokens/package.json`: token package metadata.
- `packages/tokens/src/index.ts`: public token exports.
- `packages/tokens/src/foundation.ts`: foundation token values.
- `packages/tokens/src/semantic.ts`: semantic token aliases.
- `packages/tokens/src/component.ts`: component token aliases, including chat and graph tokens.
- `packages/tokens/src/css.ts`: CSS variable serialization.
- `packages/tokens/src/css.test.ts`: token CSS unit tests.
- `packages/themes/package.json`: theme package metadata.
- `packages/themes/src/index.ts`: public theme exports.
- `packages/themes/src/schema.ts`: runtime tenant theme validation.
- `packages/themes/src/themes/sent-tech.ts`: default Sent Tech theme.
- `packages/themes/src/themes/forge.ts`: Forge-compatible theme.
- `packages/themes/src/themes/entropic.ts`: Entropic-compatible theme.
- `packages/themes/src/compile.ts`: runtime/build-time theme compiler.
- `packages/themes/src/compile.test.ts`: theme compiler tests.
- `packages/components-svelte/package.json`: Svelte component package metadata.
- `packages/components-svelte/src/lib/Button.svelte`: first stable action primitive.
- `packages/components-svelte/src/lib/Badge.svelte`: first stable status primitive.
- `packages/components-svelte/src/lib/Card.svelte`: first stable surface primitive.
- `packages/components-svelte/src/lib/ThemeProvider.svelte`: scoped runtime theme injection.
- `packages/components-svelte/src/lib/index.ts`: component exports.
- `packages/components-svelte/src/lib/Button.test.ts`: component behavior test.
- `apps/docs/package.json`: docs app metadata.
- `apps/docs/src/lib/i18n.ts`: FR/EN dictionary helper.
- `apps/docs/src/routes/+layout.svelte`: docs shell.
- `apps/docs/src/routes/+page.svelte`: docs home.
- `apps/docs/src/routes/components/button/+page.svelte`: bilingual Button docs using the real component.
- `apps/docs/src/app.css`: docs app token import and shell styling.
- `docs/chat-ui-contract.md`: Entropic chat token and API contract draft.

### Task 1: Root Workspace Scaffold

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `tsconfig.base.json`
- Create: `README.md`

- [ ] **Step 1: Write the failing workspace check**

Run:

```bash
npm run check
```

Expected: FAIL with `Missing script: "check"` because the workspace is not scaffolded yet.

- [ ] **Step 2: Create the root package manifest**

Create `package.json`:

```json
{
  "name": "@sent-tech/design-system-root",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "workspaces": [
    "packages/*",
    "apps/*"
  ],
  "scripts": {
    "build": "npm run build --workspaces --if-present",
    "check": "npm run check --workspaces --if-present",
    "test": "npm run test --workspaces --if-present",
    "lint": "npm run lint --workspaces --if-present",
    "docs:dev": "npm --workspace apps/docs run dev",
    "docs:build": "npm --workspace apps/docs run build"
  },
  "devDependencies": {
    "@sveltejs/adapter-static": "^3.0.10",
    "@sveltejs/kit": "^2.37.1",
    "@sveltejs/vite-plugin-svelte": "^6.2.4",
    "@testing-library/svelte": "^5.2.8",
    "@types/node": "^24.10.0",
    "@vitest/coverage-v8": "^4.0.15",
    "jsdom": "^27.2.0",
    "svelte": "^5.53.2",
    "svelte-check": "^4.3.4",
    "typescript": "^5.9.3",
    "vite": "^7.3.1",
    "vitest": "^4.0.15"
  }
}
```

- [ ] **Step 3: Create root ignores**

Create `.gitignore`:

```gitignore
node_modules/
.svelte-kit/
.vite/
dist/
build/
coverage/
*.log
.DS_Store
.env
.env.*
!.env.example
```

- [ ] **Step 4: Create shared TypeScript config**

Create `tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "skipLibCheck": true
  }
}
```

- [ ] **Step 5: Create the repo README**

Create `README.md`:

```markdown
# Sent Tech Design System

Design system Svelte pour les produits Sent Tech, avec support marque blanche, thèmes runtime par tenant, export CSS build-time et documentation bilingue FR/EN.

## Packages

- `@sent-tech/tokens`: tokens foundation, semantic et component.
- `@sent-tech/themes`: thèmes Sent Tech, Forge, Entropic et white-label.
- `@sent-tech/components-svelte`: composants Svelte stylés par tokens.
- `apps/docs`: documentation interactive type Carbon.

## Development

```bash
npm install
npm run check
npm test
npm run docs:dev
```

## Public Safety

Ce repo est destiné à devenir public. Ne pas y publier de secrets, extraits de code propriétaire, URLs internes privées ou détails client non validés.
```

- [ ] **Step 6: Install dependencies**

Run:

```bash
npm install
```

Expected: PASS and creates `package-lock.json`.

- [ ] **Step 7: Verify root scripts**

Run:

```bash
npm run check
```

Expected: PASS with no workspace checks yet.

- [ ] **Step 8: Commit and push**

Run:

```bash
git add package.json package-lock.json .gitignore tsconfig.base.json README.md
git commit -m "chore: scaffold npm workspace"
git push -u origin main
```

Expected: commit succeeds. Push succeeds only after `origin` is configured and public/private publication has explicit approval.

### Task 2: Token Package

**Files:**
- Create: `packages/tokens/package.json`
- Create: `packages/tokens/tsconfig.json`
- Create: `packages/tokens/src/foundation.ts`
- Create: `packages/tokens/src/semantic.ts`
- Create: `packages/tokens/src/component.ts`
- Create: `packages/tokens/src/css.ts`
- Create: `packages/tokens/src/index.ts`
- Create: `packages/tokens/src/css.test.ts`

- [ ] **Step 1: Write the failing token test command**

Run:

```bash
npm --workspace packages/tokens test
```

Expected: FAIL because `packages/tokens` does not exist.

- [ ] **Step 2: Create token package metadata**

Create `packages/tokens/package.json`:

```json
{
  "name": "@sent-tech/tokens",
  "version": "0.1.0",
  "type": "module",
  "sideEffects": false,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "check": "tsc -p tsconfig.json --noEmit",
    "test": "vitest run src"
  }
}
```

Create `packages/tokens/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src/**/*.ts"]
}
```

- [ ] **Step 3: Create foundation tokens**

Create `packages/tokens/src/foundation.ts`:

```ts
export type TokenValue = string | number;
export type TokenTree = Record<string, TokenValue | TokenTree>;

export const foundation = {
  color: {
    blue: {
      10: "oklch(97% 0.02 242)",
      60: "oklch(50% 0.134 242.749)",
      80: "oklch(32% 0.11 242)"
    },
    cyan: {
      10: "oklch(96% 0.04 195)",
      50: "oklch(70.4% 0.14 182.503)",
      70: "oklch(48% 0.12 190)"
    },
    slate: {
      0: "#ffffff",
      10: "#f8fafc",
      20: "#e2e8f0",
      60: "#475569",
      80: "#1e293b",
      90: "#0f172a"
    },
    feedback: {
      success: "#16a34a",
      warning: "#d97706",
      error: "#dc2626",
      info: "#2563eb"
    }
  },
  font: {
    sans: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "Inter, system-ui, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace"
  },
  spacing: {
    0: "0",
    1: "0.25rem",
    2: "0.5rem",
    3: "0.75rem",
    4: "1rem",
    6: "1.5rem",
    8: "2rem",
    12: "3rem",
    16: "4rem"
  },
  radius: {
    none: "0",
    sm: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    pill: "999px"
  },
  shadow: {
    subtle: "0 1px 2px rgb(15 23 42 / 0.08)",
    medium: "0 8px 24px rgb(15 23 42 / 0.12)",
    floating: "0 18px 45px rgb(15 23 42 / 0.18)"
  },
  motion: {
    fast: "120ms",
    normal: "180ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  z: {
    header: 50,
    overlay: 80,
    modal: 90,
    toast: 100,
    chat: 110
  }
} as const satisfies TokenTree;
```

- [ ] **Step 4: Create semantic tokens**

Create `packages/tokens/src/semantic.ts`:

```ts
import { foundation } from "./foundation";

export const semantic = {
  surface: {
    default: foundation.color.slate[0],
    subtle: foundation.color.slate[10],
    raised: foundation.color.slate[0],
    inverse: foundation.color.slate[90],
    overlay: "rgb(15 23 42 / 0.48)"
  },
  text: {
    primary: foundation.color.slate[90],
    secondary: foundation.color.slate[60],
    muted: "#64748b",
    inverse: foundation.color.slate[0],
    link: foundation.color.blue[60]
  },
  border: {
    subtle: foundation.color.slate[20],
    strong: "#94a3b8",
    interactive: foundation.color.blue[60]
  },
  action: {
    primary: foundation.color.blue[60],
    primaryText: foundation.color.slate[0],
    secondary: foundation.color.slate[10],
    secondaryText: foundation.color.slate[90],
    danger: foundation.color.feedback.error
  },
  feedback: {
    success: foundation.color.feedback.success,
    warning: foundation.color.feedback.warning,
    error: foundation.color.feedback.error,
    info: foundation.color.feedback.info
  },
  status: {
    pending: foundation.color.feedback.warning,
    processing: foundation.color.feedback.info,
    completed: foundation.color.feedback.success,
    failed: foundation.color.feedback.error
  },
  data: {
    category1: "#4E79A7",
    category2: "#F28E2B",
    category3: "#E15759",
    category4: "#76B7B2",
    category5: "#59A14F",
    category6: "#EDC948",
    category7: "#B07AA1",
    category8: "#FF9DA7"
  }
} as const;
```

- [ ] **Step 5: Create component tokens**

Create `packages/tokens/src/component.ts`:

```ts
import { foundation } from "./foundation";
import { semantic } from "./semantic";

export const component = {
  button: {
    radius: foundation.radius.md,
    primaryBackground: semantic.action.primary,
    primaryText: semantic.action.primaryText,
    secondaryBackground: semantic.action.secondary,
    secondaryText: semantic.action.secondaryText
  },
  card: {
    background: semantic.surface.raised,
    border: semantic.border.subtle,
    radius: foundation.radius.lg,
    shadow: foundation.shadow.subtle
  },
  input: {
    background: semantic.surface.default,
    border: semantic.border.subtle,
    focusRing: semantic.border.interactive,
    radius: foundation.radius.md
  },
  chat: {
    userBubbleBackground: semantic.action.primary,
    userBubbleText: semantic.action.primaryText,
    assistantBubbleBackground: semantic.surface.subtle,
    assistantBubbleText: semantic.text.primary,
    composerSurface: semantic.surface.raised,
    toolCallSurface: semantic.surface.subtle
  },
  graph: {
    panelBackground: semantic.surface.inverse,
    panelText: semantic.text.inverse,
    edgeDefault: "rgb(226 232 240 / 0.56)",
    community1: semantic.data.category1,
    community2: semantic.data.category2,
    community3: semantic.data.category3,
    community4: semantic.data.category4
  }
} as const;
```

- [ ] **Step 6: Create CSS serialization**

Create `packages/tokens/src/css.ts`:

```ts
import type { TokenTree, TokenValue } from "./foundation";

export function flattenTokens(tree: TokenTree, prefix: string[] = []): Record<string, TokenValue> {
  const output: Record<string, TokenValue> = {};
  for (const [key, value] of Object.entries(tree)) {
    const path = [...prefix, key];
    if (typeof value === "object" && value !== null) {
      Object.assign(output, flattenTokens(value as TokenTree, path));
    } else {
      output[path.join("-")] = value;
    }
  }
  return output;
}

export function toCssVariables(tree: TokenTree, selector = ":root", namespace = "st"): string {
  const entries = Object.entries(flattenTokens(tree));
  const body = entries
    .map(([name, value]) => `  --${namespace}-${name}: ${String(value)};`)
    .join("\n");
  return `${selector} {\n${body}\n}\n`;
}
```

Create `packages/tokens/src/index.ts`:

```ts
export { foundation } from "./foundation";
export type { TokenTree, TokenValue } from "./foundation";
export { semantic } from "./semantic";
export { component } from "./component";
export { flattenTokens, toCssVariables } from "./css";
```

- [ ] **Step 7: Test CSS serialization**

Create `packages/tokens/src/css.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { flattenTokens, toCssVariables } from "./css";

describe("token CSS serialization", () => {
  it("flattens nested tokens with dash-separated paths", () => {
    expect(flattenTokens({ color: { brand: "#123456" } })).toEqual({
      "color-brand": "#123456"
    });
  });

  it("serializes CSS variables in a scoped selector", () => {
    expect(toCssVariables({ action: { primary: "#123456" } }, "[data-theme='x']")).toBe(
      "[data-theme='x'] {\n  --st-action-primary: #123456;\n}\n"
    );
  });
});
```

- [ ] **Step 8: Verify token package**

Run:

```bash
npm --workspace packages/tokens test
npm --workspace packages/tokens run check
npm --workspace packages/tokens run build
```

Expected: all commands PASS.

- [ ] **Step 9: Commit and push**

Run:

```bash
git add packages/tokens
git commit -m "feat(tokens): add foundation token package"
git push
```

Expected: commit succeeds. Push succeeds after remote approval/configuration.

### Task 3: Theme Package And Runtime Tenant Compiler

**Files:**
- Create: `packages/themes/package.json`
- Create: `packages/themes/tsconfig.json`
- Create: `packages/themes/src/schema.ts`
- Create: `packages/themes/src/compile.ts`
- Create: `packages/themes/src/themes/sent-tech.ts`
- Create: `packages/themes/src/themes/forge.ts`
- Create: `packages/themes/src/themes/entropic.ts`
- Create: `packages/themes/src/index.ts`
- Create: `packages/themes/src/compile.test.ts`

- [ ] **Step 1: Write the failing theme test command**

Run:

```bash
npm --workspace packages/themes test
```

Expected: FAIL because `packages/themes` does not exist.

- [ ] **Step 2: Create theme package metadata**

Create `packages/themes/package.json`:

```json
{
  "name": "@sent-tech/themes",
  "version": "0.1.0",
  "type": "module",
  "sideEffects": false,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "dependencies": {
    "@sent-tech/tokens": "0.1.0"
  },
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "check": "tsc -p tsconfig.json --noEmit",
    "test": "vitest run src"
  }
}
```

Create `packages/themes/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src/**/*.ts"]
}
```

- [ ] **Step 3: Create tenant theme schema**

Create `packages/themes/src/schema.ts`:

```ts
import type { TokenTree } from "@sent-tech/tokens";

export type ThemeMode = "light" | "dark";

export interface TenantTheme {
  id: string;
  label: string;
  mode: ThemeMode;
  tokens: TokenTree;
}

export function assertTenantTheme(input: unknown): asserts input is TenantTheme {
  if (!input || typeof input !== "object") {
    throw new Error("Theme must be an object");
  }
  const theme = input as Record<string, unknown>;
  if (typeof theme.id !== "string" || theme.id.trim().length === 0) {
    throw new Error("Theme id is required");
  }
  if (typeof theme.label !== "string" || theme.label.trim().length === 0) {
    throw new Error("Theme label is required");
  }
  if (theme.mode !== "light" && theme.mode !== "dark") {
    throw new Error("Theme mode must be light or dark");
  }
  if (!theme.tokens || typeof theme.tokens !== "object") {
    throw new Error("Theme tokens are required");
  }
}
```

- [ ] **Step 4: Create theme compiler**

Create `packages/themes/src/compile.ts`:

```ts
import { toCssVariables } from "@sent-tech/tokens";
import { assertTenantTheme, type TenantTheme } from "./schema";

export interface CompileThemeOptions {
  selector?: string;
  namespace?: string;
}

export function compileTheme(input: unknown, options: CompileThemeOptions = {}): string {
  assertTenantTheme(input);
  const theme = input as TenantTheme;
  const selector = options.selector ?? `[data-st-theme="${theme.id}"]`;
  const namespace = options.namespace ?? "st";
  return toCssVariables(theme.tokens, selector, namespace);
}

export function compileThemeStyleTag(input: unknown, options: CompileThemeOptions = {}): string {
  assertTenantTheme(input);
  const theme = input as TenantTheme;
  return `<style data-st-theme-style="${theme.id}">\n${compileTheme(theme, options)}</style>`;
}
```

- [ ] **Step 5: Create default themes**

Create `packages/themes/src/themes/sent-tech.ts`:

```ts
import { component, semantic } from "@sent-tech/tokens";
import type { TenantTheme } from "../schema";

export const sentTechTheme: TenantTheme = {
  id: "sent-tech",
  label: "Sent Tech",
  mode: "light",
  tokens: {
    semantic,
    component
  }
};
```

Create `packages/themes/src/themes/forge.ts`:

```ts
import { component, semantic } from "@sent-tech/tokens";
import type { TenantTheme } from "../schema";

export const forgeTheme: TenantTheme = {
  id: "forge",
  label: "Sent Tech Forge",
  mode: "light",
  tokens: {
    semantic: {
      ...semantic,
      action: {
        ...semantic.action,
        primary: "hsl(215 70% 25%)",
        primaryText: "hsl(0 0% 100%)"
      }
    },
    component
  }
};
```

Create `packages/themes/src/themes/entropic.ts`:

```ts
import { component, semantic } from "@sent-tech/tokens";
import type { TenantTheme } from "../schema";

export const entropicTheme: TenantTheme = {
  id: "entropic",
  label: "Entropic",
  mode: "light",
  tokens: {
    semantic: {
      ...semantic,
      action: {
        ...semantic.action,
        primary: "oklch(50% 0.134 242.749)",
        primaryText: "#ffffff"
      }
    },
    component: {
      ...component,
      chat: {
        ...component.chat,
        composerSurface: "#ffffff",
        toolCallSurface: "#f8fafc"
      }
    }
  }
};
```

- [ ] **Step 6: Create theme exports**

Create `packages/themes/src/index.ts`:

```ts
export { foundation, semantic, component } from "@sent-tech/tokens";
export type { TokenTree, TokenValue } from "@sent-tech/tokens";
export type { TenantTheme, ThemeMode } from "./schema";
export { assertTenantTheme } from "./schema";
export { compileTheme, compileThemeStyleTag } from "./compile";
export { sentTechTheme } from "./themes/sent-tech";
export { forgeTheme } from "./themes/forge";
export { entropicTheme } from "./themes/entropic";
```

- [ ] **Step 7: Test theme compiler**

Create `packages/themes/src/compile.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { compileTheme } from "./compile";
import { sentTechTheme } from "./themes/sent-tech";

describe("compileTheme", () => {
  it("compiles a tenant theme into scoped CSS variables", () => {
    const css = compileTheme(sentTechTheme);
    expect(css).toContain('[data-st-theme="sent-tech"]');
    expect(css).toContain("--st-semantic-action-primary:");
    expect(css).toContain("--st-component-chat-composerSurface:");
  });

  it("rejects malformed themes", () => {
    expect(() => compileTheme({ id: "", label: "Broken", mode: "light", tokens: {} })).toThrow(
      "Theme id is required"
    );
  });
});
```

- [ ] **Step 8: Verify themes**

Run:

```bash
npm --workspace packages/themes test
npm --workspace packages/themes run check
npm --workspace packages/themes run build
```

Expected: all commands PASS.

- [ ] **Step 9: Commit and push**

Run:

```bash
git add packages/themes
git commit -m "feat(themes): add tenant theme compiler"
git push
```

Expected: commit succeeds. Push succeeds after remote approval/configuration.

### Task 4: First Svelte Components

**Files:**
- Create: `packages/components-svelte/package.json`
- Create: `packages/components-svelte/tsconfig.json`
- Create: `packages/components-svelte/vite.config.ts`
- Create: `packages/components-svelte/src/lib/Button.svelte`
- Create: `packages/components-svelte/src/lib/Badge.svelte`
- Create: `packages/components-svelte/src/lib/Card.svelte`
- Create: `packages/components-svelte/src/lib/ThemeProvider.svelte`
- Create: `packages/components-svelte/src/lib/index.ts`
- Create: `packages/components-svelte/src/lib/Button.test.ts`

- [ ] **Step 1: Write the failing component test command**

Run:

```bash
npm --workspace packages/components-svelte test
```

Expected: FAIL because `packages/components-svelte` does not exist.

- [ ] **Step 2: Create component package metadata**

Create `packages/components-svelte/package.json`:

```json
{
  "name": "@sent-tech/components-svelte",
  "version": "0.1.0",
  "type": "module",
  "sideEffects": ["**/*.css"],
  "svelte": "./src/lib/index.ts",
  "exports": {
    ".": {
      "svelte": "./src/lib/index.ts",
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "dependencies": {
    "@sent-tech/themes": "0.1.0",
    "svelte": "^5.53.2"
  },
  "scripts": {
    "build": "vite build",
    "check": "svelte-check --tsconfig tsconfig.json",
    "test": "vitest run src"
  },
  "devDependencies": {
    "@sveltejs/vite-plugin-svelte": "^6.2.4",
    "@testing-library/svelte": "^5.2.8",
    "vite": "^7.3.1",
    "vitest": "^4.0.15"
  }
}
```

Create `packages/components-svelte/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "types": ["svelte", "vitest/globals"]
  },
  "include": ["src/**/*.ts", "src/**/*.svelte"]
}
```

Create `packages/components-svelte/vite.config.ts`:

```ts
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [svelte()],
  test: {
    environment: "jsdom"
  },
  build: {
    lib: {
      entry: "src/lib/index.ts",
      formats: ["es"],
      fileName: "index"
    },
    rollupOptions: {
      external: ["svelte", "@sent-tech/themes"]
    }
  }
});
```

- [ ] **Step 3: Create Button**

Create `packages/components-svelte/src/lib/Button.svelte`:

```svelte
<script lang="ts">
  export let variant: "primary" | "secondary" | "ghost" | "danger" = "primary";
  export let size: "sm" | "md" | "lg" = "md";
  export let disabled = false;
  export let type: "button" | "submit" | "reset" = "button";
</script>

<button class="st-button st-button--{variant} st-button--{size}" {type} {disabled} on:click>
  <slot />
</button>

<style>
  .st-button {
    border: 1px solid transparent;
    border-radius: var(--st-component-button-radius, 0.375rem);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--st-spacing-2, 0.5rem);
    font: inherit;
    font-weight: 600;
    transition:
      background var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      border-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
  }

  .st-button--sm {
    min-height: 2rem;
    padding: 0 0.75rem;
    font-size: 0.875rem;
  }

  .st-button--md {
    min-height: 2.5rem;
    padding: 0 1rem;
    font-size: 0.9375rem;
  }

  .st-button--lg {
    min-height: 3rem;
    padding: 0 1.25rem;
    font-size: 1rem;
  }

  .st-button--primary {
    background: var(--st-component-button-primaryBackground, var(--st-semantic-action-primary));
    color: var(--st-component-button-primaryText, var(--st-semantic-action-primaryText));
  }

  .st-button--secondary {
    background: var(--st-component-button-secondaryBackground, var(--st-semantic-action-secondary));
    color: var(--st-component-button-secondaryText, var(--st-semantic-action-secondaryText));
    border-color: var(--st-semantic-border-subtle);
  }

  .st-button--ghost {
    background: transparent;
    color: var(--st-semantic-text-link);
  }

  .st-button--danger {
    background: var(--st-semantic-action-danger);
    color: var(--st-semantic-text-inverse);
  }

  .st-button:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  .st-button:focus-visible {
    outline: 2px solid var(--st-component-input-focusRing, var(--st-semantic-border-interactive));
    outline-offset: 2px;
  }
</style>
```

- [ ] **Step 4: Create Badge and Card**

Create `packages/components-svelte/src/lib/Badge.svelte`:

```svelte
<script lang="ts">
  export let tone: "neutral" | "success" | "warning" | "error" | "info" = "neutral";
</script>

<span class="st-badge st-badge--{tone}">
  <slot />
</span>

<style>
  .st-badge {
    display: inline-flex;
    align-items: center;
    border-radius: var(--st-radius-pill, 999px);
    font-size: 0.75rem;
    font-weight: 650;
    line-height: 1;
    padding: 0.25rem 0.5rem;
  }

  .st-badge--neutral {
    background: var(--st-semantic-surface-subtle);
    color: var(--st-semantic-text-secondary);
  }

  .st-badge--success {
    background: color-mix(in srgb, var(--st-semantic-feedback-success) 14%, white);
    color: var(--st-semantic-feedback-success);
  }

  .st-badge--warning {
    background: color-mix(in srgb, var(--st-semantic-feedback-warning) 14%, white);
    color: var(--st-semantic-feedback-warning);
  }

  .st-badge--error {
    background: color-mix(in srgb, var(--st-semantic-feedback-error) 14%, white);
    color: var(--st-semantic-feedback-error);
  }

  .st-badge--info {
    background: color-mix(in srgb, var(--st-semantic-feedback-info) 14%, white);
    color: var(--st-semantic-feedback-info);
  }
</style>
```

Create `packages/components-svelte/src/lib/Card.svelte`:

```svelte
<script lang="ts">
  export let interactive = false;
</script>

<section class:st-card--interactive={interactive} class="st-card">
  <slot />
</section>

<style>
  .st-card {
    background: var(--st-component-card-background, var(--st-semantic-surface-raised));
    border: 1px solid var(--st-component-card-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-component-card-radius, 0.5rem);
    box-shadow: var(--st-component-card-shadow, 0 1px 2px rgb(15 23 42 / 0.08));
    color: var(--st-semantic-text-primary);
    padding: var(--st-spacing-4, 1rem);
  }

  .st-card--interactive {
    cursor: pointer;
    transition:
      box-shadow var(--st-motion-normal, 180ms) var(--st-motion-easing, ease),
      transform var(--st-motion-normal, 180ms) var(--st-motion-easing, ease);
  }

  .st-card--interactive:hover {
    box-shadow: var(--st-shadow-medium, 0 8px 24px rgb(15 23 42 / 0.12));
    transform: translateY(-1px);
  }
</style>
```

- [ ] **Step 5: Create ThemeProvider**

Create `packages/components-svelte/src/lib/ThemeProvider.svelte`:

```svelte
<script lang="ts">
  import { compileTheme, sentTechTheme, type TenantTheme } from "@sent-tech/themes";

  export let theme: TenantTheme = sentTechTheme;
  export let namespace = "st";

  $: css = compileTheme(theme, { selector: `[data-st-theme="${theme.id}"]`, namespace });
</script>

<svelte:head>
  {@html `<style data-st-theme-provider="${theme.id}">${css}</style>`}
</svelte:head>

<div data-st-theme={theme.id}>
  <slot />
</div>
```

Create `packages/components-svelte/src/lib/index.ts`:

```ts
export { default as Badge } from "./Badge.svelte";
export { default as Button } from "./Button.svelte";
export { default as Card } from "./Card.svelte";
export { default as ThemeProvider } from "./ThemeProvider.svelte";
```

- [ ] **Step 6: Test Button behavior**

Create `packages/components-svelte/src/lib/Button.test.ts`:

```ts
import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import Button from "./Button.svelte";

describe("Button", () => {
  it("renders slotted text", () => {
    render(Button, { props: { variant: "primary" } as never, slots: { default: "Save" } });
    expect(screen.getByRole("button", { name: "Save" })).toBeTruthy();
  });

  it("forwards disabled state", () => {
    render(Button, { props: { disabled: true } as never, slots: { default: "Save" } });
    expect(screen.getByRole("button", { name: "Save" })).toHaveProperty("disabled", true);
  });
});
```

- [ ] **Step 7: Verify components**

Run:

```bash
npm --workspace packages/components-svelte test
npm --workspace packages/components-svelte run check
npm --workspace packages/components-svelte run build
```

Expected: all commands PASS.

- [ ] **Step 8: Commit and push**

Run:

```bash
git add packages/components-svelte
git commit -m "feat(svelte): add first token-driven components"
git push
```

Expected: commit succeeds. Push succeeds after remote approval/configuration.

### Task 5: Bilingual Docs App

**Files:**
- Create: `apps/docs/package.json`
- Create: `apps/docs/svelte.config.js`
- Create: `apps/docs/vite.config.ts`
- Create: `apps/docs/tsconfig.json`
- Create: `apps/docs/src/app.css`
- Create: `apps/docs/src/lib/i18n.ts`
- Create: `apps/docs/src/routes/+layout.svelte`
- Create: `apps/docs/src/routes/+page.svelte`
- Create: `apps/docs/src/routes/components/button/+page.svelte`

- [ ] **Step 1: Write the failing docs build command**

Run:

```bash
npm run docs:build
```

Expected: FAIL because `apps/docs` does not exist.

- [ ] **Step 2: Create docs package metadata and config**

Create `apps/docs/package.json`:

```json
{
  "name": "@sent-tech/docs",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "dependencies": {
    "@sent-tech/components-svelte": "0.1.0",
    "@sent-tech/themes": "0.1.0",
    "@sveltejs/adapter-static": "^3.0.10",
    "@sveltejs/kit": "^2.37.1",
    "svelte": "^5.53.2"
  },
  "devDependencies": {
    "@sveltejs/vite-plugin-svelte": "^6.2.4",
    "vite": "^7.3.1"
  },
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "check": "svelte-check --tsconfig tsconfig.json",
    "test": "vitest run src"
  }
}
```

Create `apps/docs/svelte.config.js`:

```js
import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter()
  }
};
```

Create `apps/docs/vite.config.ts`:

```ts
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()]
});
```

Create `apps/docs/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "types": ["svelte"]
  },
  "include": ["src/**/*.ts", "src/**/*.svelte"]
}
```

- [ ] **Step 3: Create docs styles and i18n helper**

Create `apps/docs/src/app.css`:

```css
:root {
  color: var(--st-semantic-text-primary, #0f172a);
  font-family: var(--st-font-sans, Inter, system-ui, sans-serif);
  background: var(--st-semantic-surface-default, #ffffff);
}

body {
  margin: 0;
}

.docs-shell {
  min-height: 100vh;
}

.docs-header {
  border-bottom: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
}

.docs-main {
  margin: 0 auto;
  max-width: 72rem;
  padding: 2rem 1.5rem 4rem;
}

.docs-example {
  border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
  border-radius: 0.5rem;
  padding: 1rem;
}
```

Create `apps/docs/src/lib/i18n.ts`:

```ts
export type Locale = "fr" | "en";

const copy = {
  fr: {
    title: "Sent Tech Design System",
    subtitle: "Composants Svelte, tokens, marque blanche et thèmes tenant.",
    buttonTitle: "Button",
    buttonIntro: "Action principale, secondaire, fantôme ou destructive.",
    statusStable: "Stable",
    apiTitle: "API",
    tokensTitle: "Tokens utilisés"
  },
  en: {
    title: "Sent Tech Design System",
    subtitle: "Svelte components, tokens, white-labeling, and tenant themes.",
    buttonTitle: "Button",
    buttonIntro: "Primary, secondary, ghost, or destructive action.",
    statusStable: "Stable",
    apiTitle: "API",
    tokensTitle: "Used tokens"
  }
} as const;

export function t(locale: Locale, key: keyof typeof copy.fr): string {
  return copy[locale][key];
}
```

- [ ] **Step 4: Create layout and home page**

Create `apps/docs/src/routes/+layout.svelte`:

```svelte
<script lang="ts">
  import "../app.css";
  import { ThemeProvider } from "@sent-tech/components-svelte";
  import { sentTechTheme } from "@sent-tech/themes";
</script>

<ThemeProvider theme={sentTechTheme}>
  <div class="docs-shell">
    <header class="docs-header">
      <a href="/">Sent Tech DS</a>
      <nav>
        <a href="/components/button">Button</a>
      </nav>
    </header>
    <main class="docs-main">
      <slot />
    </main>
  </div>
</ThemeProvider>
```

Create `apps/docs/src/routes/+page.svelte`:

```svelte
<script lang="ts">
  import { t, type Locale } from "$lib/i18n";
  let locale: Locale = "fr";
</script>

<label>
  Langue
  <select bind:value={locale}>
    <option value="fr">FR</option>
    <option value="en">EN</option>
  </select>
</label>

<h1>{t(locale, "title")}</h1>
<p>{t(locale, "subtitle")}</p>

<ul>
  <li><a href="/components/button">Button</a></li>
</ul>
```

- [ ] **Step 5: Create Button docs page**

Create `apps/docs/src/routes/components/button/+page.svelte`:

```svelte
<script lang="ts">
  import { Badge, Button, Card } from "@sent-tech/components-svelte";
  import { t, type Locale } from "$lib/i18n";
  let locale: Locale = "fr";
</script>

<label>
  Langue
  <select bind:value={locale}>
    <option value="fr">FR</option>
    <option value="en">EN</option>
  </select>
</label>

<h1>{t(locale, "buttonTitle")} <Badge tone="success">{t(locale, "statusStable")}</Badge></h1>
<p>{t(locale, "buttonIntro")}</p>

<Card>
  <div class="docs-example">
    <Button>Primary</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="danger">Danger</Button>
  </div>
</Card>

<h2>{t(locale, "apiTitle")}</h2>
<table>
  <thead>
    <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
  </thead>
  <tbody>
    <tr><td>variant</td><td>"primary" | "secondary" | "ghost" | "danger"</td><td>"primary"</td></tr>
    <tr><td>size</td><td>"sm" | "md" | "lg"</td><td>"md"</td></tr>
    <tr><td>disabled</td><td>boolean</td><td>false</td></tr>
  </tbody>
</table>

<h2>{t(locale, "tokensTitle")}</h2>
<ul>
  <li><code>--st-component-button-primaryBackground</code></li>
  <li><code>--st-component-button-primaryText</code></li>
  <li><code>--st-component-button-radius</code></li>
  <li><code>--st-component-input-focusRing</code></li>
</ul>
```

- [ ] **Step 6: Verify docs**

Run:

```bash
npm run docs:build
npm --workspace apps/docs run check
```

Expected: both commands PASS.

- [ ] **Step 7: Commit and push**

Run:

```bash
git add apps/docs
git commit -m "feat(docs): add bilingual component documentation"
git push
```

Expected: commit succeeds. Push succeeds after remote approval/configuration.

### Task 6: Chat UI Contract And Incubation Boundary

**Files:**
- Create: `docs/chat-ui-contract.md`
- Modify: `packages/tokens/src/component.ts`
- Modify: `packages/tokens/src/css.test.ts`

- [ ] **Step 1: Write the failing contract check**

Run:

```bash
rg "Chat UI Incubation Contract" docs/chat-ui-contract.md
```

Expected: FAIL because `docs/chat-ui-contract.md` does not exist.

- [ ] **Step 2: Create chat contract**

Create `docs/chat-ui-contract.md`:

```markdown
# Chat UI Incubation Contract

Status: experimental contract, stable tokens.

The Entropic Chat UI is in active refactoring. The design system must provide tokens and data contracts now, but it must not freeze Svelte chat component APIs until the Entropic refactor has landed.

## Modes

- `floating`: detached panel with launcher button.
- `docked`: side panel that resizes the application content.
- `sidepanel`: browser extension or host-owned panel.
- `embedded`: inline chat surface inside a product view.

## Required Token Groups

- `component.chat.userBubbleBackground`
- `component.chat.userBubbleText`
- `component.chat.assistantBubbleBackground`
- `component.chat.assistantBubbleText`
- `component.chat.composerSurface`
- `component.chat.toolCallSurface`
- `semantic.status.pending`
- `semantic.status.processing`
- `semantic.status.completed`
- `semantic.status.failed`

## Event Contract

```ts
export type ChatRuntimeEvent =
  | { type: "message.delta"; messageId: string; delta: string }
  | { type: "message.completed"; messageId: string }
  | { type: "tool.started"; toolCallId: string; toolName: string }
  | { type: "tool.completed"; toolCallId: string; status: "success" | "error" }
  | { type: "permission.requested"; toolCallId: string; choices: string[] }
  | { type: "checkpoint.requested"; checkpointId: string; label: string };
```

## Stabilization Rule

Chat components can move from `experimental` to `beta` only after Entropic exposes a settled refactored API for message rendering, composer state, tool permissions, queue status, host adapters, and extension/webview modes.
```

- [ ] **Step 3: Add explicit chat status token test**

Modify `packages/tokens/src/css.test.ts` to include:

```ts
import { component } from "./component";

it("contains stable chat component tokens", () => {
  expect(component.chat).toMatchObject({
    userBubbleBackground: expect.any(String),
    assistantBubbleBackground: expect.any(String),
    composerSurface: expect.any(String),
    toolCallSurface: expect.any(String)
  });
});
```

- [ ] **Step 4: Verify chat contract and token tests**

Run:

```bash
rg "Chat UI Incubation Contract" docs/chat-ui-contract.md
npm --workspace packages/tokens test
```

Expected: both commands PASS.

- [ ] **Step 5: Commit and push**

Run:

```bash
git add docs/chat-ui-contract.md packages/tokens/src/css.test.ts
git commit -m "docs(chat): define incubation contract"
git push
```

Expected: commit succeeds. Push succeeds after remote approval/configuration.

### Task 7: End-To-End Foundation Verification

**Files:**
- Modify: `package.json`
- Create: `docs/superpowers/reports/foundation-v1-verification.md`

- [ ] **Step 1: Add root verification script**

Modify the root `package.json` scripts to include:

```json
"verify": "npm run check && npm test && npm run build && npm run docs:build"
```

- [ ] **Step 2: Run complete verification**

Run:

```bash
npm run verify
```

Expected: PASS across tokens, themes, Svelte components, and docs build.

- [ ] **Step 3: Write verification report**

Create `docs/superpowers/reports/foundation-v1-verification.md`:

```markdown
# Foundation V1 Verification

Date: 2026-05-05

Commands run:

- `npm run check`
- `npm test`
- `npm run build`
- `npm run docs:build`
- `npm run verify`

Result: all commands passed.

Known limits:

- Chat UI components remain experimental until the Entropic refactor stabilizes.
- External design system adapters are represented by architecture and token contracts only in Foundation V1.
- Product migrations are not part of Foundation V1.
```

- [ ] **Step 4: Commit and push**

Run:

```bash
git add package.json docs/superpowers/reports/foundation-v1-verification.md
git commit -m "test: verify foundation v1"
git push
```

Expected: commit succeeds. Push succeeds after remote approval/configuration.

## Self-Review

Spec coverage:

- Monorepo package structure: covered by Task 1.
- Tokens foundation/semantic/component: covered by Task 2.
- Runtime tenant theme and build-time CSS generation: covered by Task 3.
- First stable Svelte components: covered by Task 4.
- Bilingual Carbon-like docs baseline: covered by Task 5.
- Chat UI as tokens/contracts only: covered by Task 6.
- Verification and commit cadence: covered by Task 7.

Known intentional gaps for later plans:

- full component catalog
- visual regression
- Tailwind v3/v4 adapters
- Airbus-like external adapter implementation
- product migrations
- Entropic Chat UI beta components after refactor

Completeness scan:

- This plan contains no vague markers or unnamed implementation step.
- All file paths and commands are explicit.

Type consistency:

- `TenantTheme` is defined in `packages/themes/src/schema.ts` and exported through `packages/themes/src/index.ts`.
- `compileTheme` consumes `TenantTheme` and is used by `ThemeProvider`.
- Chat tokens are kept under `component.chat` consistently across tokens, tests, and docs.
