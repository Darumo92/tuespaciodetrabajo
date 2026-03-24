/**
 * Converts all JPG images in public/images/ to WebP format.
 * Run: node scripts/optimize-images.mjs
 */

import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, basename } from 'path';

const DIRS = ['public/images/articulos', 'public/images/productos'];
const WEBP_QUALITY = 80;

async function getJpgFiles(dir) {
  try {
    const files = await readdir(dir);
    return files
      .filter(f => /\.(jpg|jpeg|png)$/i.test(f))
      .map(f => join(dir, f));
  } catch {
    return [];
  }
}

async function convertToWebp(filePath) {
  const webpPath = filePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  try {
    const srcStat = await stat(filePath);
    const webpStat = await stat(webpPath);
    if (webpStat.mtimeMs >= srcStat.mtimeMs) {
      return { file: basename(filePath), skipped: true };
    }
  } catch {}

  const info = await sharp(filePath)
    .webp({ quality: WEBP_QUALITY })
    .toFile(webpPath);

  const srcSize = (await stat(filePath)).size;
  const savings = Math.round((1 - info.size / srcSize) * 100);

  return {
    file: basename(filePath),
    srcSize: Math.round(srcSize / 1024),
    webpSize: Math.round(info.size / 1024),
    savings,
    skipped: false,
  };
}

async function main() {
  let totalSrc = 0;
  let totalWebp = 0;
  let converted = 0;
  let skipped = 0;

  for (const dir of DIRS) {
    const files = await getJpgFiles(dir);
    if (files.length === 0) continue;
    console.log(`\n📁 ${dir} (${files.length} images)`);
    for (const file of files) {
      const result = await convertToWebp(file);
      if (result.skipped) { skipped++; continue; }
      converted++;
      totalSrc += result.srcSize;
      totalWebp += result.webpSize;
      console.log(`  ✅ ${result.file}: ${result.srcSize}KB → ${result.webpSize}KB (-${result.savings}%)`);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`  Converted: ${converted} images`);
  console.log(`  Skipped (already up-to-date): ${skipped}`);
  if (converted > 0) {
    console.log(`  Total: ${totalSrc}KB → ${totalWebp}KB (-${Math.round((1 - totalWebp / totalSrc) * 100)}%)`);
  }
}

main().catch(console.error);
