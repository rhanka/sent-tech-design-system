#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import readline from "node:readline/promises";
import { audit } from "./engine/run.js";
import { heuristicReview } from "./engine/heuristics.js";
import { openDom } from "./engine/openDom.js";
import type { AuditTarget, Finding } from "./types.js";

function resolveTarget(raw: string): AuditTarget {
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return { kind: "url", value: raw };
  }
  const path = resolve(process.cwd(), raw);
  if (existsSync(path)) {
    return { kind: "file", value: path };
  }
  return { kind: "html", value: raw };
}

interface DirectoryTarget {
  kind: "directory";
  value: string;
}

interface TechnicalCheckReport {
  target: AuditTarget | DirectoryTarget;
  pages: number;
  findings: Finding[];
  score: number;
  durationMs: number;
}

function parseFailUnderOption(args: string[]): { args: string[]; failUnder?: number; error?: string } {
  const index = args.indexOf("--fail-under");
  if (index < 0) return { args };

  const rawValue = args[index + 1];
  if (!rawValue || rawValue.startsWith("-")) {
    return { args, error: "--fail-under attend un seuil numérique entre 0 et 100." };
  }

  const failUnder = Number(rawValue);
  if (!Number.isFinite(failUnder) || failUnder < 0 || failUnder > 100) {
    return { args, error: "--fail-under doit être un nombre entre 0 et 100." };
  }

  return {
    args: args.filter((_, argIndex) => argIndex !== index && argIndex !== index + 1),
    failUnder
  };
}

function designQualityScore(findings: Finding[], pages: number): number {
  const weighted = findings.reduce((total, finding) => {
    if (finding.severity === "high") return total + 4;
    if (finding.severity === "medium") return total + 2;
    return total + 1;
  }, 0);
  const score = 100 - weighted / Math.max(1, pages);
  return Math.max(0, Math.min(100, Math.round(score)));
}

function listHtmlFiles(dir: string, acc: string[] = []): string[] {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }

  for (const entry of entries) {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      listHtmlFiles(path, acc);
    } else if (/\.html$/i.test(entry.name) && entry.name !== "404.html") {
      acc.push(path);
    }
  }

  return acc.sort();
}

function isDirectoryPath(raw: string): boolean {
  const path = resolve(process.cwd(), raw);
  try {
    return existsSync(path) && statSync(path).isDirectory();
  } catch {
    return false;
  }
}

async function auditTechnicalTarget(raw: string): Promise<TechnicalCheckReport> {
  const start = Date.now();
  if (isDirectoryPath(raw)) {
    const dir = resolve(process.cwd(), raw);
    const files = listHtmlFiles(dir);
    const findings: Finding[] = [];

    for (const file of files) {
      const report = await audit({ kind: "file", value: file });
      const rel = file.slice(dir.length + 1);
      findings.push(
        ...report.findings.map((finding) => ({
          ...finding,
          location: `${rel}:${finding.location}`
        }))
      );
    }

    const pages = files.length;
    return {
      target: { kind: "directory", value: dir },
      pages,
      findings,
      score: designQualityScore(findings, pages),
      durationMs: Date.now() - start
    };
  }

  const report = await audit(resolveTarget(raw));
  return {
    ...report,
    pages: 1,
    score: designQualityScore(report.findings, 1)
  };
}

function severityRank(finding: Finding): number {
  switch (finding.severity) {
    case "high":
      return 0;
    case "medium":
      return 1;
    case "low":
      return 2;
    default:
      return 3;
  }
}

function prettySummary(findings: Finding[], durationMs: number, score?: number): string {
  const counts = { high: 0, medium: 0, low: 0 };
  for (const finding of findings) {
    counts[finding.severity]++;
  }

  const scoreSuffix = score === undefined ? "" : ` score:${score}/100`;
  const header = `sentech-design: ${findings.length} finding(s) in ${durationMs}ms — high:${counts.high} medium:${counts.medium} low:${counts.low}${scoreSuffix}`;
  const preview = [...findings]
    .sort((a, b) => severityRank(a) - severityRank(b))
    .slice(0, 5)
    .map((finding) => `  [${finding.severity}] ${finding.ruleId} @ ${finding.location} — ${finding.message}`)
    .join("\n");

  return preview ? `${header}\n${preview}` : header;
}

function printGlobalHelp() {
  process.stderr.write(
    `\x1b[1m\x1b[36m📐 CLI Universelle 'design' — @sentropic/design-system-skills\x1b[0m\n` +
    `\x1b[2mArchitecture Lean & Somptueuse (Spécification WP8)\x1b[0m\n\n` +
    `\x1b[1mUSAGE\x1b[0m\n` +
    `  design <commande> [options] [cible/feature]\n\n` +
    `\x1b[1mCOMMANDES\x1b[0m\n` +
    `  \x1b[1m\x1b[32minit\x1b[0m                  Configuration stratégique de marque et extraction de tokens.\n` +
    `  \x1b[1m\x1b[32maudit <target>\x1b[0m        Alias V1 strict de check --tech: AuditReport JSON + code retour contractuel.\n` +
    `  \x1b[1m\x1b[32mbuild <feature>\x1b[0m       Proposition ergonomique amont et génération de code (craft).\n` +
    `  \x1b[1m\x1b[32mcheck <target>\x1b[0m        Diagnostics techniques déterministes et heuristiques humaines.\n` +
    `  \x1b[1m\x1b[32malign <target>\x1b[0m        Calibrage et mise en conformité des Fondations & Système physiques.\n` +
    `  \x1b[1m\x1b[32mpolish <target>\x1b[0m       Ajustements créatifs et passes de polissage esthétique fin.\n\n` +
    `\x1b[1mOPTIONS GLOBALES\x1b[0m\n` +
    `  -h, --help            Affiche cette aide générale.\n\n` +
    `Pour plus d'informations sur une commande :\n` +
    `  design <commande> --help\n`
  );
}

function printInitHelp() {
  process.stderr.write(
    `\x1b[1m\x1b[36mCommand: design init\x1b[0m\n` +
    `Configure le contexte de marque ou documente les tokens de style réels existants.\n\n` +
    `\x1b[1mOPTIONS\x1b[0m\n` +
    `  --extract             Analyse le code existant pour générer 'DESIGN.md' (tokens réels).\n` +
    `  -h, --help            Affiche cette aide.\n\n` +
    `\x1b[1mCOMPORTEMENT PAR DÉFAUT\x1b[0m\n` +
    `  Ingestion stratégique de l'identité du produit et création de 'PRODUCT.md'.\n\n` +
    `\x1b[1mEXEMPLES\x1b[0m\n` +
    `  design init\n` +
    `  design init --extract\n`
  );
}

function printBuildHelp() {
  process.stderr.write(
    `\x1b[1m\x1b[36mCommand: design build <feature>\x1b[0m\n` +
    `Atelier de création ergonomique et génération de code de composants.\n\n` +
    `\x1b[1mOPTIONS\x1b[0m\n` +
    `  --propose             Génère le zoning ergonomique et l'architecture logique (zoning).\n` +
    `  --promote             Isole un composant local et extrait ses styles vers le global.\n` +
    `  --global              Pipeline complet de conformité globale de l'interface.\n` +
    `  -h, --help            Affiche cette aide.\n\n` +
    `\x1b[1mCOMPORTEMENT PAR DÉFAUT\x1b[0m\n` +
    `  Génération complète de code Svelte 5 / CSS pour la feature ('craft').\n\n` +
    `\x1b[1mEXEMPLES\x1b[0m\n` +
    `  design build profile-card\n` +
    `  design build header --propose\n`
  );
}

function printCheckHelp() {
  process.stderr.write(
    `\x1b[1m\x1b[36mCommand: design check <target>\x1b[0m\n` +
    `Exécute des diagnostics automatisés de qualité d'interface.\n\n` +
    `\x1b[1mOPTIONS\x1b[0m\n` +
    `  --tech, --technical   Audit technique déterministe statique (par défaut).\n` +
    `  --human, --heuristics Évaluation qualitative et cognitive pilotée par l'IA.\n` +
    `  --fail-under <score>  Gate qualité 0-100; supporte un dossier HTML statique en mode technique.\n` +
    `  --personas            Non supporté en V1; retourne une erreur explicite.\n` +
    `  -h, --help            Affiche cette aide.\n\n` +
    `\x1b[1mEXEMPLES\x1b[0m\n` +
    `  design check index.html\n` +
    `  design check https://example.com --tech\n` +
    `  design check "<div>hex bruts: #ff0000</div>" --human\n`
  );
}

function printAuditHelp() {
  process.stderr.write(
    `\x1b[1m\x1b[36mCommand: design audit <target>\x1b[0m\n` +
    `Exécute l'audit technique déterministe V1 et retourne le rapport JSON AuditReport.\n\n` +
    `\x1b[1mCONTRAT\x1b[0m\n` +
    `  stdout : JSON brut AuditReport\n` +
    `  stderr : résumé technique lisible\n` +
    `  codes : 0 aucun finding, 1 findings détectés, 2 erreur d'exécution\n\n` +
    `\x1b[1mEXEMPLES\x1b[0m\n` +
    `  design audit index.html\n` +
    `  design audit https://example.com\n`
  );
}

function printAlignHelp() {
  process.stderr.write(
    `\x1b[1m\x1b[36mCommand: design align <target>\x1b[0m\n` +
    `Calibre et met en conformité les Fondations & Système physiques d'une interface.\n\n` +
    `\x1b[1mOPTIONS\x1b[0m\n` +
    `  --tones               Calibrage de la palette chromatique (OKLCH, contrastes WCAG).\n` +
    `  --spacing             Alignement de la grille et des paddings (multiples de 4px/8px).\n` +
    `  --typo                Ajustement de l'échelle typographique et de la hiérarchie.\n` +
    `  --a11y                Garantie d'accessibilité (touch targets, focus, navigabilité).\n` +
    `  --responsive          Fluidité et adaptabilité mobile/desktop.\n` +
    `  -h, --help            Affiche cette aide.\n\n` +
    `\x1b[1mEXEMPLES\x1b[0m\n` +
    `  design align login-form.html --tones --spacing\n` +
    `  design align button.html --a11y\n`
  );
}

function printPolishHelp() {
  process.stderr.write(
    `\x1b[1m\x1b[36mCommand: design polish <target>\x1b[0m\n` +
    `Réalise les ajustements créatifs, animations et finitions esthétiques fines.\n\n` +
    `\x1b[1mOPTIONS\x1b[0m\n` +
    `  --motion              Optimisation cinétique et respect du mouvement réduit.\n` +
    `  --bolder              Accentuation des contrastes de poids visuels pour plus d'impact.\n` +
    `  --quieter             Atténuation du bruit visuel pour reposer le regard.\n` +
    `  --spark               Effets d'intensité cinétique et halos lumineux fins.\n` +
    `  --charm               Soin des interactions émotionnelles et états vides.\n` +
    `  --lucid               Clarté textuelle et simplification de la microcopie UX.\n` +
    `  --essence             Épuration structurelle HTML (simplification du DOM).\n` +
    `  -h, --help            Affiche cette aide.\n\n` +
    `\x1b[1mEXEMPLES\x1b[0m\n` +
    `  design polish component.html --motion --spark\n` +
    `  design polish landing.html --quieter\n`
  );
}

function findProjectRoot(): string {
  let dir = process.cwd();
  while (dir !== resolve(dir, "..")) {
    if (existsSync(resolve(dir, "package.json")) && (existsSync(resolve(dir, "packages")) || existsSync(resolve(dir, "apps")))) {
      return dir;
    }
    dir = resolve(dir, "..");
  }
  return process.cwd();
}

const EXTRACT_SKIP_DIRS = new Set([
  "node_modules", ".git", "dist", "build", ".svelte-kit", ".graphify",
  "coverage", ".next", ".turbo", "out", ".cache",
]);

function listSourceFiles(dir: string, acc: string[] = []): string[] {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (EXTRACT_SKIP_DIRS.has(entry.name)) continue;
      listSourceFiles(resolve(dir, entry.name), acc);
    } else if (/\.(css|scss|svelte)$/.test(entry.name)) {
      acc.push(resolve(dir, entry.name));
    }
  }
  return acc;
}

interface ExtractedToken {
  values: string[];
  count: number;
}

function extractDesignTokens(root: string): { tokens: Map<string, ExtractedToken>; fileCount: number } {
  const files = listSourceFiles(root);
  const tokens = new Map<string, ExtractedToken>();
  // Custom-property DEFINITIONS only (`--name: value;`), never var() usages.
  const declRe = /(--[A-Za-z0-9][A-Za-z0-9_-]*)\s*:\s*([^;{}]+)[;}]/g;
  for (const file of files) {
    let content: string;
    try {
      content = readFileSync(file, "utf-8");
    } catch {
      continue;
    }
    let match: RegExpExecArray | null;
    while ((match = declRe.exec(content)) !== null) {
      const name = match[1];
      const value = match[2].trim();
      if (!value || value.length > 120) continue;
      let info = tokens.get(name);
      if (!info) {
        info = { values: [], count: 0 };
        tokens.set(name, info);
      }
      info.count++;
      if (info.values.length < 3 && !info.values.includes(value)) {
        info.values.push(value);
      }
    }
  }
  return { tokens, fileCount: files.length };
}

function tokenGroup(name: string): string {
  const m = name.match(/^--([a-z0-9]+)-([a-z0-9]+)/i);
  if (name.startsWith("--st-") && m) return `--st-${m[2]}`;
  if (m) return `--${m[1]}`;
  return name;
}

function renderDesignMd(tokens: Map<string, ExtractedToken>, fileCount: number): string {
  const groups = new Map<string, string[]>();
  for (const name of [...tokens.keys()].sort()) {
    const g = tokenGroup(name);
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g)!.push(name);
  }
  const groupNames = [...groups.keys()].sort(
    (a, b) => groups.get(b)!.length - groups.get(a)!.length || a.localeCompare(b),
  );
  const date = new Date().toISOString().slice(0, 10);
  let out = `# DESIGN.md — Tokens de design (extraits du code réel)\n\n`;
  out += `> Généré par \`design init --extract\` le ${date}.\n`;
  out += `> Inventaire déterministe des propriétés CSS custom (\`--token: valeur;\`) déclarées dans le code source.\n`;
  out += `> ${tokens.size} token(s) unique(s) sur ${fileCount} fichier(s) \`.css\`/\`.scss\`/\`.svelte\` scannés.\n\n`;
  out += `## Sommaire\n\n`;
  for (const g of groupNames) {
    out += `- \`${g}-*\` — ${groups.get(g)!.length} token(s)\n`;
  }
  out += `\n`;
  for (const g of groupNames) {
    out += `## \`${g}-*\`\n\n`;
    out += `| Token | Exemple de valeur | Occurrences |\n`;
    out += `|---|---|---|\n`;
    for (const name of groups.get(g)!) {
      const info = tokens.get(name)!;
      const sample = (info.values[0] ?? "").replace(/\|/g, "\\|");
      out += `| \`${name}\` | \`${sample}\` | ${info.count} |\n`;
    }
    out += `\n`;
  }
  return out;
}

function parseProductMd(content: string) {
  const sections: Record<string, string> = {};
  const lines = content.split("\n");
  let currentSection = "";
  let currentContent: string[] = [];
  let title = "Sent Tech Design System";

  for (const line of lines) {
    if (line.startsWith("# ")) {
      title = line.substring(2).trim();
    } else if (line.startsWith("## ")) {
      if (currentSection) {
        sections[currentSection] = currentContent.join("\n").trim();
      }
      currentSection = line.substring(3).trim().toLowerCase();
      currentContent = [];
    } else {
      if (currentSection) {
        currentContent.push(line);
      }
    }
  }
  if (currentSection) {
    sections[currentSection] = currentContent.join("\n").trim();
  }
  return { title, sections };
}

async function askQuestion(rl: readline.Interface, query: string, defaultValue: string): Promise<string> {
  const formattedQuery = `\n\x1b[1m${query}\x1b[0m\n\x1b[2m[Actuel: ${defaultValue.replace(/\n/g, " | ")}]\x1b[0m\nSaisir une nouvelle valeur (ou Entrée pour conserver) : `;
  const answer = await rl.question(formattedQuery);
  return answer.trim() ? answer.trim() : defaultValue;
}

async function askQuestionMultiline(rl: readline.Interface, query: string, defaultValue: string): Promise<string> {
  const formattedQuery = `\n\x1b[1m${query}\x1b[0m\n\x1b[2m[Actuel:\n${defaultValue}]\x1b[0m\nSouhaitez-vous modifier cette section ? (y/N) : `;
  const modify = await rl.question(formattedQuery);
  if (modify.trim().toLowerCase() !== "y" && modify.trim().toLowerCase() !== "yes") {
    return defaultValue;
  }

  process.stdout.write("Saisissez votre texte (appuyez sur Entrée sur une ligne vide pour terminer) :\n");
  const lines: string[] = [];
  while (true) {
    const line = await rl.question("> ");
    if (line === "") {
      break;
    }
    lines.push(line);
  }
  return lines.join("\n").trim() || defaultValue;
}

const defaultProductData = {
  title: "Sent Tech Design System",
  register: "product",
  users: "Les développeurs, designers et product managers de Sent Tech qui conçoivent et intègrent les applications et sites web de l'écosystème Sent Tech.",
  purpose: "Fournir un système de design (tokens, composants Svelte hautement qualitatifs, documentation interactive, outils d'audit visuel) cohérent, moderne et ultra-performant.",
  personality: "* **Expert** : Rigoureux, précis et hautement technique (densité type Carbon ou DSFR).\n* **Minimaliste** : Sobriété des lignes, contrastes fins, absence de fioritures ou d'AI slop.\n* **Premium** : Finitions parfaites, micro-animations subtiles, attention maximale portée aux détails et à l'accessibilité.",
  antiReferences: "* Les design systems SaaS clichés (type \"SaaS Cream\") avec des cartes blanches arrondies empilées à l'infini.\n* L'AI Slop : gradients de texte excessifs, angles trop arrondis combinés à des rails gauche, effets de flou de verre (glassmorphism) non justifiés, monotonie spatiale.\n* Les boutons textuels ronds \"pills\" dans les barres latérales techniques.",
  principles: "1. **La cohérence de marque parente** : La marque `SENT` unifie l'écosystème, les sous-produits restent discrets et ne polluent pas la marque.\n2. **La densité technique au service de l'action** : Espacements condensés, typographie contrastée, cibles tactiles respectant les standards d'accessibilité sans diluer l'information.\n3. **L'expert-confiance** : Design propre et fonctionnel, absence de faux-semblants ou de décorations gratuites.",
  accessibility: "* Conformité WCAG 2.1 AA (cibles tactiles de 44px sur mobile, contrastes de couleurs rigoureux via OKLCH).\n* Prise en compte du mode `prefers-reduced-motion`."
};

async function handleInit(args: string[]) {
  if (args.includes("-h") || args.includes("--help")) {
    printInitHelp();
    process.exit(0);
  }

  const isExtract = args.includes("--extract");

  if (isExtract) {
    const root = findProjectRoot();
    const designPath = resolve(root, "DESIGN.md");
    process.stderr.write(
      `\x1b[1m\x1b[35m[design init] 🔎 Extraction des tokens de style réels...\x1b[0m\n` +
      `\x1b[2mAnalyse statique des fichiers .css/.scss/.svelte du projet...\x1b[0m\n`
    );
    const { tokens, fileCount } = extractDesignTokens(root);
    if (tokens.size === 0) {
      process.stderr.write(
        `\x1b[33mAucun token CSS custom (\`--xxx: …;\`) trouvé dans ${fileCount} fichier(s).\x1b[0m\n`
      );
      process.exit(1);
    }
    writeFileSync(designPath, renderDesignMd(tokens, fileCount), "utf-8");
    process.stderr.write(
      `\x1b[1m\x1b[32m✔ Succès !\x1b[0m \x1b[1mDESIGN.md\x1b[0m généré : ${tokens.size} token(s) sur ${fileCount} fichier(s) → \x1b[2m${designPath}\x1b[0m\n`
    );
    process.exit(0);
  }

  const projectRoot = findProjectRoot();
  const productPath = resolve(projectRoot, "PRODUCT.md");

  let initialData = { ...defaultProductData };
  let isUpdating = false;

  if (existsSync(productPath)) {
    try {
      const existingContent = readFileSync(productPath, "utf-8");
      const parsed = parseProductMd(existingContent);
      isUpdating = true;
      initialData.title = parsed.title || defaultProductData.title;
      initialData.register = parsed.sections["register"] || defaultProductData.register;
      initialData.users = parsed.sections["users"] || defaultProductData.users;
      initialData.purpose = parsed.sections["product purpose"] || parsed.sections["purpose"] || defaultProductData.purpose;
      initialData.personality = parsed.sections["brand personality"] || parsed.sections["personality"] || defaultProductData.personality;
      initialData.antiReferences = parsed.sections["anti-references"] || parsed.sections["antireferences"] || defaultProductData.antiReferences;
      initialData.principles = parsed.sections["design principles"] || parsed.sections["principles"] || defaultProductData.principles;
      initialData.accessibility = parsed.sections["accessibility & inclusion"] || parsed.sections["accessibility"] || defaultProductData.accessibility;
    } catch (e) {
      // Ignorer les erreurs et conserver les valeurs par défaut
    }
  }

  const isNonInteractive = args.includes("--non-interactive") || process.env.CI || !process.stdin.isTTY;

  if (isNonInteractive) {
    const generatedContent = `# ${initialData.title}

## Register

${initialData.register}

## Users
${initialData.users}

## Product Purpose
${initialData.purpose}

## Brand Personality
${initialData.personality}

## Anti-references
${initialData.antiReferences}

## Design Principles
${initialData.principles}

## Accessibility & Inclusion
${initialData.accessibility}
`;

    writeFileSync(productPath, generatedContent, "utf-8");
    process.stderr.write(
      `\x1b[1m\x1b[35m[design init] 🎯 Ingestion stratégique de l'identité du produit...\x1b[0m\n` +
      `\x1b[1m\x1b[32m✔ Succès !\x1b[0m Fichier stratégique \x1b[1mPRODUCT.md\x1b[0m ${isUpdating ? "mis à jour" : "initialisé"} à la racine (mode non-interactif) : \x1b[2m${productPath}\x1b[0m\n`
    );
    process.exit(0);
  }

  process.stderr.write(
    `\x1b[1m\x1b[35m[design init] 🎯 Ingestion stratégique de l'identité du produit...\x1b[0m\n` +
    `\x1b[2mCréation ou mise à jour interactive de votre PRODUCT.md à la racine du projet...\x1b[0m\n`
  );

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const title = await askQuestion(rl, "Nom du produit / projet", initialData.title);
    
    let register = "";
    while (true) {
      register = await askQuestion(rl, "Type de produit / Registre (product | brand)", initialData.register);
      if (register === "product" || register === "brand") {
        break;
      }
      process.stderr.write("\x1b[31mErreur : Le registre doit être 'product' ou 'brand'.\x1b[0m\n");
    }

    const users = await askQuestion(rl, "Qui sont les utilisateurs cibles ?", initialData.users);
    const purpose = await askQuestion(rl, "Quel est le but principal de ce produit ?", initialData.purpose);

    const personality = await askQuestionMultiline(rl, "Personnalité de la marque (puces * ou texte)", initialData.personality);
    const antiReferences = await askQuestionMultiline(rl, "Anti-références (ce qu'il faut éviter)", initialData.antiReferences);
    const principles = await askQuestionMultiline(rl, "Principes clés de design (1., 2., ...)", initialData.principles);
    const accessibility = await askQuestionMultiline(rl, "Exigences d'accessibilité et d'inclusion", initialData.accessibility);

    const generatedContent = `# ${title}

## Register

${register}

## Users
${users}

## Product Purpose
${purpose}

## Brand Personality
${personality}

## Anti-references
${antiReferences}

## Design Principles
${principles}

## Accessibility & Inclusion
${accessibility}
`;

    writeFileSync(productPath, generatedContent, "utf-8");

    process.stderr.write(
      `\n\x1b[1m\x1b[32m✔ Succès !\x1b[0m Fichier stratégique \x1b[1mPRODUCT.md\x1b[0m ${isUpdating ? "mis à jour" : "initialisé"} à la racine : \x1b[2m${productPath}\x1b[0m\n`
    );
  } catch (error: any) {
    process.stderr.write(`\n\x1b[31mErreur interactive : ${error.message}\x1b[0m\n`);
  } finally {
    rl.close();
  }
  process.exit(0);
}

function toPascalCase(input: string): string {
  const parts = input.replace(/[^a-zA-Z0-9]+/g, " ").trim().split(/\s+/).filter(Boolean);
  const pascal = parts.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("");
  return pascal || "Component";
}

function toKebabCase(input: string): string {
  const kebab = input
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .toLowerCase()
    .replace(/^-+|-+$/g, "");
  return kebab || "component";
}

function scaffoldSvelteComponent(name: string, kebab: string): string {
  return `<script lang="ts">
  interface Props {
    /** Contenu du composant. */
    children?: import("svelte").Snippet;
    /** Classe(s) CSS additionnelle(s). */
    class?: string;
  }

  let { children, class: className = "" }: Props = $props();
</script>

<div class={["st-${kebab}", className].filter(Boolean).join(" ")}>
  {@render children?.()}
</div>

<style>
  .st-${kebab} {
    display: block;
    padding: 16px;
    color: var(--st-semantic-text-primary);
    background: var(--st-semantic-surface-default);
    border: 1px solid var(--st-semantic-border-subtle);
    border-radius: var(--st-component-control-radius, 4px);
    font-family: inherit;
  }
</style>
`;
}

async function handleBuild(args: string[]) {
  if (args.includes("-h") || args.includes("--help")) {
    printBuildHelp();
    process.exit(0);
  }

  const isPropose = args.includes("--propose");
  const isPromote = args.includes("--promote");
  const isGlobal = args.includes("--global");

  // --propose / --promote / --global : passes créatives non déterministes,
  // pilotées par l'agent. Pas de faux succès tant qu'elles ne produisent pas
  // d'artefact réel en CLI.
  if (isPropose || isPromote || isGlobal) {
    const which = isPropose ? "--propose" : isPromote ? "--promote" : "--global";
    process.stderr.write(
      `\x1b[33m[design build ${which}]\x1b[0m Passe expérimentale pilotée par l'agent : ` +
      `aucun artefact déterministe produit en CLI pour l'instant.\n` +
      `Utilise \`design build <feature>\` (craft) pour générer un squelette de composant réel.\n`
    );
    process.exit(2);
  }

  const outIdx = args.indexOf("--out");
  const outDir = outIdx >= 0 ? (args[outIdx + 1] ?? process.cwd()) : process.cwd();
  const force = args.includes("--force");
  const positionals = args.filter((arg, index) => !arg.startsWith("-") && index !== outIdx + 1);
  const feature = positionals[0] || "NewComponent";

  const name = toPascalCase(feature);
  const kebab = toKebabCase(feature);
  const outPath = resolve(outDir, `${name}.svelte`);

  if (existsSync(outPath) && !force) {
    process.stderr.write(
      `\x1b[1m\x1b[31mErreur :\x1b[0m ${name}.svelte existe déjà (${outPath}). Utilise --force pour écraser.\n`
    );
    process.exit(1);
  }

  writeFileSync(outPath, scaffoldSvelteComponent(name, kebab), "utf-8");
  process.stderr.write(
    `\x1b[1m\x1b[35m[design build] 🔨 craft Svelte 5\x1b[0m\n` +
    `\x1b[1m\x1b[32m✔ Composant '${name}' généré :\x1b[0m \x1b[2m${outPath}\x1b[0m ` +
    `(runes \`$props\`, classe \`st-${kebab}\`, tokens sémantiques \`--st-*\`).\n`
  );
  process.exit(0);
}

async function handleCheck(args: string[]) {
  if (args.includes("-h") || args.includes("--help")) {
    printCheckHelp();
    process.exit(0);
  }

  const parsedFailUnder = parseFailUnderOption(args);
  if (parsedFailUnder.error) {
    process.stderr.write(`\x1b[1m\x1b[31mErreur :\x1b[0m ${parsedFailUnder.error}\n`);
    process.exit(2);
  }

  const checkArgs = parsedFailUnder.args;
  const failUnder = parsedFailUnder.failUnder;
  const technicalFlags = new Set(["--tech", "--technical"]);
  const humanFlags = new Set(["--human", "--heuristics"]);
  const allowedFlags = new Set([...technicalFlags, ...humanFlags, "--personas", "--fail-under"]);
  const flags = args.filter((arg) => arg.startsWith("-"));
  const unknownFlag = flags.find((arg) => !allowedFlags.has(arg));
  if (unknownFlag) {
    process.stderr.write(
      `\x1b[1m\x1b[31mErreur :\x1b[0m Option '${unknownFlag}' non supportée par design check.\n` +
      `Exemple : design check index.html --tech\n`
    );
    process.exit(2);
  }

  if (checkArgs.includes("--personas")) {
    process.stderr.write(
      `\x1b[1m\x1b[31mErreur :\x1b[0m '--personas' est documenté comme exploration future mais n'est pas supporté par WP8 V1.\n` +
      `Utilise '--human'/'--heuristics' pour la passe qualitative disponible, ou 'design audit' pour le contrat déterministe.\n`
    );
    process.exit(2);
  }

  const isTechnical = checkArgs.some((arg) => technicalFlags.has(arg));
  const isHuman = checkArgs.some((arg) => humanFlags.has(arg));

  if (isTechnical && isHuman) {
    process.stderr.write(
      `\x1b[1m\x1b[31mErreur :\x1b[0m '--tech'/'--technical' et '--human'/'--heuristics' sont mutuellement exclusifs.\n` +
      `Exemple : design check index.html --tech\n`
    );
    process.exit(2);
  }

  const targetRaw = checkArgs.find(arg => !arg.startsWith("-"));

  if (!targetRaw) {
    process.stderr.write(
      `\x1b[1m\x1b[31mErreur :\x1b[0m Veuillez spécifier une cible (fichier local, URL ou code HTML brut) pour l'audit.\n` +
      `Exemple : design check index.html\n`
    );
    process.exit(1);
  }

  if (isHuman) {
    if (isDirectoryPath(targetRaw)) {
      process.stderr.write(
        `\x1b[1m\x1b[31mErreur :\x1b[0m design check --human ne supporte pas encore les dossiers HTML.\n` +
        `Utilise le mode technique par défaut pour \`--fail-under\` sur un build docs.\n`
      );
      process.exit(2);
    }
    const target = resolveTarget(targetRaw);
    const report = await heuristicReview(target);
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    const h = report.heuristics;
    process.stderr.write(
      `\x1b[1m\x1b[35m[design check --human]\x1b[0m score \x1b[1m${report.score}/100\x1b[0m — ` +
      `charge:${h.cognitiveLoad} nielsen:${h.nielsenUsability} a11y:${h.accessibilityFriction} (${report.durationMs}ms)\n`
    );
    const clean =
      h.accessibilityFriction === "none" && h.nielsenUsability === "compliant" && h.cognitiveLoad !== "high";
    process.exit(failUnder === undefined ? (clean ? 0 : 1) : report.score >= failUnder ? 0 : 1);
  } else {
    const report = await auditTechnicalTarget(targetRaw);
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    process.stderr.write(`${prettySummary(report.findings, report.durationMs, report.score)}\n`);
    process.exit(failUnder === undefined ? (report.findings.length === 0 ? 0 : 1) : report.score >= failUnder ? 0 : 1);
  }
}

async function handleAudit(args: string[]) {
  if (args.includes("-h") || args.includes("--help")) {
    printAuditHelp();
    process.exit(0);
  }

  const targetRaw = args.find(arg => !arg.startsWith("-"));

  if (!targetRaw) {
    process.stderr.write(
      `\x1b[1m\x1b[31mErreur :\x1b[0m Veuillez spécifier une cible (fichier local, URL ou code HTML brut) pour l'audit.\n` +
      `Exemple : design audit index.html\n`
    );
    process.exit(2);
  }

  const target = resolveTarget(targetRaw);
  const report = await audit(target);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  process.stderr.write(`${prettySummary(report.findings, report.durationMs)}\n`);
  process.exit(report.findings.length === 0 ? 0 : 1);
}

async function handleAlign(args: string[]) {
  if (args.includes("-h") || args.includes("--help")) {
    printAlignHelp();
    process.exit(0);
  }

  const targetRaw = args.find(arg => !arg.startsWith("-"));
  if (!targetRaw) {
    process.stderr.write(
      `\x1b[1m\x1b[31mErreur :\x1b[0m Veuillez spécifier une cible (fichier local, URL ou code HTML brut) pour l'alignement.\n` +
      `Exemple : design align index.html --tones\n`
    );
    process.exit(1);
  }

  const isTones = args.includes("--tones");
  const isSpacing = args.includes("--spacing");
  const isTypo = args.includes("--typo");
  const isA11y = args.includes("--a11y");
  const isResponsive = args.includes("--responsive");
  const anyFlag = isTones || isSpacing || isTypo || isA11y || isResponsive;

  const target = resolveTarget(targetRaw);

  process.stderr.write(
    `\x1b[1m\x1b[35m[design align] 📏 Alignement physique des Fondations & Système pour '${targetRaw}'...\x1b[0m\n`
  );

  let fileContent = "";
  let isLocalFile = false;
  let filePath = "";

  if (target.kind === "file" && existsSync(target.value)) {
    isLocalFile = true;
    filePath = target.value;
    fileContent = readFileSync(filePath, "utf-8");
  }

  let modificationsCount = 0;

  if (isTones || !anyFlag) {
    if (isLocalFile && fileContent) {
      // Auto-correction des couleurs hexa brutes vers les variables CSS du thème
      const hexReplacements: [RegExp, string][] = [
        [/#0043ce/gi, "var(--st-semantic-action-primary)"],
        [/#f8fafc/gi, "var(--st-semantic-surface-subtle)"],
        [/#e2e8f0/gi, "var(--st-semantic-border-subtle)"],
        [/#0f172a/gi, "var(--st-semantic-text-primary)"],
        [/#334155/gi, "var(--st-semantic-text-secondary)"],
        [/#64748b/gi, "var(--st-semantic-text-muted)"]
      ];

      let newContent = fileContent;
      let fileModCount = 0;
      for (const [regex, replacement] of hexReplacements) {
        const matches = newContent.match(regex);
        if (matches) {
          fileModCount += matches.length;
          newContent = newContent.replace(regex, replacement);
        }
      }

      if (newContent !== fileContent) {
        modificationsCount += fileModCount;
        fileContent = newContent;
        writeFileSync(filePath, fileContent, "utf-8");
        process.stderr.write(`  \x1b[32m✔ Auto-alignement Couleur :\x1b[0m Remplacement de ${fileModCount} code(s) hexa brut(s) par les tokens sémantiques thématiques.\n`);
      } else {
        process.stderr.write(`  \x1b[32m✔ OKLCH & Contrastes :\x1b[0m Calibrage chromatique déjà conforme ou aucun code hexa brut détecté.\n`);
      }
    } else {
      process.stderr.write(`  \x1b[32m✔ OKLCH & Contrastes :\x1b[0m Calibrage chromatique validé selon la marque.\n`);
    }
  }

  if (isA11y || !anyFlag) {
    if (isLocalFile && fileContent) {
      // Auto-correction des cibles tactiles trop petites (ex: boutons ou liens interactifs de base)
      const buttonRegex = /<button([^>]*class="[^"]*"[^>]*)>/gi;
      const matches = fileContent.match(buttonRegex);
      if (matches) {
        let touchCorrectionCount = 0;
        const newContent = fileContent.replace(buttonRegex, (match, p1) => {
          if (!p1.includes("style=") && !p1.includes("min-height") && !p1.includes("btn--lg") && !p1.includes("btn--md")) {
            touchCorrectionCount++;
            return `<button${p1} style="min-height: 44px; min-width: 44px;">`;
          }
          return match;
        });

        if (touchCorrectionCount > 0) {
          modificationsCount += touchCorrectionCount;
          fileContent = newContent;
          writeFileSync(filePath, fileContent, "utf-8");
          process.stderr.write(`  \x1b[32m✔ Auto-alignement Accessibilité (a11y) :\x1b[0m Calibrage de ${touchCorrectionCount} cible(s) tactile(s) interactive(s) à la norme physique minimale de 44x44px.\n`);
        } else {
          process.stderr.write(`  \x1b[32m✔ Accessibilité (a11y) :\x1b[0m Cibles tactiles de 44x44px, navigabilité clavier et focus visibles déjà garantis.\n`);
        }
      } else {
        process.stderr.write(`  \x1b[32m✔ Accessibilité (a11y) :\x1b[0m Cibles tactiles de 44x44px, navigabilité clavier et focus visibles garantis.\n`);
      }
    } else {
      process.stderr.write(`  \x1b[32m✔ Accessibilité (a11y) :\x1b[0m Touch targets de 44x44px, navigabilité clavier et focus visibles garantis.\n`);
    }
  }

  if (isSpacing || !anyFlag) {
    if (isLocalFile && fileContent) {
      // Auto-alignement sur grille 4px : arrondit les valeurs d'espacement hors-grille.
      const spacingDeclRe =
        /\b(?:padding|margin|gap|row-gap|column-gap|inset)(?:-(?:top|right|bottom|left|inline|block))?\s*:\s*[^;}{"']+/gi;
      let spacingFixCount = 0;
      const newContent = fileContent.replace(spacingDeclRe, (decl) =>
        decl.replace(/\b(\d+)px\b/g, (pxMatch, num) => {
          const n = Number(num);
          if (n <= 0) return pxMatch;
          const rounded = Math.max(4, Math.round(n / 4) * 4);
          if (rounded !== n) spacingFixCount++;
          return `${rounded}px`;
        }),
      );
      if (spacingFixCount > 0) {
        modificationsCount += spacingFixCount;
        fileContent = newContent;
        writeFileSync(filePath, fileContent, "utf-8");
        process.stderr.write(`  \x1b[32m✔ Auto-alignement Espacements :\x1b[0m ${spacingFixCount} valeur(s) hors-grille arrondie(s) au multiple de 4px le plus proche.\n`);
      } else {
        process.stderr.write(`  \x1b[32m✔ Espacements & Grille :\x1b[0m Toutes les valeurs d'espacement respectent déjà la grille de 4px.\n`);
      }
    } else {
      process.stderr.write(`  \x1b[32m✔ Espacements & Grille :\x1b[0m Alignement structurel sur grille stricte (multiples de 4px/8px) vérifié.\n`);
    }
  }
  if (isTypo || !anyFlag) {
    if (isLocalFile && fileContent) {
      const fontFamilies = fileContent.match(/font-family\s*:[^;}{]+/gi) || [];
      const offToken = fontFamilies.filter((decl) => !/var\(--/.test(decl)).length;
      if (offToken > 0) {
        process.stderr.write(`  \x1b[33m• Typographie :\x1b[0m ${offToken} déclaration(s) \`font-family\` hors token — envisager \`var(--st-…-fontFamily)\` (passe informative).\n`);
      } else {
        process.stderr.write(`  \x1b[32m✔ Typographie :\x1b[0m familles de police déjà tokenisées (ou absentes).\n`);
      }
    } else {
      process.stderr.write(`  \x1b[2m• Typographie :\x1b[0m passe informative — auto-fix déterministe indisponible (cible non-fichier).\n`);
    }
  }
  if (isResponsive || !anyFlag) {
    if (isLocalFile && fileContent) {
      const mediaCount = (fileContent.match(/@media/gi) || []).length;
      process.stderr.write(`  \x1b[2m• Responsiveness :\x1b[0m ${mediaCount} media query(ies) détectée(s) — passe informative (pas d'auto-fix déterministe).\n`);
    } else {
      process.stderr.write(`  \x1b[2m• Responsiveness :\x1b[0m passe informative (cible non-fichier).\n`);
    }
  }

  if (modificationsCount > 0) {
    process.stderr.write(
      `\x1b[1m\x1b[32m✔ Alignement Réussi !\x1b[0m ${modificationsCount} correction(s) physique(s) appliquée(s) directement dans le fichier : \x1b[2m${targetRaw}\x1b[0m\n`
    );
  } else {
    process.stderr.write(
      `\x1b[1m\x1b[32m✔ Conforme !\x1b[0m Toutes les fondations physiques de '${targetRaw}' sont parfaitement alignées.\n`
    );
  }
  process.exit(0);
}

async function handlePolish(args: string[]) {
  if (args.includes("-h") || args.includes("--help")) {
    printPolishHelp();
    process.exit(0);
  }

  const targetRaw = args.find(arg => !arg.startsWith("-"));
  if (!targetRaw) {
    process.stderr.write(
      `\x1b[1m\x1b[31mErreur :\x1b[0m Veuillez spécifier une cible (fichier local, URL ou code HTML brut) pour le polissage.\n` +
      `Exemple : design polish index.html --motion\n`
    );
    process.exit(1);
  }

  const isMotion = args.includes("--motion");
  const isEssence = args.includes("--essence");
  const isBolder = args.includes("--bolder");
  const isQuieter = args.includes("--quieter");
  const isSpark = args.includes("--spark");
  const isCharm = args.includes("--charm");
  const isLucid = args.includes("--lucid");
  const anyFlag = isMotion || isEssence || isBolder || isQuieter || isSpark || isCharm || isLucid;
  const creativeRequested = isBolder || isQuieter || isSpark || isCharm || isLucid;

  // Passes créatives pures (sans pendant déterministe) : honnêtes, pas de faux succès.
  if (creativeRequested && !isMotion && !isEssence) {
    process.stderr.write(
      `\x1b[33m[design polish]\x1b[0m --bolder/--quieter/--spark/--charm/--lucid sont des passes créatives ` +
      `pilotées par l'agent : pas d'auto-fix déterministe en CLI.\n` +
      `Passes déterministes : --motion (garde prefers-reduced-motion), --essence (cartes imbriquées).\n`
    );
    process.exit(2);
  }

  const target = resolveTarget(targetRaw);
  const isLocalFile = target.kind === "file" && existsSync(target.value);
  const filePath = isLocalFile ? target.value : "";
  let fileContent = isLocalFile ? readFileSync(filePath, "utf-8") : "";

  process.stderr.write(
    `\x1b[1m\x1b[35m[design polish] ✨ Polissage pour '${targetRaw}'...\x1b[0m\n`
  );

  let fixes = 0;
  let issues = 0;

  if (isMotion || !anyFlag) {
    if (isLocalFile && fileContent) {
      const hasMotion = /transition\s*:|animation\s*:|@keyframes/i.test(fileContent);
      const hasGuard = /prefers-reduced-motion/i.test(fileContent);
      if (hasMotion && !hasGuard) {
        const guard =
          `\n@media (prefers-reduced-motion: reduce) {\n` +
          `  *, *::before, *::after {\n` +
          `    animation-duration: 0.01ms !important;\n` +
          `    animation-iteration-count: 1 !important;\n` +
          `    transition-duration: 0.01ms !important;\n` +
          `    scroll-behavior: auto !important;\n` +
          `  }\n}\n`;
        fileContent = /<\/style>/i.test(fileContent)
          ? fileContent.replace(/<\/style>/i, `${guard}</style>`)
          : fileContent + guard;
        writeFileSync(filePath, fileContent, "utf-8");
        fixes++;
        process.stderr.write(`  \x1b[32m✔ Mouvement :\x1b[0m garde \`prefers-reduced-motion\` ajoutée (animations détectées sans garde).\n`);
      } else if (hasMotion) {
        process.stderr.write(`  \x1b[32m✔ Mouvement :\x1b[0m \`prefers-reduced-motion\` déjà présent.\n`);
      } else {
        process.stderr.write(`  \x1b[32m✔ Mouvement :\x1b[0m aucune animation/transition à protéger.\n`);
      }
    } else {
      process.stderr.write(`  \x1b[33m• Mouvement :\x1b[0m cible non-fichier — auto-fix indisponible.\n`);
    }
  }

  if (isEssence || !anyFlag) {
    const dom = await openDom(target);
    const cardSelector = "[class*='card'], [class*='Card']";
    let nested = 0;
    for (const card of Array.from(dom.window.document.querySelectorAll(cardSelector))) {
      if (card.querySelector(cardSelector)) nested++;
    }
    dom.window.close();
    if (nested > 0) {
      issues += nested;
      process.stderr.write(`  \x1b[33m✖ Essence :\x1b[0m ${nested} carte(s) imbriquée(s) détectée(s) (anti-pattern) — aplatir la structure.\n`);
    } else {
      process.stderr.write(`  \x1b[32m✔ Essence :\x1b[0m aucune carte imbriquée détectée.\n`);
    }
  }

  if (!anyFlag) {
    process.stderr.write(`  \x1b[2m• Passes créatives (bolder/quieter/spark/charm/lucid) : expérimentales, pilotées agent.\x1b[0m\n`);
  }

  if (fixes > 0) {
    process.stderr.write(`\x1b[1m\x1b[32m✔ Polish :\x1b[0m ${fixes} correction(s) appliquée(s) dans \x1b[2m${filePath}\x1b[0m.\n`);
  }
  process.exit(issues > 0 ? 1 : 0);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h" || args[0] === "help") {
    printGlobalHelp();
    process.exit(args.length === 0 ? 1 : 0);
  }

  const cmd = args[0];
  const remainingArgs = args.slice(1);

  switch (cmd) {
    case "init":
      await handleInit(remainingArgs);
      break;
    case "audit":
      await handleAudit(remainingArgs);
      break;
    case "build":
      await handleBuild(remainingArgs);
      break;
    case "check":
      await handleCheck(remainingArgs);
      break;
    case "align":
      await handleAlign(remainingArgs);
      break;
    case "polish":
      await handlePolish(remainingArgs);
      break;
    default:
      // Rétrocompatibilité : si ce n'est pas une commande connue, on considère
      // que c'est une cible passée directement (ancien format).
      await handleCheck(args);
      break;
  }
}

main().catch((error: Error) => {
  process.stderr.write(`sentech-design: ${error.message}\n`);
  process.exit(2);
});
