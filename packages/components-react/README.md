# `@sentropic/design-system-react`

React implementation of the Sentropic design-system component catalog. The package ships ESM JavaScript, TypeScript declarations, and the shared component CSS.

## Installation

```bash
npm install @sentropic/design-system-react @sentropic/design-system-themes
```

React and React DOM are peer dependencies:

```bash
npm install react react-dom
```

## Usage

Import the package CSS once at the app or preview boundary, then render components inside `ThemeProvider`.

```tsx
import { Button, Card, ThemeProvider } from "@sentropic/design-system-react";
import "@sentropic/design-system-react/styles.css";

export function Example() {
  return (
    <ThemeProvider>
      <Card>
        <strong>Release plan</strong>
        <Button>Open plan</Button>
      </Card>
    </ThemeProvider>
  );
}
```

`ThemeProvider` defaults to the Sent Tech theme. Tenant themes can be supplied from `@sentropic/design-system-themes`, `@sentropic/design-system-theme-dsfr`, or `@sentropic/design-system-theme-carbon`.

```tsx
import type { ReactNode } from "react";
import { ThemeProvider } from "@sentropic/design-system-react";
import { carbonTheme } from "@sentropic/design-system-theme-carbon";

export function CarbonPreview({ children }: { children: ReactNode }) {
  return <ThemeProvider theme={carbonTheme}>{children}</ThemeProvider>;
}
```

## Exports

- `@sentropic/design-system-react`: all public React components and TypeScript props.
- `@sentropic/design-system-react/styles.css`: component CSS consumed by every theme.

The package includes declarations through `dist/index.d.ts` and marks `dist/styles.css` as a side effect so bundlers keep the stylesheet import.

## Build

```bash
npm --workspace @sentropic/design-system-react run build
npm --workspace @sentropic/design-system-react run test
npm run pack:smoke
```

Publishing is handled by `.github/workflows/react-publish.yml` with a `react-v*` tag.
