#!/usr/bin/env node
/**
 * Scan public assets images directory and list unused images (not referenced in any markdown under src/content/articles).
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

const mdText = mdFiles.map(f => fs.readFileSync(f, 'utf8')).join('\n');

const unused = [];
for (const img of imageFiles) {
  const rel = img.split('public')[1].replace(/\\/g,'/'); // /assets/images/...
  if (!mdText.includes(rel)) unused.push(rel);
}

if (unused.length) {
  console.log('Unused images (relative to /public):');
  for (const u of unused) console.log(' -', u);
} else {
  console.log('No unused images detected (only scans articles).');
}
