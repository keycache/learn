#!/usr/bin/env node

/**
 * JSON Schema Validation Script
 * Validates all data files against their schemas
 * Runs as part of the build process
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ajv = new Ajv({ allErrors: true, verbose: true });
addFormats(ajv);

// Load schemas
const categoryMetadataSchema = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../schemas/category-metadata.schema.json'), 'utf-8')
);
const subcategoryMetadataSchema = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../schemas/subcategory-metadata.schema.json'), 'utf-8')
);
const topicSchema = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../schemas/topic.schema.json'), 'utf-8')
);

// Compile validators
const validateCategoryMetadata = ajv.compile(categoryMetadataSchema);
const validateSubcategoryMetadata = ajv.compile(subcategoryMetadataSchema);
const validateTopic = ajv.compile(topicSchema);

// Track validation results
let errors = [];
let validatedFiles = 0;

/**
 * Print validation errors in a readable format
 */
function printErrors(filePath, errors) {
  console.error(`\n❌ ${filePath}`);
  errors.forEach((error) => {
    const path = error.instancePath || 'root';
    const message = error.message || 'Unknown error';
    const context = error.params ? ` (${JSON.stringify(error.params)})` : '';
    console.error(`   [${path}] ${message}${context}`);
  });
}

/**
 * Validate a category metadata file
 */
function validateCategoryMetadataFile(filePath) {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    if (!validateCategoryMetadata(data)) {
      errors.push({ file: filePath, errors: validateCategoryMetadata.errors });
      return false;
    }
    validatedFiles++;
    return true;
  } catch (error) {
    errors.push({ file: filePath, errors: [{ message: error.message }] });
    return false;
  }
}

/**
 * Validate a subcategory metadata file
 */
function validateSubcategoryMetadataFile(filePath) {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    if (!validateSubcategoryMetadata(data)) {
      errors.push({ file: filePath, errors: validateSubcategoryMetadata.errors });
      return false;
    }
    validatedFiles++;
    return true;
  } catch (error) {
    errors.push({ file: filePath, errors: [{ message: error.message }] });
    return false;
  }
}

/**
 * Validate a topic file
 */
function validateTopicFile(filePath) {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    if (!validateTopic(data)) {
      errors.push({ file: filePath, errors: validateTopic.errors });
      return false;
    }
    validatedFiles++;
    return true;
  } catch (error) {
    errors.push({ file: filePath, errors: [{ message: error.message }] });
    return false;
  }
}

/**
 * Recursively find all JSON files in data directory
 */
function findDataFiles(dir, pattern) {
  const results = [];
  const files = fs.readdirSync(dir, { withFileTypes: true });

  files.forEach((file) => {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      results.push(...findDataFiles(fullPath, pattern));
    } else if (file.name.match(pattern)) {
      results.push(fullPath);
    }
  });

  return results;
}

/**
 * Main validation routine
 */
function main() {
  const dataDir = path.join(__dirname, '../src/data/categories');

  if (!fs.existsSync(dataDir)) {
    console.log('✓ No data directory found, skipping validation');
    return;
  }

  console.log('🔍 Validating JSON schema compliance...\n');

  // Find all files
  const allFiles = findDataFiles(dataDir, /\.json$/);

  if (allFiles.length === 0) {
    console.log('✓ No data files found');
    return;
  }

  allFiles.forEach((filePath) => {
    const relativePath = path.relative(__dirname, filePath);
    const fileName = path.basename(filePath);
    const parentDir = path.basename(path.dirname(filePath));
    const grandparentDir = path.basename(path.dirname(path.dirname(filePath)));

    if (fileName === 'metadata.json') {
      // Category metadata: categories/metadata.json
      if (grandparentDir === 'categories') {
        validateCategoryMetadataFile(filePath);
      }
      // Subcategory metadata: categories/[category]/[subcategory]/metadata.json
      else {
        validateSubcategoryMetadataFile(filePath);
      }
    } else if (
      fileName !== 'package.json' &&
      fileName !== 'tsconfig.json' &&
      fileName !== 'vite.config.json'
    ) {
      // Topic files
      validateTopicFile(filePath);
    }
  });

  // Print results
  console.log(`\n📊 Validation Results:`);
  console.log(`   Total files validated: ${validatedFiles}`);
  console.log(`   Errors found: ${errors.length}`);

  if (errors.length > 0) {
    console.log('\n🔴 VALIDATION FAILED\n');
    errors.forEach(({ file, errors: fileErrors }) => {
      printErrors(file, fileErrors);
    });
    console.error('\n❌ Build failed: JSON schema validation errors detected');
    process.exit(1);
  } else {
    console.log('\n✅ All data files are schema compliant!');
  }
}

main();
