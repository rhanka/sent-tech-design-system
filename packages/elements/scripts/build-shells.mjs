import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "fflate";
import { build, normalizePath } from "vite";

const budgets = { rawExclusive: 960 * 1024, gzipInclusive: 150 * 1024 };
const compression = { engine: "fflate@0.8.3", level: 6, mtime: 0 };
const entryId = "virtual:elements-component-shell";

function digest(bytes, encoding = "hex") {
  return createHash("sha256").update(bytes).digest(encoding);
}

function fingerprint(bytes) {
  return { bytes: Buffer.byteLength(bytes), sha256: digest(bytes) };
}

function entryPlugin(packageDir, tag) {
  const dom = normalizePath(join(packageDir, "src", "element", "dom"));
  return {
    name: "elements-component-shell",
    resolveId(id) {
      if (id === entryId) return `\0${entryId}`;
    },
    load(id) {
      if (id !== `\0${entryId}`) return;
      return `import "${dom}/${tag.slice(3)}-element.svelte";
import { patchElementApi } from "${dom}/element-api.ts";
patchElementApi(${JSON.stringify(tag)});`;
    },
  };
}

function shellHtml(tag, module) {
  const script = module.replace(/<\/script/gi, "<\\/script");
  const csp = `default-src 'none'; script-src 'sha256-${digest(script, "base64")}'; style-src 'unsafe-inline'; img-src data:; font-src data:`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<title>${tag}</title>
</head>
<body>
<${tag}><!-- st-envelope --></${tag}>
<script type="module">${script}</script>
</body>
</html>
`;
}

export async function buildComponentShells(packageDir, compileSvelte) {
  const dir = join(packageDir, "dist", "shells");
  const read = (file) => readFileSync(join(packageDir, file));
  const catalog = JSON.parse(read("catalog.json"));
  const { version } = JSON.parse(read("package.json"));
  const inputs = Object.fromEntries(["catalog.json", "envelope.json", "dist/browser/sri.json"]
    .map((file) => [file, fingerprint(read(file))]));
  const components = {};

  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });

  for (const [name, entry] of Object.entries(catalog.components)) {
    const { element, fallback } = entry["x-sentropic"];
    const result = await build({
      configFile: false,
      root: packageDir,
      logLevel: "error",
      plugins: [compileSvelte(), entryPlugin(packageDir, element)],
      build: {
        write: false,
        target: "es2022",
        modulePreload: false,
        assetsInlineLimit: Infinity,
        rollupOptions: {
          treeshake: false,
          input: entryId,
          output: { format: "es", codeSplitting: false },
        },
      },
    });
    const [chunk] = result.output;
    if (result.output.length !== 1 || chunk?.type !== "chunk" || chunk.imports.length !== 0 ||
        chunk.dynamicImports.some((file) => file !== chunk.fileName)) {
      const details = JSON.stringify(result.output.map((file) => file.type === "chunk"
        ? { path: file.fileName, imports: file.imports, dynamicImports: file.dynamicImports }
        : { asset: file.fileName }));
      throw new Error(`${name}: expected one standalone module, received ${details}`);
    }
    const html = shellHtml(element, chunk.code);
    const complete = {
      ...fingerprint(html),
      gzip: gzipSync(Buffer.from(html), { level: compression.level, mtime: compression.mtime }).length,
    };
    const inBudget = complete.bytes < budgets.rawExclusive && complete.gzip <= budgets.gzipInclusive;
    const schema = `schemas/${name}.v1.json`;
    inputs[schema] = fingerprint(read(schema));

    if (inBudget) {
      const module = `${name}.js`;
      const shell = `${name}.html`;
      writeFileSync(join(dir, module), chunk.code);
      writeFileSync(join(dir, shell), html);
      components[name] = {
        element, schema, fallback, status: "qualified", complete,
        module: { path: module, ...fingerprint(chunk.code) },
        shell,
      };
    } else if (name === "BpmnCanvas") {
      components[name] = { element, schema, fallback: "text", url: "host", status: "partial", complete };
    } else {
      throw new Error(`${name}: complete shell exceeds budget (${complete.bytes} raw, ${complete.gzip} gzip)`);
    }
    console.log(`${name}: ${complete.bytes} raw bytes, ${complete.gzip} gzip-6 bytes (${components[name].status})`);
  }

  writeFileSync(join(dir, "manifest.json"), JSON.stringify({
    contract: "elements-shells/1", version, budgets, compression, inputs, components,
  }, null, 2) + "\n");
}
