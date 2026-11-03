const { chromium } = await import('/usr/local/lib/node_modules/playwright/index.mjs');
const b = await chromium.launch();
for (const vp of [[{width:1440,height:900},'desktop'],[{width:390,height:844,isMobile:true,hasTouch:true},'mobile']]) {
  const ctx = await b.newContext({ viewport: {width: vp[0].width, height: vp[0].height}, reducedMotion: 'reduce', ...(vp[0].isMobile?{isMobile:true,hasTouch:true}:{}) });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', e => errors.push(String(e).slice(0,150)));
  await p.goto('http://localhost:4173', { waitUntil: 'load' });
  await p.waitForTimeout(1800);
  const info = await p.evaluate(() => ({
    booted: document.documentElement.dataset.booted,
    bootGone: !document.getElementById('boot'),
    h1visible: (() => { const h = document.querySelector('.hero__h1 span span'); const o = h && getComputedStyle(h).opacity; return o })(),
    overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    height: document.body.scrollHeight,
  }));
  await p.screenshot({ path: `/tmp/reduced-${vp[1]}.png` });
  console.log(vp[1], JSON.stringify({ ...info, errors }));
  await ctx.close();
}
await b.close();
