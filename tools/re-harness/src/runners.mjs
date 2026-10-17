// Runner adapters behind one interface: run(fixture, ops) ->
// { model, events, geometry, pixels, verdict }. The candidate runner is a
// stub by design at L0: it declares `unsupported` per entry and is never
// counted `covered` (task L0 clause 2).
import { runEngine } from "./engines.mjs";

export function referenceRunner() {
  return {
    id: "reference",
    async run(fixture, ops) {
      return runEngine(fixture, ops);
    },
  };
}

export function candidateStubRunner() {
  return {
    id: "candidate",
    async run() {
      // No parity implementation exists at L0. Never fabricate a result.
      return { unsupported: true };
    },
  };
}

// Execute one side in the harness page (browser mode). `engineSource` is the
// serialised runEngine function; the page evaluates it deterministically.
export async function runInPage(page, fixture, ops) {
  return page.evaluate(
    ([fixtureJson, opsJson]) => {
      const fixture = JSON.parse(fixtureJson);
      const ops = JSON.parse(opsJson);
      return window.__reHarnessRun(fixture, ops);
    },
    [JSON.stringify(fixture), JSON.stringify(ops || { schemaVersion: 1, id: "empty", steps: [] })],
  );
}
