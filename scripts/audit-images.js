#!/usr/bin/env node
/**
 * Image audit utility.
 * 1. Lists unused images under public/assets/images (not referenced in any article markdown).
 * 2. Lists missing referenced images (markdown references that don't exist on disk).
 * 3. Verifies passthrough copy coverage (ensures public/assets is mapped to /assets in output).
 */
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(process.cwd(), 'public', 'assets', 'images');
const contentDir = path.join(process.cwd(), 'src', 'content', 'articles');

function walk(dir, filterExts) {
  const out = [];
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) out.push(...walk(full, filterExts));
    else if (!filterExts || filterExts.includes(path.extname(entry))) out.push(full);
  }
  return out;
}

const mdFiles = walk(contentDir, ['.md']);
const imageFiles = walk(imagesDir);
const mdTexts = mdFiles.map(f => fs.readFileSync(f, 'utf8'));
const mdText = mdTexts.join('\n');

// 1. Unused images
const unused = [];
for (const img of imageFiles) {
  const rel = img.split('public')[1].replace(/\\/g,'/'); // /assets/images/...
  if (!mdText.includes(rel)) unused.push(rel);
}

// 2. Missing referenced images - regex grab markdown image paths matching /assets/images/...ext
const referenced = new Set();
const imgRefRegex = /!\[[^\]]*\]\((\/assets\/images\/[^)]+)\)/g;
let m;
while ((m = imgRefRegex.exec(mdText)) !== null) {
  referenced.add(m[1].trim());
}
const existingRelSet = new Set(imageFiles.map(f => f.split('public')[1].replace(/\\/g,'/')));
const missing = Array.from(referenced).filter(r => !existingRelSet.has(r));

// 3. Passthrough coverage check: inspect .eleventy.js for mapping of public/assets
const eleventyConfigPath = path.join(process.cwd(), '.eleventy.js');
let passthroughOk = false;
try {
  const cfg = fs.readFileSync(eleventyConfigPath, 'utf8');
  passthroughOk = /addPassthroughCopy\([^)]*public\/assets/.test(cfg);
} catch (e) {}

console.log('IMAGE AUDIT REPORT');
console.log('===================');
if (unused.length) {
  console.log('\nUnused images (relative to /public):');
  for (const u of unused) console.log(' -', u);
} else {
  console.log('\nNo unused images detected (scope: articles).');
}

if (missing.length) {
  console.log('\nMissing referenced images (paths appear in markdown but not on disk):');
  for (const r of missing) console.log(' -', r);
} else {
  console.log('\nNo missing referenced images.');
}

console.log('\nPassthrough mapping for public/assets:', passthroughOk ? 'FOUND' : 'NOT FOUND');
if (!passthroughOk) {
  console.log('Add: eleventyConfig.addPassthroughCopy({ "public/assets": "assets" }); to .eleventy.js');
}

// Provide lightweight summary counts
console.log('\nSummary:');
console.log(' Total images:', imageFiles.length);
console.log(' Referenced in markdown:', referenced.size);
console.log(' Unused:', unused.length);
console.log(' Missing:', missing.length);
