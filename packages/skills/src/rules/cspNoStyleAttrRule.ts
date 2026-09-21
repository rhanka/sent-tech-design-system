import type { Finding, Rule, RuleContext } from "../types.js";
import { getNodePath } from "./utils.js";

const SVG_NS = "http://www.w3.org/2000/svg";
const DIRECTIVE = "style-src-attr 'none'";
const MAX_VALUE_LENGTH = 120;

const REPLACEMENT =
  "Retirer l'attribut du balisage rendu. Porter la valeur par une classe (la variable CSS définie dans une feuille de style), " +
  "ou par le CSSOM après montage (`el.style.setProperty('--x', valeur)`), que la CSP n'interdit pas. " +
  "Une variable posée sur un ancêtre ne convient que si elle ne passe pas elle-même par un attribut style : " +
  "en rendu serveur, la directive Svelte `style:--x` en émet un.";

interface StyledElement {
  element: Element;
  location: string;
  inTemplate: boolean;
}

type ParseHtml = (html: string) => Document;

/**
 * Analyse un `srcdoc` comme le navigateur : un document complet, qui hérite de
 * la CSP du parent. DOMParser de la fenêtre auditée quand elle existe ; sinon
 * un document vierge rempli par `innerHTML`.
 */
function htmlParserFor(document: Document): ParseHtml {
  const DomParser = document.defaultView?.DOMParser;
  if (DomParser) {
    const parser = new DomParser();
    return (html) => parser.parseFromString(html, "text/html");
  }
  return (html) => {
    const doc = document.implementation.createHTMLDocument("");
    doc.documentElement.innerHTML = html;
    return doc;
  };
}

/**
 * Collecte les éléments porteurs d'un attribut style :
 * - dans le contenu des <template>, analysé avec le document : le navigateur y
 *   signale la violation dès l'analyse, même si le gabarit n'est jamais instancié ;
 * - dans le document `srcdoc` des <iframe>, récursivement.
 */
function collectStyledElements(
  root: ParentNode,
  prefix: string,
  inTemplate: boolean,
  parseHtml: ParseHtml,
  acc: StyledElement[]
): StyledElement[] {
  for (const element of Array.from(root.querySelectorAll("[style]"))) {
    acc.push({ element, location: `${prefix}${getNodePath(element)}`, inTemplate });
  }
  for (const template of Array.from(root.querySelectorAll("template"))) {
    const content = (template as HTMLTemplateElement).content;
    if (content) collectStyledElements(content, `${prefix}${getNodePath(template)} > #content > `, true, parseHtml, acc);
  }
  for (const iframe of Array.from(root.querySelectorAll("iframe[srcdoc]"))) {
    const srcdoc = parseHtml(iframe.getAttribute("srcdoc") ?? "");
    collectStyledElements(srcdoc, `${prefix}${getNodePath(iframe)} > #srcdoc > `, false, parseHtml, acc);
  }
  return acc;
}

function quoteValue(value: string): string {
  const compact = value.replace(/\s+/g, " ").trim();
  return compact.length > MAX_VALUE_LENGTH ? `${compact.slice(0, MAX_VALUE_LENGTH)}…` : compact;
}

export const cspNoStyleAttrRule: Rule = {
  id: "csp-no-style-attr",
  description:
    "Signale tout attribut style littéral du balisage rendu : sous CSP stricte (style-src-attr 'none'), le navigateur le bloque et signale une violation.",
  principle: "design harden --csp",
  wp7Finding:
    "Règle de conception « porter un jeton jusqu'à un composant » sous style-src-attr 'none' (texte repris dans packages/skills/README.md)",
  severity: "high",
  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    const parseHtml = htmlParserFor(context.document);

    for (const { element, location, inTemplate } of collectStyledElements(context.document, "", false, parseHtml, [])) {
      const tag = element.tagName.toLowerCase();
      const where = `<${tag}>${element.namespaceURI === SVG_NS ? " (SVG)" : ""}${inTemplate ? " dans le contenu d'un <template>" : ""}`;
      const value = element.getAttribute("style") ?? "";

      if (value.trim() === "") {
        findings.push({
          ruleId: this.id,
          severity: "low",
          message:
            `Attribut style vide sur ${where} : aucune déclaration perdue, mais sous CSP ${DIRECTIVE} ` +
            "le navigateur signale quand même une violation.",
          location,
          suggestion: "Ne pas émettre l'attribut style quand il n'a pas de valeur."
        });
        continue;
      }

      const effect = inTemplate
        ? "le navigateur signale une violation dès l'analyse du balisage, même si le gabarit n'est jamais instancié. " +
          "Le style s'applique ensuite sur une copie obtenue par cloneNode ou importNode, et reste bloqué si le contenu est réinjecté par innerHTML."
        : "le navigateur le bloque, la déclaration n'est pas appliquée et une violation est signalée.";

      findings.push({
        ruleId: this.id,
        severity: this.severity,
        message: `Attribut style littéral sur ${where} (style="${quoteValue(value)}") : sous CSP ${DIRECTIVE}, ${effect}`,
        location,
        suggestion: REPLACEMENT
      });
    }

    return findings;
  }
};
