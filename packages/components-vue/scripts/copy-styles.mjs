import { readFileSync, writeFileSync, readdirSync, mkdirSync, copyFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const source = resolve("src/styles.css");
const target = resolve("dist/styles.css");

mkdirSync(dirname(target), { recursive: true });
function sfcStyles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) return sfcStyles(path);
    if (!path.endsWith('.vue')) return [];
    return [...readFileSync(path, 'utf8').matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(match => match[1]);
  });
}
writeFileSync(target, [readFileSync(source, 'utf8'), ...sfcStyles(resolve('src'))].join('\n'));

mkdirSync(resolve("dist/rich-text-editor"), { recursive: true });
copyFileSync(resolve("src/rich-text-editor/rich-text-editor.css"), resolve("dist/rich-text-editor/rich-text-editor.css"));
