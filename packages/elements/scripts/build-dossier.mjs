import { createHash } from "node:crypto";
import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { build, normalizePath } from "vite";

const packageDir = dirname(dirname(fileURLToPath(import.meta.url)));
const kitDir = join(packageDir, "dist", "focus-kit");
const domDir = join(packageDir, "src", "element", "dom");
const themeFile = normalizePath(join(packageDir, "..", "themes", "css", "sent-tech.css"));
const reviewCore = "@sentropic/design-system-review-core";
const packageManifest = JSON.parse(readFileSync(join(packageDir, "package.json"), "utf8"));
const reviewCoreEntry = import.meta.resolve(reviewCore);
const installedReviewCore = JSON.parse(readFileSync(new URL("../package.json", reviewCoreEntry), "utf8"));
if (installedReviewCore.version !== packageManifest.dependencies[reviewCore]) {
  throw new Error(`Focus kit resolved ${reviewCore}@${installedReviewCore.version}`);
}

const dossierConfig = {
  configFile: false,
  envDir: false,
  root: packageDir,
  publicDir: false,
  logLevel: "warn",
  resolve: {
    // CommentLayer imports this name too. Keep both importers on the
    // exact published dependency resolved from elements, including in SSR.
    alias: [{ find: /^@sentropic\/design-system-review-core$/, replacement: fileURLToPath(reviewCoreEntry) }],
    dedupe: [reviewCore],
  },
  ssr: { noExternal: [reviewCore] },
};

function buildDossier(input, outDir, entryFileNames) {
  return build({
    ...dossierConfig,
    plugins: [
      {
        name: "focus-kit-theme",
        enforce: "pre",
        transform(css, id) {
          if (id !== themeFile) return;
          // Move the theme declaration into the selector before Lightning CSS parses it.
          return css.replace(/(@media \(prefers-color-scheme: dark\) \{)\s*color-scheme: dark;\s*(:root:not\([^)]*\) \{)/,
            "$1\n  $2\n    color-scheme: dark;").replace(/:root(?=\[data-color-mode=|:not\()/g, '[data-st-theme="sent-tech"]');
        },
      },
      svelte({ compilerOptions: { css: "external", customElement: false } }),
    ],
    build: {
      outDir,
      emptyOutDir: true,
      target: "es2022",
      cssCodeSplit: false,
      modulePreload: false,
      rollupOptions: {
        input: join(domDir, input),
        preserveEntrySignatures: "strict",
        treeshake: true,
        output: { format: "es", entryFileNames, assetFileNames: "renderer/dossier[extname]" },
      },
    },
  });
}

const { output } = await buildDossier("dossier-entry.ts", kitDir, "renderer/dossier.js");
const entry = output.find((file) => file.type === "chunk" && file.isEntry);
const css = output.find((file) => file.type === "asset" && file.fileName === "renderer/dossier.css");
if (output.length !== 2 || entry?.fileName !== "renderer/dossier.js" || css === undefined ||
    entry.imports.length > 0 || entry.dynamicImports.length > 0) {
  throw new Error("The dossier kit must emit one self-contained module and one external stylesheet");
}
const renderedModules = Object.entries(entry.modules).filter(([, module]) => module.renderedLength > 0);
if (renderedModules.some(([id]) => /[\\/]dom[\\/]browser-entry\.ts$|[\\/]dom[\\/].+-element\.svelte$/.test(id))) {
  throw new Error("The dossier kit includes a Shadow DOM element");
}
const svelteComponents = renderedModules.filter(([id]) => id.endsWith(".svelte"));
if (svelteComponents.length > 0) {
  throw new Error(`The dossier kit includes unexpected Svelte components: ${svelteComponents.map(([id]) => id).join(", ")}`);
}

// The package import exposes mounting without running the static page bootstrap.
await buildDossier("dossier-mount.ts", join(packageDir, "dist", "dossier"), "dossier-mount.js");

const entrypoint = "index.html";
copyFileSync(join(domDir, "dossier-shell.html"), join(kitDir, entrypoint));
const mimeTypes = {
  [entrypoint]: "text/html",
  [css.fileName]: "text/css",
  [entry.fileName]: "text/javascript",
};
const files = Object.keys(mimeTypes).sort().map((path) => {
  const bytes = readFileSync(join(kitDir, path));
  return {
    mimeType: mimeTypes[path],
    path,
    sha256: `sha256:${createHash("sha256").update(bytes).digest("hex")}`,
    size: bytes.length,
  };
});
const { name, version } = packageManifest;
// The manifest keys are in RFC 8785 order at both levels. The manifest lives
// beside the kit payload and lists the bytes shipped to the artifact host.
const manifest = {
  capabilities: ["decision-v1", "decision-v2", "deep-links", "embedded-evidence", "report-v2"],
  entrypoint,
  files,
  name,
  version,
};
const manifestBytes = JSON.stringify(manifest);
writeFileSync(join(packageDir, "dist", "focus-kit-manifest.json"), manifestBytes);
const kitBytes = files.reduce((sum, file) => sum + file.size, 0);
console.log(`Focus kit K: ${kitBytes} bytes (${files.map(({ path, size }) => `${path}: ${size}`).join(", ")})`);
console.log(`Focus kit digest: sha256:${createHash("sha256").update(manifestBytes).digest("hex")}`);
console.log(`Focus kit graph: ${renderedModules.length} rendered modules, ${svelteComponents.length} Svelte components`);
