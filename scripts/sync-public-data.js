#!/usr/bin/env node
/**
 * Sync public/data with src/data
 * Ensures production builds have the latest data files
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const srcDataPath = path.join(projectRoot, 'src/data');
const publicDataPath = path.join(projectRoot, 'public/data');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const files = fs.readdirSync(src);

  files.forEach((file) => {
    const srcFile = path.join(src, file);
    const destFile = path.join(dest, file);
    const stat = fs.statSync(srcFile);

    if (stat.isDirectory()) {
      copyDir(srcFile, destFile);
    } else {
      fs.copyFileSync(srcFile, destFile);
    }
  });
}

// Remove existing public/data/categories
const categoriesPath = path.join(publicDataPath, 'categories');
if (fs.existsSync(categoriesPath)) {
  fs.rmSync(categoriesPath, { recursive: true });
}

// Sync from src/data to public/data
console.log('Syncing public/data with src/data...');
copyDir(srcDataPath, publicDataPath);
console.log('✓ Public data sync complete');
