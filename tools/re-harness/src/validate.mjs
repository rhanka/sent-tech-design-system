// Minimal JSON-Schema subset validator (type incl. union arrays and null, required, enum, const, items,
// properties, additionalProperties:false, minLength, minimum). Zero dependencies:
// the harness must run offline against the repository lockfile only.
export function validateAgainstSchema(value, schema, path = "$") {
  const errors = [];
  if (!schema || typeof schema !== "object") return errors;
  if (schema.const !== undefined && value !== schema.const) {
    errors.push(`${path}: expected const ${JSON.stringify(schema.const)}, got ${JSON.stringify(value)}`);
  }
  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`${path}: ${JSON.stringify(value)} not in enum ${JSON.stringify(schema.enum)}`);
  }
  const types = schema.type === undefined ? [] : Array.isArray(schema.type) ? schema.type : [schema.type];
  if (types.length) {
    const ok = types.some((type) =>
      type === "null" ? value === null
      : type === "object" ? value !== null && typeof value === "object" && !Array.isArray(value)
      : type === "array" ? Array.isArray(value)
      : type === "string" ? typeof value === "string"
      : type === "number" ? typeof value === "number" && Number.isFinite(value)
      : type === "integer" ? Number.isInteger(value)
      : type === "boolean" ? typeof value === "boolean"
      : false);
    if (!ok) { errors.push(`${path}: expected type ${types.join("|")}`); return errors; }
  }
  if (typeof value === "string" && schema.minLength && value.length < schema.minLength) {
    errors.push(`${path}: shorter than minLength ${schema.minLength}`);
  }
  if (typeof value === "number" && schema.minimum !== undefined && value < schema.minimum) {
    errors.push(`${path}: below minimum ${schema.minimum}`);
  }
  if (Array.isArray(value)) {
    if (schema.minItems && value.length < schema.minItems) errors.push(`${path}: fewer than minItems ${schema.minItems}`);
    if (schema.items) value.forEach((item, i) => errors.push(...validateAgainstSchema(item, schema.items, `${path}[${i}]`)));
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const key of schema.required || []) {
      if (!(key in value)) errors.push(`${path}.${key}: missing required property`);
    }
    const props = schema.properties || {};
    for (const [key, sub] of Object.entries(props)) {
      if (key in value) errors.push(...validateAgainstSchema(value[key], sub, `${path}.${key}`));
    }
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!(key in props) && !(schema.required || []).includes(key)) errors.push(`${path}.${key}: additional property not allowed`);
      }
    } else if (schema.additionalProperties && typeof schema.additionalProperties === "object") {
      for (const [key, val] of Object.entries(value)) {
        if (!(key in props)) errors.push(...validateAgainstSchema(val, schema.additionalProperties, `${path}.${key}`));
      }
    }
  }
  return errors;
}
