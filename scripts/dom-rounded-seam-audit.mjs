#!/usr/bin/env node
import puppeteer from 'puppeteer-core';
import { mkdtempSync, readdirSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const base = process.env.DOCS_BASE_URL ?? 'http://127.0.0.1:4287';
const executablePath = process.env.CHROMIUM_PATH ?? '/home/antoinefa/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome';
const root = 'apps/docs/src/routes/components';
const outDir = 'screenshots/rounded-seam-audit';
mkdirSync(outDir, { recursive: true });

const slugs = readdirSync(root)
  .filter((name) => name !== '[slug]' && existsSync(join(root, name, '+page.svelte')))
  .sort();

function px(value) {
  const n = Number.parseFloat(value || '0');
  return Number.isFinite(n) ? n : 0;
}

const userDataDir = mkdtempSync(join(tmpdir(), 'rounded-seam-dom-chrome-'));
const browser = await puppeteer.launch({ executablePath, headless: true, userDataDir, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1100, deviceScaleFactor: 1 });
const findings = [];

for (const slug of slugs) {
  const url = `${base}/components/${slug}`;
  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 45000 });
    await page.evaluate(() => document.fonts?.ready);
    const pageFindings = await page.evaluate(() => {
      function num(v) {
        const n = Number.parseFloat(v || '0');
        return Number.isFinite(n) ? n : 0;
      }
      function selectorFor(el) {
        const cls = [...el.classList].slice(0, 4).map((c) => `.${c}`).join('');
        return `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${cls}`;
      }
      function visible(el, rect) {
        const cs = getComputedStyle(el);
        return rect.width > 0 && rect.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden' && Number(cs.opacity || '1') > 0.01;
      }
      return [...document.querySelectorAll('*')].flatMap((el) => {
        const rect = el.getBoundingClientRect();
        if (!visible(el, rect)) return [];
        const cs = getComputedStyle(el);
        const radii = [
          num(cs.borderTopLeftRadius),
          num(cs.borderTopRightRadius),
          num(cs.borderBottomRightRadius),
          num(cs.borderBottomLeftRadius),
        ];
        if (!radii.some((r) => r > 0.1)) return [];
        const widths = {
          top: num(cs.borderTopWidth),
          right: num(cs.borderRightWidth),
          bottom: num(cs.borderBottomWidth),
          left: num(cs.borderLeftWidth),
        };
        const styles = {
          top: cs.borderTopStyle,
          right: cs.borderRightStyle,
          bottom: cs.borderBottomStyle,
          left: cs.borderLeftStyle,
        };
        const colors = {
          top: cs.borderTopColor,
          right: cs.borderRightColor,
          bottom: cs.borderBottomColor,
          left: cs.borderLeftColor,
        };
        const active = Object.entries(widths)
          .filter(([side, width]) => width > 0.1 && styles[side] !== 'none' && styles[side] !== 'hidden' && !/rgba\([^)]*,\s*0\)/.test(colors[side]))
          .map(([side]) => side);
        if (active.length === 0 || active.length === 4) return [];
        // A mono-edge or partial-edge border on a rounded host is the forbidden seam.
        // Descendant internal separators without radius do not appear here.
        return [{ selector: selectorFor(el), active, radii, widths, rect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height } }];
      });
    });
    if (pageFindings.length > 0) {
      findings.push({ slug, url, findings: pageFindings.slice(0, 50), count: pageFindings.length });
      console.log('FIND', slug, pageFindings.length);
    } else {
      console.log('OK', slug);
    }
  } catch (error) {
    findings.push({ slug, url, error: String(error?.message ?? error) });
    console.log('ERR', slug, error?.message ?? error);
  }
}
await browser.close();
const report = { count: slugs.length, findingRoutes: findings.length, findings };
writeFileSync(join(outDir, 'dom-report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ count: report.count, findingRoutes: report.findingRoutes, report: join(outDir, 'dom-report.json') }, null, 2));
if (findings.length > 0) process.exit(1);
