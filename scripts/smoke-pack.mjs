import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const tmp = mkdtempSync(join(tmpdir(), "sent-tech-pack-"));
const npmCache = join(tmp, "npm-cache");
mkdirSync(npmCache);

const packages = [
  {
    name: "@sentropic/design-system-tokens",
    requiredFiles: ["dist/index.js", "dist/index.d.ts"],
  },
  {
    name: "@sentropic/design-system-themes",
    requiredFiles: [
      "dist/index.js",
      "dist/index.d.ts",
      "css/sent-tech.css",
      "css/forge.css",
      "css/entropic.css",
    ],
  },
  {
    name: "@sentropic/design-system-svelte",
    requiredFiles: [
      "dist/index.js",
      "dist/index.d.ts",
      "dist/Button.svelte",
      "dist/Card.svelte",
      "dist/Input.svelte",
      "dist/Textarea.svelte",
    ],
  },
  {
    name: "@sentropic/design-system-react",
    requiredFiles: [
      "dist/index.js",
      "dist/index.d.ts",
      "dist/Accordion.js",
      "dist/Alert.js",
      "dist/AreaChart.js",
      "dist/AspectRatio.js",
      "dist/Badge.js",
      "dist/BarChart.js",
      "dist/Breadcrumb.js",
      "dist/Button.js",
      "dist/Card.js",
      "dist/ChatComposer.js",
      "dist/ChatMessage.js",
      "dist/ChatThread.js",
      "dist/Checkbox.js",
      "dist/CodeSnippet.js",
      "dist/Combobox.js",
      "dist/ContentSwitcher.js",
      "dist/CopyButton.js",
      "dist/DataTable.js",
      "dist/DatePicker.js",
      "dist/DonutChart.js",
      "dist/Drawer.js",
      "dist/Dropdown.js",
      "dist/EmptyState.js",
      "dist/FileUploader.js",
      "dist/Footer.js",
      "dist/ForceGraph.js",
      "dist/Form.js",
      "dist/FormGroup.js",
      "dist/Header.js",
      "dist/Highlight.js",
      "dist/IconButton.js",
      "dist/InlineLoading.js",
      "dist/Input.js",
      "dist/LanguageSelector.js",
      "dist/LineChart.js",
      "dist/Link.js",
      "dist/LoadingState.js",
      "dist/Menu.js",
      "dist/MenuPopover.js",
      "dist/MenuTriggerButton.js",
      "dist/MessageActions.js",
      "dist/MessageStatusBadge.js",
      "dist/Modal.js",
      "dist/MultiSelect.js",
      "dist/NumberInput.js",
      "dist/OrderedList.js",
      "dist/OverflowMenu.js",
      "dist/Pagination.js",
      "dist/PaginationNav.js",
      "dist/PasswordInput.js",
      "dist/Popover.js",
      "dist/ProgressBar.js",
      "dist/ProgressIndicator.js",
      "dist/Quote.js",
      "dist/Radio.js",
      "dist/ScatterPlot.js",
      "dist/Search.js",
      "dist/Select.js",
      "dist/SideNav.js",
      "dist/SkeletonText.js",
      "dist/SkipLink.js",
      "dist/Slider.js",
      "dist/Sparkline.js",
      "dist/StackedBarChart.js",
      "dist/StreamingMessage.js",
      "dist/StructuredList.js",
      "dist/Switch.js",
      "dist/Table.js",
      "dist/Tabs.js",
      "dist/Tag.js",
      "dist/Textarea.js",
      "dist/ThemeProvider.js",
      "dist/Tile.js",
      "dist/TileGroup.js",
      "dist/Toast.js",
      "dist/Toggle.js",
      "dist/Toggletip.js",
      "dist/Tooltip.js",
      "dist/TreeView.js",
      "dist/UnorderedList.js",
      "dist/styles.css",
    ],
  },
  {
    name: "@sentropic/design-system-skills",
    requiredFiles: ["dist/index.js", "dist/index.d.ts", "dist/cli.js", "dist/cli.d.ts"],
  },
];

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? root,
    encoding: "utf8",
    shell: false,
    env: {
      ...process.env,
      npm_config_cache: npmCache,
    },
    stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit",
  });

  if (result.status !== 0) {
    if (options.capture) {
      process.stderr.write(result.stdout);
      process.stderr.write(result.stderr);
    }
    process.exit(result.status ?? 1);
  }

  return result;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function packWorkspace(pkg) {
  const before = new Set(readdirSync(tmp).filter((entry) => entry.endsWith(".tgz")));
  run("npm", ["pack", "--workspace", pkg.name, "--pack-destination", tmp], { capture: true });

  const created = readdirSync(tmp).filter(
    (entry) => entry.endsWith(".tgz") && !before.has(entry),
  );
  assert(created.length === 1, `Expected one tarball for ${pkg.name}, found ${created.length}`);

  const tarball = join(tmp, created[0]);

  assert(existsSync(tarball), `Tarball missing for ${pkg.name}: ${tarball}`);
  return tarball;
}

function listTarball(tarball) {
  const result = run("tar", ["-tf", tarball], { capture: true });
  return result.stdout.split(/\r?\n/).filter(Boolean);
}

function verifyTarball(pkg, tarball) {
  const entries = new Set(listTarball(tarball));
  const missing = pkg.requiredFiles.filter((file) => !entries.has(`package/${file}`));

  assert(
    missing.length === 0,
    `${pkg.name} tarball is missing expected files: ${missing.join(", ")}`,
  );
}

function installTarballs(tarballs) {
  const installDir = join(tmp, "install");
  mkdirSync(installDir);
  writeFileSync(
    join(installDir, "package.json"),
    JSON.stringify({ name: "sent-tech-pack-smoke", private: true, type: "module" }, null, 2),
  );

  run(
    "npm",
    [
      "install",
      "--no-audit",
      "--no-fund",
      "--ignore-scripts",
      "--legacy-peer-deps",
      ...tarballs,
    ],
    { cwd: installDir },
  );

  return installDir;
}

function writeImportSmoke(installDir) {
  const smokePath = join(installDir, "verify.mjs");
  writeFileSync(
    smokePath,
    `
import { readFileSync } from "node:fs";

const tokens = await import("@sentropic/design-system-tokens");
const themes = await import("@sentropic/design-system-themes");
const skills = await import("@sentropic/design-system-skills");

if (typeof tokens.flattenTokens !== "function") {
  throw new Error("@sentropic/design-system-tokens missing flattenTokens export");
}

if (typeof themes.compileTheme !== "function") {
  throw new Error("@sentropic/design-system-themes missing compileTheme export");
}

if (typeof skills.audit !== "function") {
  throw new Error("@sentropic/design-system-skills missing audit export");
}

const componentsEntry = await import.meta.resolve("@sentropic/design-system-svelte");
if (!componentsEntry.endsWith("/dist/index.js")) {
  throw new Error("@sentropic/design-system-svelte resolved to unexpected entry: " + componentsEntry);
}

const componentIndex = readFileSync(new URL(componentsEntry), "utf8");
for (const exportName of ["Button", "Card", "Input", "Textarea"]) {
  if (!componentIndex.includes("as " + exportName)) {
    throw new Error("@sentropic/design-system-svelte missing " + exportName + " export");
  }
}

const reactEntry = await import.meta.resolve("@sentropic/design-system-react");
if (!reactEntry.endsWith("/dist/index.js")) {
  throw new Error("@sentropic/design-system-react resolved to unexpected entry: " + reactEntry);
}

const reactIndex = readFileSync(new URL(reactEntry), "utf8");
for (const exportName of [
  "Accordion",
  "Alert",
  "AreaChart",
  "AspectRatio",
  "Badge",
  "BarChart",
  "Breadcrumb",
  "Button",
  "Card",
  "ChatComposer",
  "ChatMessage",
  "ChatThread",
  "Checkbox",
  "CodeSnippet",
  "Combobox",
  "ContentSwitcher",
  "CopyButton",
  "DataTable",
  "DatePicker",
  "DonutChart",
  "Drawer",
  "Dropdown",
  "EmptyState",
  "FileUploader",
  "Footer",
  "ForceGraph",
  "Form",
  "FormGroup",
  "Header",
  "Highlight",
  "IconButton",
  "InlineLoading",
  "Input",
  "LanguageSelector",
  "LineChart",
  "Link",
  "LoadingState",
  "Menu",
  "MenuPopover",
  "MenuTriggerButton",
  "MessageActions",
  "MessageStatusBadge",
  "Modal",
  "MultiSelect",
  "NumberInput",
  "OrderedList",
  "OverflowMenu",
  "Pagination",
  "PaginationNav",
  "PasswordInput",
  "Popover",
  "ProgressBar",
  "ProgressIndicator",
  "Quote",
  "Radio",
  "ScatterPlot",
  "Search",
  "Select",
  "SideNav",
  "SkeletonText",
  "SkipLink",
  "Slider",
  "Sparkline",
  "StackedBarChart",
  "StreamingMessage",
  "StructuredList",
  "Switch",
  "Table",
  "Tabs",
  "Tag",
  "Textarea",
  "ThemeProvider",
  "Tile",
  "TileGroup",
  "Toast",
  "Toggle",
  "Toggletip",
  "Tooltip",
  "TreeView",
  "UnorderedList"
]) {
  if (!reactIndex.includes('from "./' + exportName + '.js"')) {
    throw new Error("@sentropic/design-system-react missing " + exportName + " export");
  }
}

const reactStyles = await import.meta.resolve("@sentropic/design-system-react/styles.css");
if (!reactStyles.endsWith("/dist/styles.css")) {
  throw new Error("@sentropic/design-system-react styles resolved to unexpected path: " + reactStyles);
}

console.log("Package imports verified");
`,
  );

  return smokePath;
}

try {
  console.log("Sent Tech package smoke test");
  console.log(`Temp dir: ${tmp}`);

  const tarballs = [];
  for (const pkg of packages) {
    const tarball = packWorkspace(pkg);
    verifyTarball(pkg, tarball);
    tarballs.push(tarball);
    console.log(`OK packed ${pkg.name}`);
  }

  const installDir = installTarballs(tarballs);
  const smokePath = writeImportSmoke(installDir);
  run("node", [smokePath], { cwd: installDir });

  console.log("OK package smoke test passed");
} finally {
  if (process.env.KEEP_SENT_TECH_PACK_SMOKE !== "1") {
    rmSync(tmp, { recursive: true, force: true });
  }
}
