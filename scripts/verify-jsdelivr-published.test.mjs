// Offline witnesses for scripts/verify-jsdelivr-published.mjs (L7b Task 8).
//
// A local fixture server stands in for jsDelivr (`--base-url` points at it),
// serving a canned sri.json plus file bytes. Elements cases, each through the
// real CLI as a child process: (a) the matching tree passes, (b) one flipped
// integrity character fails, (c) one missing file (404) fails, (d) a
// catalog.json with a wrong catalogId fails, (e) an sri.json whose version
// differs from the requested version fails, (f) an empty files map fails,
// (g) an entry missing its integrity fails, (h) an entry missing its bytes
// fails, (i) an entry pinned with a non-sha384 algorithm fails.
// Diagram-core cases: (j) the matching tree passes, (k) a package.json whose
// version differs fails, (l) a missing dist file (404) fails, (m) an npm view
// mismatch fails (in-process, stubbed registry view).
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import http from "node:http";
import { checkDiagramCore } from "./verify-jsdelivr-published.mjs";

const SCRIPT = new URL("./verify-jsdelivr-published.mjs", import.meta.url).pathname;
const PACKAGE = "@sentropic/design-system-elements";
const VERSION = "0.2.0";
const DIAGRAM_PACKAGE = "@sentropic/diagram-core";
const DIAGRAM_VERSION = "0.1.0";

function sha384Integrity(bytes) {
  return `sha384-${createHash("sha384").update(bytes).digest("base64")}`;
}

function cannedTree({
  flipIntegrity = false,
  dropFile = null,
  wrongCatalog = false,
  sriVersion = VERSION,
  emptyFiles = false,
  dropIntegrityFor = null,
  dropBytesFor = null,
  sha512For = null,
} = {}) {
  const entryBytes = Buffer.from("console.log('elements entry');\n");
  const chunkBytes = Buffer.from("export const focus = 1;\n");
  const files = {
    "elements.js": {
      bytes: entryBytes.length,
      integrity: sha384Integrity(entryBytes),
      group: "core",
    },
    "chunks/focus-renderer-abc.js": {
      bytes: chunkBytes.length,
      integrity: flipIntegrity
        ? `${sha384Integrity(chunkBytes).slice(0, -1)}A`
        : sha384Integrity(chunkBytes),
      group: "engine:focus",
    },
  };
  if (dropIntegrityFor) delete files[dropIntegrityFor].integrity;
  if (dropBytesFor) delete files[dropBytesFor].bytes;
  if (sha512For) {
    files[sha512For].integrity = `sha512-${createHash("sha512").update(chunkBytes).digest("base64")}`;
  }
  if (emptyFiles) {
    for (const key of Object.keys(files)) delete files[key];
  }
  const bodies = { "elements.js": entryBytes };
  if (dropFile !== "chunks/focus-renderer-abc.js") bodies["chunks/focus-renderer-abc.js"] = chunkBytes;
  const catalog = {
    catalogId: wrongCatalog
      ? "https://design-system.sent-tech.ca/catalogs/elements/v0/catalog.json"
      : "https://design-system.sent-tech.ca/catalogs/elements/v1/catalog.json",
    $id: wrongCatalog
      ? "https://design-system.sent-tech.ca/catalogs/elements/v0/catalog.json"
      : "https://design-system.sent-tech.ca/catalogs/elements/v1/catalog.json",
  };
  return { files, bodies, catalog, sriVersion };
}

function startFixture(tree) {
  const routes = new Map();
  const prefix = `/npm/${PACKAGE}@${VERSION}`;
  routes.set(`${prefix}/dist/browser/sri.json`, {
    status: 200,
    contentType: "application/json",
    body: Buffer.from(JSON.stringify({ version: tree.sriVersion, files: tree.files })),
  });
  for (const [name, bytes] of Object.entries(tree.bodies)) {
    routes.set(`${prefix}/dist/browser/${name}`, {
      status: 200,
      contentType: "application/javascript",
      body: bytes,
    });
  }
  for (const rel of ["catalog.json"]) {
    routes.set(`${prefix}/${rel}`, {
      status: 200,
      contentType: "application/json",
      body: Buffer.from(JSON.stringify(tree.catalog)),
    });
  }
  for (const rel of ["envelope.json", "schemas/BarChart.v1.json", "schemas/BpmnCanvas.v1.json", "schemas/DecisionDossier.v1.json"]) {
    routes.set(`${prefix}/${rel}`, {
      status: 200,
      contentType: "application/json",
      body: Buffer.from(JSON.stringify({ $id: `https://example.invalid/${rel}` })),
    });
  }
  const server = http.createServer((req, res) => {
    const route = routes.get(req.url ?? "");
    if (!route) {
      res.writeHead(404, { "content-type": "text/plain" });
      res.end("not found");
      return;
    }
    res.writeHead(route.status, { "content-type": route.contentType });
    res.end(route.body);
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${address.port}/npm` });
    });
  });
}

// Async spawn (never spawnSync): the fixture server lives on this process's
// event loop, and a synchronous wait would block it from accepting the
// child's connections — a self-deadlock measured on the first version of
// this file.
function runScript(baseUrl, { packageName = PACKAGE, version = VERSION, env = {} } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "node",
      [SCRIPT, "--package", packageName, "--version", version, "--attempts", "3", "--delay-ms", "10", "--base-url", baseUrl],
      { stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, ...env } },
    );
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));
    child.on("error", reject);
    child.on("close", (status) => resolve({ status, stdout, stderr }));
  });
}

function diagramCoreTree({ packageVersion = DIAGRAM_VERSION, dropFile = null } = {}) {
  const indexJs = Buffer.from("export const diagram = 1;\n");
  const indexDts = Buffer.from("export declare const diagram: number;\n");
  const bodies = { "dist/index.js": indexJs };
  if (dropFile !== "dist/index.d.ts") bodies["dist/index.d.ts"] = indexDts;
  return { packageJson: { name: DIAGRAM_PACKAGE, version: packageVersion }, bodies };
}

function startDiagramCoreFixture(tree) {
  const routes = new Map();
  const prefix = `/npm/${DIAGRAM_PACKAGE}@${DIAGRAM_VERSION}`;
  routes.set(`${prefix}/package.json`, {
    status: 200,
    contentType: "application/json",
    body: Buffer.from(JSON.stringify(tree.packageJson)),
  });
  for (const [name, bytes] of Object.entries(tree.bodies)) {
    routes.set(`${prefix}/${name}`, {
      status: 200,
      contentType: "application/javascript",
      body: bytes,
    });
  }
  const server = http.createServer((req, res) => {
    const route = routes.get(req.url ?? "");
    if (!route) {
      res.writeHead(404, { "content-type": "text/plain" });
      res.end("not found");
      return;
    }
    res.writeHead(route.status, { "content-type": route.contentType });
    res.end(route.body);
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${address.port}/npm` });
    });
  });
}

// The registry leg (`npm view`) needs the real registry, so the CLI-level
// diagram-core witnesses skip it via SKIP_NPM_VIEW and exercise the CDN legs;
// the registry leg itself is witnessed in-process with a stubbed view below.
function runDiagramCore(baseUrl) {
  return runScript(baseUrl, { packageName: DIAGRAM_PACKAGE, version: DIAGRAM_VERSION, env: { SKIP_NPM_VIEW: "1" } });
}

function closeServer(t, server) {
  t.after(() => {
    if (typeof server.closeAllConnections === "function") server.closeAllConnections();
    server.close();
  });
}

test("matching fixture passes", async (t) => {
  const { server, baseUrl } = await startFixture(cannedTree());
  closeServer(t, server);
  const result = await runScript(baseUrl);
  assert.equal(result.status, 0, `expected exit 0, got ${result.status}: ${result.stderr}`);
});

test("one flipped integrity character fails", async (t) => {
  const { server, baseUrl } = await startFixture(cannedTree({ flipIntegrity: true }));
  closeServer(t, server);
  const result = await runScript(baseUrl);
  assert.notEqual(result.status, 0, "expected a non-zero exit for a flipped integrity");
  assert.match(String(result.stderr), /integrity/, "the failure names the integrity mismatch");
});

test("one missing file (404) fails", async (t) => {
  const { server, baseUrl } = await startFixture(cannedTree({ dropFile: "chunks/focus-renderer-abc.js" }));
  closeServer(t, server);
  const result = await runScript(baseUrl);
  assert.notEqual(result.status, 0, "expected a non-zero exit for a 404 file");
  assert.match(String(result.stderr), /HTTP 404|404/, "the failure names the missing file");
});

test("a catalog.json with a wrong catalogId fails", async (t) => {
  const { server, baseUrl } = await startFixture(cannedTree({ wrongCatalog: true }));
  closeServer(t, server);
  const result = await runScript(baseUrl);
  assert.notEqual(result.status, 0, "expected a non-zero exit for a wrong catalogId");
  assert.match(String(result.stderr), /catalogId/, "the failure names the catalogId");
});

test("an sri.json whose version differs from the requested version fails", async (t) => {
  const { server, baseUrl } = await startFixture(cannedTree({ sriVersion: "9.9.9" }));
  closeServer(t, server);
  const result = await runScript(baseUrl);
  assert.notEqual(result.status, 0, "expected a non-zero exit for an sri version mismatch");
  assert.match(String(result.stderr), /version/, "the failure names the version mismatch");
});

test("an empty files map fails", async (t) => {
  const { server, baseUrl } = await startFixture(cannedTree({ emptyFiles: true }));
  closeServer(t, server);
  const result = await runScript(baseUrl);
  assert.notEqual(result.status, 0, "expected a non-zero exit for an empty files map");
  assert.match(String(result.stderr), /files/, "the failure names the empty files map");
});

test("an entry missing its integrity fails", async (t) => {
  const { server, baseUrl } = await startFixture(cannedTree({ dropIntegrityFor: "chunks/focus-renderer-abc.js" }));
  closeServer(t, server);
  const result = await runScript(baseUrl);
  assert.notEqual(result.status, 0, "expected a non-zero exit for a missing integrity");
  assert.match(String(result.stderr), /integrity/, "the failure names the missing integrity");
});

test("an entry missing its bytes fails", async (t) => {
  const { server, baseUrl } = await startFixture(cannedTree({ dropBytesFor: "chunks/focus-renderer-abc.js" }));
  closeServer(t, server);
  const result = await runScript(baseUrl);
  assert.notEqual(result.status, 0, "expected a non-zero exit for missing bytes");
  assert.match(String(result.stderr), /bytes/, "the failure names the missing bytes");
});

test("an entry pinned with a non-sha384 algorithm fails", async (t) => {
  const { server, baseUrl } = await startFixture(cannedTree({ sha512For: "chunks/focus-renderer-abc.js" }));
  closeServer(t, server);
  const result = await runScript(baseUrl);
  assert.notEqual(result.status, 0, "expected a non-zero exit for a non-sha384 integrity");
  assert.match(String(result.stderr), /integrity/, "the failure names the unexpected algorithm");
});

test("diagram-core matching fixture passes", async (t) => {
  const { server, baseUrl } = await startDiagramCoreFixture(diagramCoreTree());
  closeServer(t, server);
  const result = await runDiagramCore(baseUrl);
  assert.equal(result.status, 0, `expected exit 0, got ${result.status}: ${result.stderr}`);
});

test("diagram-core package.json version mismatch fails", async (t) => {
  const { server, baseUrl } = await startDiagramCoreFixture(diagramCoreTree({ packageVersion: "9.9.9" }));
  closeServer(t, server);
  const result = await runDiagramCore(baseUrl);
  assert.notEqual(result.status, 0, "expected a non-zero exit for a package.json version mismatch");
  assert.match(String(result.stderr), /version/, "the failure names the version mismatch");
});

test("diagram-core missing dist file (404) fails", async (t) => {
  const { server, baseUrl } = await startDiagramCoreFixture(diagramCoreTree({ dropFile: "dist/index.d.ts" }));
  closeServer(t, server);
  const result = await runDiagramCore(baseUrl);
  assert.notEqual(result.status, 0, "expected a non-zero exit for a 404 dist file");
  assert.match(String(result.stderr), /404/, "the failure names the missing dist file");
});

test("diagram-core npm view mismatch fails", async (t) => {
  const { server, baseUrl } = await startDiagramCoreFixture(diagramCoreTree());
  closeServer(t, server);
  const failures = [];
  await checkDiagramCore(
    {
      packageName: DIAGRAM_PACKAGE,
      version: DIAGRAM_VERSION,
      base: `${baseUrl}/npm/${DIAGRAM_PACKAGE}@${DIAGRAM_VERSION}`,
      attempts: 3,
      delayMs: 10,
      npmView: () => ({ status: 0, output: "9.9.9" }),
    },
    failures,
  );
  assert.ok(failures.length > 0, "expected at least one failure for an npm view mismatch");
  assert.match(failures.join("\n"), /npm view/, "the failure names the npm view mismatch");
});
