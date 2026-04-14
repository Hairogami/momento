import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';

const BASE = 'docs/design-references/antigravity';
mkdirSync(BASE, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });

console.log('Navigating...');
await page.goto('https://antigravity.google', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2000);

// Scroll through to trigger animations
const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
console.log('Page height:', pageHeight);

// Take screenshots at scroll positions
const positions = [0, 900, 1800, 2700, 3600, 4500, 5400, 6300, 7200, 8100, 9000, 9600];
for (const pos of positions) {
  await page.evaluate((y) => window.scrollTo(0, y), pos);
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${BASE}/scroll-${pos}.png` });
  console.log(`Screenshot at ${pos}px`);
}

// Extract global design tokens
const tokens = await page.evaluate(() => {
  const body = document.body;
  const cs = getComputedStyle(body);

  // Get all fonts used
  const fonts = new Set();
  document.querySelectorAll('*').forEach(el => {
    const ff = getComputedStyle(el).fontFamily;
    if (ff) fonts.add(ff.split(',')[0].trim().replace(/['"]/g, ''));
  });

  // Get colors
  const colors = new Set();
  ['h1','h2','h3','p','button','nav','header'].forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      const cs = getComputedStyle(el);
      if (cs.color !== 'rgba(0, 0, 0, 0)') colors.add(cs.color);
      if (cs.backgroundColor !== 'rgba(0, 0, 0, 0)') colors.add(cs.backgroundColor);
    });
  });

  // Get Google Fonts links
  const gFonts = [...document.querySelectorAll('link[href*="fonts.google"]')].map(l => l.href);

  // Nav items
  const navItems = [...document.querySelectorAll('nav a, header a')].map(a => ({
    text: a.textContent.trim(),
    href: a.href
  })).filter(a => a.text);

  // Hero content
  const h1 = document.querySelector('h1')?.textContent.trim();
  const h2 = document.querySelector('h2')?.textContent.trim();
  const ctaBtns = [...document.querySelectorAll('button, a[class*="btn"], a[class*="cta"]')]
    .map(b => b.textContent.trim()).filter(t => t.length < 60 && t.length > 1).slice(0, 5);

  // All headings
  const headings = [...document.querySelectorAll('h1,h2,h3,h4')].map(h => ({
    tag: h.tagName,
    text: h.textContent.trim().slice(0, 200)
  }));

  // CSS custom properties
  const cssVars = {};
  const rootStyle = getComputedStyle(document.documentElement);
  // Sample some common var names
  ['--color-primary','--color-bg','--font-family','--foreground','--background',
   '--color-surface','--color-text','--radius','--spacing'].forEach(v => {
    const val = rootStyle.getPropertyValue(v).trim();
    if (val) cssVars[v] = val;
  });

  // All stylesheets links
  const styleLinks = [...document.querySelectorAll('link[rel="stylesheet"]')].map(l => l.href);

  // Page sections (main children)
  const sections = [...document.querySelectorAll('section, [class*="section"], main > div')].map(s => ({
    tag: s.tagName,
    id: s.id,
    classes: s.className?.toString().slice(0, 100),
    height: s.getBoundingClientRect().height,
    text: s.querySelector('h1,h2,h3')?.textContent.trim().slice(0, 100)
  })).slice(0, 20);

  return { fonts: [...fonts], colors: [...colors], gFonts, navItems, h1, h2, ctaBtns, headings, cssVars, styleLinks, sections, pageHeight: document.documentElement.scrollHeight };
});

writeFileSync(`${BASE}/tokens.json`, JSON.stringify(tokens, null, 2));
console.log('\n=== DESIGN TOKENS ===');
console.log(JSON.stringify(tokens, null, 2));

// Extract hero section CSS in detail
const heroCSS = await page.evaluate(() => {
  const hero = document.querySelector('section') || document.querySelector('main') || document.querySelector('[class*="hero"]');
  if (!hero) return null;

  const props = ['fontSize','fontWeight','fontFamily','lineHeight','letterSpacing','color',
    'backgroundColor','background','padding','margin','width','height','maxWidth',
    'display','flexDirection','justifyContent','alignItems','gap',
    'borderRadius','border','boxShadow','position','textAlign','opacity','transform'];

  function extract(el, depth = 0) {
    if (depth > 3) return null;
    const cs = getComputedStyle(el);
    const styles = {};
    props.forEach(p => {
      const v = cs[p];
      if (v && v !== 'none' && v !== 'normal' && v !== 'auto' && v !== '0px' && v !== 'rgba(0, 0, 0, 0)' && v !== '') styles[p] = v;
    });
    return {
      tag: el.tagName,
      id: el.id,
      classes: el.className?.toString().slice(0, 80),
      text: el.children.length === 0 ? el.textContent.trim().slice(0, 100) : null,
      styles,
      children: [...el.children].slice(0, 8).map(c => extract(c, depth + 1)).filter(Boolean)
    };
  }
  return extract(hero);
});

writeFileSync(`${BASE}/hero-css.json`, JSON.stringify(heroCSS, null, 2));

// Get all text content sections
const allText = await page.evaluate(() => {
  return [...document.querySelectorAll('h1,h2,h3,p,li,span[class*="label"],span[class*="tag"]')]
    .map(el => ({ tag: el.tagName, text: el.textContent.trim().slice(0, 300) }))
    .filter(t => t.text.length > 5 && t.text.length < 300)
    .slice(0, 80);
});
writeFileSync(`${BASE}/all-text.json`, JSON.stringify(allText, null, 2));
console.log('\n=== ALL TEXT ===');
allText.forEach(t => console.log(`[${t.tag}] ${t.text}`));

await browser.close();
console.log('\nRecon complete!');
