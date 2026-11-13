<script lang="ts">
  import { DiagramSceneFigure } from "@sentropic/design-system-svelte";
  import {
    CURRENT_SCHEMA_VERSION, DIAGRAM_PRESENTATION_CONTRACT_PIN,
    documentRef, entityRef, relationRef, occurrenceRef,
    m3ProfileRegistry, shippedExecutorBindings, text, quantity,
    withFlowTypes, type SemanticDocument,
  } from "@sentropic/diagram-core";

  const components = ["app", "auth", "database"];
  // Authored component interactions; the first task is an internal self-step.
  const interactions = [
    [1, "", "app", "app", "start"],
    [2, "", "app", "auth", "authenticate"],
    [3, "a", "auth", "database", "profile"],
    [3, "b", "auth", "database", "session"],
    [4, "", "auth", "app", "complete"],
  ] as const;
  const base: SemanticDocument = {
    documentId: documentRef("login"), schemaVersion: CURRENT_SCHEMA_VERSION,
    revision: 1, profileRefs: ["generic@2"], typeDefinitions: {},
    entities: Object.fromEntries(components.map((id) => [entityRef(id), {
      id: entityRef(id), profile: "generic@2", type: "node", attributes: { name: text(id) },
    }])),
    relations: Object.fromEntries(interactions.map(([step, branch, source, target, task], i) => {
      const id = relationRef(String(i));
      return [id, { id, profile: "generic@2", type: "flow-step",
        endpoints: [{ role: "source", target: entityRef(source) }, { role: "target", target: entityRef(target) }],
        attributes: { step: quantity(step, "unit"), ...(branch ? { branch: text(branch) } : {}), realises: text(`bpmn:login#${task}`) },
      }];
    })), ports: {}, resources: {}, extensions: [],
  };
  const document = withFlowTypes(base).document;
  const presentation = {
    contractPin: { ...DIAGRAM_PRESENTATION_CONTRACT_PIN },
    entities: Object.fromEntries(components.map((id) => [occurrenceRef(`e.${id}`), { form: "card" as const, text: { title: id } }])),
    legends: {}, categoryTokens: [],
  };
</script>

<DiagramSceneFigure {document} {presentation} registry={m3ProfileRegistry}
  bindings={shippedExecutorBindings} title="Login" flows={{ fanOutMax: 4 }} />
