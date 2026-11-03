#!/usr/bin/env node
// Adversarial QA probe: console errors, failed requests, WebGL, band sanity, screenshots.
// node scripts/qaprobe.mjs <url> <outDir> [--mobile] [--scroll]
import { mkdirSync } from 'node:fs';
const { chromium } = await import('/usr/local/lib/node_modules/playwright/index.mjs');
const [url, out, ...flags] = process.argv.slice(2);
const mobile = flags.includes('--mobile');
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
  ...(mobile ? { isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : {}),
});
const page = await ctx.newPage();
const errors = [], warns = [], failed = [];
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text().slice(0, 300));
  if (m.type() === 'warning' && /THREE|glsl|shader/i.test(m.text())) warns.push(m.text().slice(0, 200));
});
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + String(e).slice(0, 300)));
page.on('requestfailed', (r) => failed.push(r.url() + ' :: ' + (r.failure()?.errorText || '')));
page.on('response', (r) => { if (r.status() >= 400) failed.push(r.url() + ' :: HTTP ' + r.status()); });
await page.goto(url, { waitUntil: 'load', timeout: 45000 });
await page.waitForTimeout(4200); // boot + hero entrance
const info = await page.evaluate(() => ({
  webgl: (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } })(),
  height: document.body.scrollHeight,
  booted: document.documentElement.dataset.booted || 'pending',
  bootGone: !document.getElementById('boot'),
  overflowX: document.documentElement.scrollWidth > window.innerWidth + 1,
}));
await page.screenshot({ path: out + '/01-hero.png' });
if (flags.includes('--scroll')) {
  const anchors = ['reel', 'acervo', 'servicos', 'processo', 'estudio', 'clientes', 'contato'];
  for (const id of anchors) {
    await page.evaluate((i) => {
      const el = document.getElementById(i);
      const y = el.getBoundingClientRect().top + window.scrollY;
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(0, y);
    }, id);
    await page.waitForTimeout(1400);
    await page.screenshot({ path: `${out}/${id}.png` });
  }
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: out + '/99-bottom.png' });
}
const report = { url, mobile, info, errors: [...new Set(errors)], shaderWarns: [...new Set(warns)], failed: [...new Set(failed)] };
console.log(JSON.stringify(report, null, 1));
await browser.close();
