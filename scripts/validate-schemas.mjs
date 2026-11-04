#!/usr/bin/env node

/**
 * Schema & Markdown Validation Script
 * Validates all data files (JSON schemas + markdown lessons) against their specs
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
const topicMetadataSchema = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../schemas/topic-metadata.schema.json'), 'utf-8')
);
const topicSchema = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../schemas/topic.schema.json'), 'utf-8')
);

// Compile validators
const validateCategoryMetadata = ajv.compile(categoryMetadataSchema);
const validateSubcategoryMetadata = ajv.compile(subcategoryMetadataSchema);
const validateTopicMetadata = ajv.compile(topicMetadataSchema);
const validateTopic = ajv.compile(topicSchema);

// Markdown lesson metadata schema
const lessonMetadataSchema = {
  type: 'object',
  required: ['title', 'summary', 'duration', 'active', 'difficulty', 'learningObjectives', 'tags'],
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 200 },
    summary: { type: 'string', minLength: 1, maxLength: 500 },
    duration: { type: 'string', pattern: '^[0-9]+-?[0-9]*\\s+(minute|hour)s?$' },
    active: { type: 'boolean' },
    difficulty: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
    learningObjectives: {
      type: 'array',
      items: { type: 'string', minLength: 1 },
      minItems: 1,
      maxItems: 10,
    },
    tags: {
      type: 'array',
      items: { type: 'string', minLength: 1 },
      minItems: 1,
      maxItems: 20,
    },
    createdAt: { type: 'string', format: 'date-time' },
    category: { type: 'string' },
    subcategory: { type: 'string' },
    topic: { type: 'string' },
  },
  additionalProperties: false,
};

const validateLessonMetadata = ajv.compile(lessonMetadataSchema);

// Track validation results
let errors = [];
let validatedFiles = 0;
let validatedMarkdown = 0;

/**
 * Print validation errors in a readable format
 */
function printErrors(filePath, errors, type = 'Schema') {
  console.error(`\n❌ ${type} Error in ${filePath}`);
  errors.forEach((error) => {
    const errorPath = error.instancePath || 'root';
    const message = error.message || 'Unknown error';
    const context = error.params ? ` (${JSON.stringify(error.params)})` : '';
    console.error(`   [${errorPath}] ${message}${context}`);
  });
}

/**
 * Parse YAML frontmatter from markdown file
 * Returns: { metadata: object, content: string, isValid: boolean, errors: array }
 */
function parseMarkdownFrontmatter(content) {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\n---\r?\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return {
      metadata: null,
      content: null,
      isValid: false,
      errors: [{ message: 'Missing frontmatter: markdown must start with --- YAML ---' }],
    };
  }

  const [, frontmatterStr, markdown] = match;

  // Parse YAML - handle both simple values and arrays
  const metadata = {};
  const lines = frontmatterStr.split('\n');
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    
    // Skip empty lines
    if (!line.trim()) {
      i++;
      continue;
    }

    // Check if this is a key: value line (not an array item)
    if (line.includes(':') && !line.trim().startsWith('-')) {
      const colonIndex = line.indexOf(':');
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();

      // Check if next non-empty line is an array item (starting with -)
      let nextLineIdx = i + 1;
      while (nextLineIdx < lines.length && !lines[nextLineIdx].trim()) {
        nextLineIdx++;
      }
      
      if (nextLineIdx < lines.length && lines[nextLineIdx].trim().startsWith('-')) {
        const arrayItems = [];
        i = nextLineIdx;
        
        // Collect all array items
        while (i < lines.length && lines[i].trim().startsWith('-')) {
          let item = lines[i].trim().substring(1).trim(); // Remove leading '-'
          
          // Remove quotes if present
          if ((item.startsWith('"') && item.endsWith('"')) || 
              (item.startsWith("'") && item.endsWith("'"))) {
            item = item.slice(1, -1);
          }
          
          if (item) {
            arrayItems.push(item);
          }
          i++;
        }
        
        metadata[key] = arrayItems;
        i--; // Back up one since the while loop will increment
      }
      // Handle inline arrays: ["item1", "item2"]
      else if (value.startsWith('[') && value.endsWith(']')) {
        try {
          metadata[key] = JSON.parse(value);
        } catch {
          return {
            metadata: null,
            content: null,
            isValid: false,
            errors: [{ message: `Invalid JSON array in field "${key}": ${value}` }],
          };
        }
      }
      // Handle booleans
      else if (value === 'true') {
        metadata[key] = true;
      } else if (value === 'false') {
        metadata[key] = false;
      }
      // Handle quoted strings
      else if ((value.startsWith('"') && value.endsWith('"')) || 
               (value.startsWith("'") && value.endsWith("'"))) {
        metadata[key] = value.slice(1, -1);
      }
      // Handle unquoted strings (only if there's a value)
      else if (value) {
        metadata[key] = value;
      }
    }
    
    i++;
  }

  return {
    metadata,
    content: markdown,
    isValid: true,
    errors: [],
  };
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
 * Validate a topic metadata file
 */
function validateTopicMetadataFile(filePath) {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    if (!validateTopicMetadata(data)) {
      errors.push({ file: filePath, errors: validateTopicMetadata.errors });
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
 * Validate a markdown lesson file
 */
function validateMarkdownLesson(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Parse frontmatter
    const { metadata, content: markdown, isValid, errors: parseErrors } = parseMarkdownFrontmatter(content);

    if (!isValid) {
      errors.push({ file: filePath, errors: parseErrors, type: 'Markdown' });
      return false;
    }

    // Validate metadata against schema
    if (!validateLessonMetadata(metadata)) {
      errors.push({ file: filePath, errors: validateLessonMetadata.errors, type: 'Metadata' });
      return false;
    }

    // Validate markdown content exists
    if (!markdown || markdown.trim().length === 0) {
      errors.push({
        file: filePath,
        errors: [{ message: 'Markdown content is empty after frontmatter' }],
        type: 'Markdown',
      });
      return false;
    }

    // Validate markdown has at least one heading
    if (!markdown.match(/^#+\s+/m)) {
      errors.push({
        file: filePath,
        errors: [{ message: 'Markdown must contain at least one heading (e.g., "# Title")' }],
        type: 'Markdown',
      });
      return false;
    }

    validatedMarkdown++;
    return true;
  } catch (error) {
    errors.push({ file: filePath, errors: [{ message: error.message }], type: 'Markdown' });
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
 * Recursively find all lesson markdown files in public/data directory
 */
function findLessonFiles(dir) {
  const results = [];
  const files = fs.readdirSync(dir, { withFileTypes: true });

  files.forEach((file) => {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      results.push(...findLessonFiles(fullPath));
    } else if (file.name.match(/^lesson_\d+\.md$/)) {
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
  const publicDataDir = path.join(__dirname, '../public/data/categories');

  console.log('🔍 Validating JSON schema compliance...\n');

  // Validate JSON files
  if (fs.existsSync(dataDir)) {
    const allFiles = findDataFiles(dataDir, /\.json$/);

    if (allFiles.length > 0) {
      allFiles.forEach((filePath) => {
        const fileName = path.basename(filePath);
        const parentDir = path.basename(path.dirname(filePath));
        const grandparentDir = path.basename(path.dirname(path.dirname(filePath)));

        if (fileName === 'metadata.json') {
          // Category metadata: categories/metadata.json
          if (grandparentDir === 'categories') {
            validateCategoryMetadataFile(filePath);
          }
          // Subcategory metadata: categories/[category]/[subcategory]/metadata.json
          // Topic metadata: categories/[category]/[subcategory]/[topic]/metadata.json
          else {
            // Check depth to determine if this is subcategory or topic metadata
            const depth = filePath.split(path.sep).length;
            const dataPathDepth = dataDir.split(path.sep).length;
            const relativeDepth = depth - dataPathDepth;
            
            // Topic level is 3 levels deep (category/subcategory/topic/metadata.json = 5 total)
            // Subcategory level is 2 levels deep (category/subcategory/metadata.json = 4 total)
            if (relativeDepth >= 4) {
              validateTopicMetadataFile(filePath);
            } else {
              validateSubcategoryMetadataFile(filePath);
            }
          }
        } else if (
          fileName !== 'package.json' &&
          fileName !== 'tsconfig.json' &&
          fileName !== 'vite.config.json' &&
          !fileName.endsWith('.backup.json')
        ) {
          // Topic files (quiz.json)
          validateTopicFile(filePath);
        }
      });
    }
  } else {
    console.log('ℹ️  No src/data/categories directory found');
  }

  // Validate markdown lesson files
  console.log('🔍 Validating markdown lesson files...\n');

  if (fs.existsSync(publicDataDir)) {
    const lessonFiles = findLessonFiles(publicDataDir);

    if (lessonFiles.length > 0) {
      lessonFiles.forEach((filePath) => {
        validateMarkdownLesson(filePath);
      });
    } else {
      console.log('ℹ️  No lesson markdown files found');
    }
  } else {
    console.log('ℹ️  No public/data/categories directory found');
  }

  // Print results
  console.log(`\n📊 Validation Results:`);
  console.log(`   JSON files validated: ${validatedFiles}`);
  console.log(`   Markdown lessons validated: ${validatedMarkdown}`);
  console.log(`   Total errors found: ${errors.length}`);

  if (errors.length > 0) {
    console.log('\n🔴 VALIDATION FAILED\n');
    errors.forEach(({ file, errors: fileErrors, type }) => {
      printErrors(file, fileErrors, type || 'Schema');
    });
    console.error('\n❌ Build failed: Schema or markdown validation errors detected');
    process.exit(1);
  } else {
    console.log('\n✅ All data files and lesson markdown are schema compliant!');
  }
}

main();
