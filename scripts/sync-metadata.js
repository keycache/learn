#!/usr/bin/env node

/**
 * Metadata Synchronization Script
 * Scans the file system and updates metadata.json files to reflect actual structure
 * Runs as part of the build process to ensure metadata stays in sync with FS
 *
 * Usage: node scripts/sync-metadata.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'src', 'data', 'categories');

/**
 * Convert kebab-case or snake_case to Title Case
 */
function titleCase(str) {
  return str
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Get all subdirectories in a given path
 */
function getDirectories(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return [];
  }
  return fs
    .readdirSync(dirPath)
    .filter((file) => {
      const fullPath = path.join(dirPath, file);
      return fs.statSync(fullPath).isDirectory();
    });
}

/**
 * Check if a directory contains lesson files
 */
function hasLessonFiles(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return false;
  }
  const files = fs.readdirSync(dirPath);
  return files.some((file) => file.endsWith('.md') || file === 'quiz.json');
}

/**
 * Load or create metadata object
 */
function loadOrCreateMetadata(filePath, defaults = {}) {
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (error) {
      console.warn(`Failed to parse ${filePath}, creating new metadata`);
      return defaults;
    }
  }
  return defaults;
}

/**
 * Write metadata file with nice formatting
 */
function writeMetadata(filePath, metadata) {
  const dirPath = path.dirname(filePath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2) + '\n');
}

/**
 * Sync topics for a subcategory
 * Discovers actual topic folders and updates metadata
 */
function syncSubcategoryTopics(category, subcategory) {
  const subcategoryPath = path.join(DATA_DIR, category, subcategory);
  const metadataPath = path.join(subcategoryPath, 'metadata.json');

  const topicDirs = getDirectories(subcategoryPath).filter((dir) => {
    // Filter out metadata.json and other files
    return !dir.startsWith('.');
  });

  // Load existing metadata or create new
  const metadata = loadOrCreateMetadata(metadataPath, {
    id: subcategory,
    name: titleCase(subcategory),
    description: `Learn ${titleCase(subcategory)} vocabulary and essential phrases.`,
    category,
    version: '1.0',
    createdAt: new Date().toISOString().split('T')[0],
  });

  // Build topics array from actual directories
  const topics = topicDirs.map((topicId) => ({
    id: topicId,
    name: titleCase(topicId),
  }));

  // Only update if topics changed
  const oldTopicsJson = JSON.stringify(metadata.topics || []);
  const newTopicsJson = JSON.stringify(topics);

  if (oldTopicsJson !== newTopicsJson) {
    metadata.topics = topics;
    writeMetadata(metadataPath, metadata);
    console.log(
      `  ✓ Updated topics for ${category}/${subcategory}: ${topics.length} topic(s)`
    );
  }

  return topicDirs.length;
}

/**
 * Sync subcategories for a category
 * Discovers actual subcategory folders and updates metadata
 */
function syncCategorySubcategories(category) {
  const categoryPath = path.join(DATA_DIR, category);
  const metadataPath = path.join(categoryPath, 'metadata.json');

  const subcategoryDirs = getDirectories(categoryPath).filter((dir) => {
    // Filter out metadata.json and other files
    return !dir.startsWith('.');
  });

  // Load existing metadata or create new
  const metadata = loadOrCreateMetadata(metadataPath, {
    id: category,
    name: titleCase(category),
    description: `Learn various ${titleCase(category)} courses.`,
  });

  // Build subcategories array from actual directories
  const subcategories = subcategoryDirs.map((subcategoryId) => ({
    id: subcategoryId,
    name: titleCase(subcategoryId),
    description: `Learn ${titleCase(subcategoryId)} vocabulary and phrases`,
    category,
    version: '1.0',
    createdAt: new Date().toISOString().split('T')[0],
  }));

  // Only update if subcategories changed
  const oldSubcategoriesJson = JSON.stringify(metadata.subcategories || []);
  const newSubcategoriesJson = JSON.stringify(subcategories);

  if (oldSubcategoriesJson !== newSubcategoriesJson) {
    metadata.subcategories = subcategories;
    writeMetadata(metadataPath, metadata);
    console.log(
      `✓ Updated subcategories for ${category}: ${subcategories.length} subcategory(ies)`
    );
  }

  return subcategoryDirs;
}

/**
 * Main sync function
 * Recursively syncs all metadata.json files with the actual file system structure
 */
function syncAllMetadata() {
  console.log('🔄 Syncing metadata.json files with file system structure...\n');

  if (!fs.existsSync(DATA_DIR)) {
    console.log('ℹ️  No data directory found. Skipping metadata sync.\n');
    return;
  }

  const categories = getDirectories(DATA_DIR);

  if (categories.length === 0) {
    console.log('ℹ️  No categories found. Skipping metadata sync.\n');
    return;
  }

  let totalCategories = 0;
  let totalSubcategories = 0;
  let totalTopics = 0;

  for (const category of categories) {
    // Sync subcategories for this category
    const subcategoryDirs = syncCategorySubcategories(category);
    totalCategories++;
    totalSubcategories += subcategoryDirs.length;

    // Sync topics for each subcategory
    for (const subcategory of subcategoryDirs) {
      const topicCount = syncSubcategoryTopics(category, subcategory);
      totalTopics += topicCount;
    }
  }

  console.log(
    `\n✅ Metadata sync complete!` +
      `\n   Categories: ${totalCategories}` +
      `\n   Subcategories: ${totalSubcategories}` +
      `\n   Topics: ${totalTopics}\n`
  );
}

// Run the sync
syncAllMetadata();
