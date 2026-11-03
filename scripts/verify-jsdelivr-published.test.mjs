// Offline witnesses for scripts/verify-jsdelivr-published.mjs (L7b Task 8).
//
// A local fixture server stands in for jsDelivr (`--base-url` points at it),
// serving a canned sri.json plus file bytes. Four cases, each through the real
// CLI as a child process: (a) the matching tree passes, (b) one flipped
// integrity character fails, (c) one missing file (404) fails, (d) a
// catalog.json with a wrong catalogId fails.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import http from "node:http";

const SCRIPT = new URL("./verify-jsdelivr-published.mjs", import.meta.url).pathname;
const PACKAGE = "@sentropic/design-system-elements";
const VERSION = "0.2.0";

function sha384Integrity(bytes) {
  return `sha384-${createHash("sha384").update(bytes).digest("base64")}`;
}

function cannedTree({ flipIntegrity = false, dropFile = null, wrongCatalog = false } = {}) {
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
  return { files, bodies, catalog };
}

function startFixture(tree) {
  const routes = new Map();
  const prefix = `/npm/${PACKAGE}@${VERSION}`;
  routes.set(`${prefix}/dist/browser/sri.json`, {
    status: 200,
    contentType: "application/json",
    body: Buffer.from(JSON.stringify({ version: VERSION, files: tree.files })),
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
function runScript(baseUrl) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "node",
      [SCRIPT, "--package", PACKAGE, "--version", VERSION, "--attempts", "3", "--delay-ms", "10", "--base-url", baseUrl],
      { stdio: ["ignore", "pipe", "pipe"] },
    );
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));
    child.on("error", reject);
    child.on("close", (status) => resolve({ status, stdout, stderr }));
  });
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
