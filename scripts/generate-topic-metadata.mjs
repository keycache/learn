#!/usr/bin/env node

/**
 * Auto-generate topic metadata.json files
 * Scans for lesson files and creates/updates metadata.json with discovered lessons
 * Runs as part of the build process
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @typedef {Object} Lesson
 * @property {string} id
 * @property {number} order
 */

/**
 * @typedef {Object} TopicMetadata
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} category
 * @property {string} subcategory
 * @property {string} version
 * @property {string} createdAt
 * @property {Lesson[]} lessons
 */

/**
 * Extract topic name from folder name (e.g., "numbers" -> "Numbers")
 * @param {string} id
 * @returns {string}
 */
function getTitleFromId(id) {
  return id
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Scan directory for lesson_N.md files and extract their order
 * @param {string} topicDir
 * @returns {Lesson[]}
 */
function discoverLessons(topicDir) {
  const lessons = [];
  
  try {
    const files = fs.readdirSync(topicDir);
    
    // Find all lesson_N.md files
    const lessonFiles = files
      .filter(f => /^lesson_\d+\.md$/.test(f))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || '0');
        const numB = parseInt(b.match(/\d+/)?.[0] || '0');
        return numA - numB;
      });
    
    // Extract lesson IDs and order
    lessonFiles.forEach((file, index) => {
      const id = file.replace('.md', ''); // e.g., "lesson_1"
      lessons.push({
        id,
        order: index + 1, // Maintain order as found
      });
    });
  } catch (error) {
    console.error(`Error scanning directory ${topicDir}:`, error);
  }
  
  return lessons;
}

/**
 * Load existing metadata or create a template
 * @param {string} metadataPath
 * @param {string} topicId
 * @param {string} categoryId
 * @param {string} subcategoryId
 * @returns {TopicMetadata}
 */
function loadOrCreateMetadata(metadataPath, topicId, categoryId, subcategoryId) {
  if (fs.existsSync(metadataPath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
      // Preserve existing metadata but we'll update lessons array
      return existing;
    } catch (error) {
      console.warn(`Failed to parse existing metadata at ${metadataPath}, creating new one`);
    }
  }
  
  // Create template
  return {
    id: topicId,
    name: getTitleFromId(topicId),
    description: `Learn ${getTitleFromId(subcategoryId)} ${getTitleFromId(topicId).toLowerCase()}.`,
    category: categoryId,
    subcategory: subcategoryId,
    version: '1.0',
    createdAt: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    lessons: [],
  };
}

/**
 * Process a single topic directory
 * @param {string} topicPath
 * @param {string} categoryId
 * @param {string} subcategoryId
 * @returns {boolean}
 */
function processTopic(topicPath, categoryId, subcategoryId) {
  const topicId = path.basename(topicPath);
  const metadataPath = path.join(topicPath, 'metadata.json');
  
  // Discover lessons in this topic
  const discoveredLessons = discoverLessons(topicPath);
  
  // If no lessons found, skip
  if (discoveredLessons.length === 0) {
    return false;
  }
  
  // Load or create metadata
  const metadata = loadOrCreateMetadata(metadataPath, topicId, categoryId, subcategoryId);
  
  // Update lessons array with discovered lessons
  metadata.lessons = discoveredLessons;
  
  // Write metadata file
  try {
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2) + '\n', 'utf-8');
    console.log(`✓ Updated metadata for ${categoryId}/${subcategoryId}/${topicId} (${discoveredLessons.length} lessons)`);
    return true;
  } catch (error) {
    console.error(`✗ Failed to write metadata for ${categoryId}/${subcategoryId}/${topicId}:`, error);
    return false;
  }
}

/**
 * Process a single subcategory directory
 * @param {string} subcategoryPath
 * @param {string} categoryId
 * @returns {number}
 */
function processSubcategory(subcategoryPath, categoryId) {
  const subcategoryId = path.basename(subcategoryPath);
  let updated = 0;
  
  try {
    const dirs = fs.readdirSync(subcategoryPath, { withFileTypes: true });
    
    for (const dir of dirs) {
      // Skip metadata.json and other files
      if (!dir.isDirectory()) continue;
      
      const topicPath = path.join(subcategoryPath, dir.name);
      if (processTopic(topicPath, categoryId, subcategoryId)) {
        updated++;
      }
    }
  } catch (error) {
    console.error(`Error processing subcategory ${categoryId}/${subcategoryId}:`, error);
  }
  
  return updated;
}

/**
 * Main entry point
 */
function main() {
  const dataDir = path.join(__dirname, '../src/data/categories');
  
  if (!fs.existsSync(dataDir)) {
    console.log('ℹ️  No src/data/categories directory found, skipping metadata generation');
    return;
  }
  
  console.log('🔄 Auto-generating topic metadata files...\n');
  
  let totalUpdated = 0;
  
  try {
    const dirs = fs.readdirSync(dataDir, { withFileTypes: true });
    
    for (const dir of dirs) {
      // Skip files and hidden directories
      if (!dir.isDirectory() || dir.name.startsWith('.')) continue;
      
      const categoryPath = path.join(dataDir, dir.name);
      const categoryId = dir.name;
      
      // Process subcategories
      const subDirs = fs.readdirSync(categoryPath, { withFileTypes: true });
      
      for (const subDir of subDirs) {
        if (!subDir.isDirectory() || subDir.name.startsWith('.')) continue;
        
        const subcategoryPath = path.join(categoryPath, subDir.name);
        totalUpdated += processSubcategory(subcategoryPath, categoryId);
      }
    }
  } catch (error) {
    console.error('Error scanning data directory:', error);
    process.exit(1);
  }
  
  console.log(`\n✓ Metadata generation complete (${totalUpdated} topic(s) updated)`);
}

main();
