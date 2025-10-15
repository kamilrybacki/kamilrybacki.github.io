#!/usr/bin/env node
/**
 * Generate thumbnails for large images in public/assets/images.
 * Produces <name>_thumb.ext next to originals when width > threshold.
 * Writes a mapping JSON for use in templates.
 */
const fs = require('fs');
const path = require('path');

const sharp = require('sharp');

const IMAGES_DIR = path.join(process.cwd(), 'public', 'assets', 'images');
const OUT_MAP = path.join(process.cwd(), 'public', 'assets', 'image-thumbs.json');
const MAX_WIDTH_THUMB = 360; // target thumbnail width
const LARGE_THRESHOLD = 900; // if original width > this, create thumbnail

async function main() {
  const entries = fs.readdirSync(IMAGES_DIR).filter(f => /\.(png|jpe?g|webp)$/i.test(f));
  const mapping = {};
  for (const file of entries) {
    const full = path.join(IMAGES_DIR, file);
    try {
      const meta = await sharp(full).metadata();
      if ((meta.width || 0) > LARGE_THRESHOLD) {
        const { name, ext } = path.parse(file);
        const thumbName = `${name}_thumb${ext}`;
        const thumbPath = path.join(IMAGES_DIR, thumbName);
        if (!fs.existsSync(thumbPath)) {
          await sharp(full).resize({ width: MAX_WIDTH_THUMB }).toFile(thumbPath);
          console.log('Generated thumbnail:', thumbName);
        }
        mapping[`/assets/images/${file}`] = `/assets/images/${thumbName}`;
      }
    } catch (e) {
      console.warn('Skipping (sharp error):', file, e.message);
    }
  }
  fs.writeFileSync(OUT_MAP, JSON.stringify(mapping, null, 2));
  console.log('Thumbnail mapping written to', OUT_MAP);
}

main().catch(err => { console.error(err); process.exit(1); });
