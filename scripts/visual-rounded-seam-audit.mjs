#!/usr/bin/env node
import puppeteer from 'puppeteer-core';
import { mkdtempSync, readdirSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { PNG } from 'pngjs';
import { detectRoundedBorderSeams } from './detect-rounded-border-seams.mjs';

const base = process.env.DOCS_BASE_URL ?? 'http://127.0.0.1:4287';
const executablePath = process.env.CHROMIUM_PATH ?? '/usr/bin/chromium';
const limit = process.env.LIMIT ? Number(process.env.LIMIT) : Infinity;
const root = 'apps/docs/src/routes/components';
const outDir = 'screenshots/rounded-seam-audit';
mkdirSync(outDir, { recursive: true });
const slugs = [];
for (const name of readdirSync(root)) {
  const p = join(root, name, '+page.svelte');
  if (existsSync(p) && name !== '[slug]') slugs.push(name);
}
slugs.sort();
const selected = slugs.slice(0, limit);
const userDataDir = mkdtempSync(join(tmpdir(), 'rounded-seam-chrome-'));
const browser = await puppeteer.launch({ executablePath, headless: true, userDataDir, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1100, deviceScaleFactor: 1 });
const findings = [];
for (const slug of selected) {
  const url = `${base}/components/${slug}`;
  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 45000 });
    await page.evaluate(() => document.fonts?.ready);
    const buf = await page.screenshot({ fullPage: true });
    const png = PNG.sync.read(buf);
    const result = detectRoundedBorderSeams(png, { minComponentPixels: 10 });
    if (result.findings.length > 0) {
      const file = join(outDir, `${slug}.png`);
      writeFileSync(file, buf);
      findings.push({ slug, url, file, count: result.findings.length, findings: result.findings.slice(0, 20) });
      console.log('FIND', slug, result.findings.length);
    } else {
      console.log('OK', slug);
    }
  } catch (error) {
    findings.push({ slug, url, error: String(error?.message ?? error) });
    console.log('ERR', slug, error?.message ?? error);
  }
}
await browser.close();
const report = { count: selected.length, totalRoutes: slugs.length, findingRoutes: findings.length, findings };
writeFileSync(join(outDir, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ count: report.count, totalRoutes: report.totalRoutes, findingRoutes: report.findingRoutes, report: join(outDir, 'report.json') }, null, 2));
if (findings.length > 0) process.exit(1);
