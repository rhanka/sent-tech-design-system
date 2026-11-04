/**
 * Catalogue parsing (spec section 6.2): `apps/docs/src/lib`
 * `components-catalog.ts` is the single editorial source (D4.2).
 *
 * Parsed with the TypeScript compiler API; regex scraping is forbidden, so
 * a parse-shape change fails loudly instead of silently drifting.
 */
import { readFileSync } from "node:fs";
import * as ts from "typescript";

export const DATAVIZ_MARKER = " (dataviz)";

export interface CatalogueRow {
  name: string;
  slug: string;
  status: string;
  category: string;
  groupSlug?: string;
  description: { fr: string; en: string };
}

const CATEGORIES = new Set([
  "action",
  "form",
  "chat",
  "navigation",
  "overlay",
  "feedback",
  "data",
  "layout",
  "other",
]);

const STATUSES = new Set(["documented", "stub"]);

/**
 * Barrel lookup identifier: the catalogue name minus ONE trailing
 * ` (dataviz)` marker. `displayName` keeps the marker verbatim; a second
 * marker means a double strip and is a generator bug (throws).
 */
export function stripDatavizMarker(name: string): string {
  if (!name.endsWith(DATAVIZ_MARKER)) return name;
  const once = name.slice(0, -DATAVIZ_MARKER.length);
  if (once.endsWith(DATAVIZ_MARKER)) {
    throw new Error(`stripDatavizMarker: double marker in "${name}"`);
  }
  if (once.length === 0) throw new Error(`stripDatavizMarker: empty identifier in "${name}"`);
  return once;
}

function stringProperty(
  node: ts.ObjectLiteralExpression,
  key: string,
  fileName: string,
  index: number,
): string | undefined {
  for (const prop of node.properties) {
    if (!ts.isPropertyAssignment(prop)) continue;
    const name = prop.name;
    const text = ts.isIdentifier(name) || ts.isStringLiteral(name) ? name.text : undefined;
    if (text !== key) continue;
    if (!ts.isStringLiteral(prop.initializer) && !ts.isNoSubstitutionTemplateLiteral(prop.initializer)) {
      throw new Error(`${fileName}: COMPONENTS[${index}].${key} is not a string literal`);
    }
    return prop.initializer.text;
  }
  return undefined;
}

function descriptionProperty(
  node: ts.ObjectLiteralExpression,
  fileName: string,
  index: number,
): { fr: string; en: string } {
  const holder = node.properties.find(
    (prop): prop is ts.PropertyAssignment =>
      ts.isPropertyAssignment(prop) &&
      ((ts.isIdentifier(prop.name) || ts.isStringLiteral(prop.name)) && prop.name.text === "description"),
  );
  if (holder === undefined || !ts.isObjectLiteralExpression(holder.initializer)) {
    throw new Error(`${fileName}: COMPONENTS[${index}] has no description object literal`);
  }
  const fr = stringProperty(holder.initializer, "fr", fileName, index);
  const en = stringProperty(holder.initializer, "en", fileName, index);
  if (fr === undefined || fr.length === 0 || en === undefined || en.length === 0) {
    throw new Error(`${fileName}: COMPONENTS[${index}] needs non-empty fr and en descriptions`);
  }
  if (fr.length > 280 || en.length > 280) {
    throw new Error(`${fileName}: COMPONENTS[${index}] description exceeds 280 chars (frozen Q6)`);
  }
  return { fr, en };
}

/** Parse catalogue rows from source text (fileName labels errors). */
export function parseCatalogueText(sourceText: string, fileName: string): CatalogueRow[] {
  const source = ts.createSourceFile(fileName, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  let elements: readonly ts.Expression[] | undefined;
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || declaration.name.text !== "COMPONENTS") continue;
      if (declaration.initializer === undefined || !ts.isArrayLiteralExpression(declaration.initializer)) {
        throw new Error(`${fileName}: COMPONENTS is not an array literal`);
      }
      elements = declaration.initializer.elements;
    }
  }
  if (elements === undefined) {
    throw new Error(`${fileName}: no COMPONENTS array literal found`);
  }
  const seen = new Set<string>();
  return elements.map((element, index) => {
    if (!ts.isObjectLiteralExpression(element)) {
      throw new Error(`${fileName}: COMPONENTS[${index}] is not an object literal`);
    }
    const name = stringProperty(element, "name", fileName, index);
    const slug = stringProperty(element, "slug", fileName, index);
    const status = stringProperty(element, "status", fileName, index);
    const category = stringProperty(element, "category", fileName, index);
    if (name === undefined || slug === undefined || status === undefined || category === undefined) {
      throw new Error(`${fileName}: COMPONENTS[${index}] misses name/slug/status/category`);
    }
    if (!STATUSES.has(status)) throw new Error(`${fileName}: COMPONENTS[${index}] status "${status}" unknown`);
    if (!CATEGORIES.has(category)) {
      throw new Error(`${fileName}: COMPONENTS[${index}] category "${category}" unknown`);
    }
    if (seen.has(slug)) throw new Error(`${fileName}: duplicate slug "${slug}"`);
    seen.add(slug);
    const row: CatalogueRow = {
      name,
      slug,
      status,
      category,
      description: descriptionProperty(element, fileName, index),
    };
    const groupSlug = stringProperty(element, "groupSlug", fileName, index);
    if (groupSlug !== undefined) row.groupSlug = groupSlug;
    return row;
  });
}

/** Parse catalogue rows from the committed catalogue file. */
export function parseCatalogueFile(cataloguePath: string): CatalogueRow[] {
  return parseCatalogueText(readFileSync(cataloguePath, "utf8"), cataloguePath);
}
