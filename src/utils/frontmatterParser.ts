import { LessonMetadata, MarkdownContent } from '../types/learning';

/**
 * Parse YAML frontmatter from markdown content
 * Frontmatter must be at the start of the file, delimited by --- markers
 * Returns metadata and remaining markdown content
 */
export function parseFrontmatter(content: string): MarkdownContent {
  // Make regex more flexible - allow optional carriage returns and whitespace after closing ---
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\n---\r?\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    throw new Error('Invalid markdown format: missing frontmatter delimiters (---)');
  }

  const [, frontmatterStr, markdownContent] = match;
  const metadata = parseFrontmatterYAML(frontmatterStr);

  return {
    metadata,
    content: markdownContent.trim(),
  };
}

/**
 * Parse YAML-style frontmatter into LessonMetadata object
 * Supports simple YAML format (key: value, arrays with -, etc.)
 */
function parseFrontmatterYAML(yamlStr: string): LessonMetadata {
  const lines = yamlStr.split('\n').filter((line) => line.trim());
  const metadata: Record<string, unknown> = {};
  let currentArray: string[] | null = null;
  let currentArrayKey = '';

  for (const line of lines) {
    const trimmed = line.trim();

    // Handle array items (- value)
    if (trimmed.startsWith('- ')) {
      if (currentArray === null) {
        throw new Error(`Invalid YAML: array item without parent key`);
      }
      const arrayItem = trimmed.substring(2).trim();
      currentArray.push(parseYAMLArrayItem(arrayItem));
      continue;
    }

    // Handle key-value pairs (key: value)
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) {
      throw new Error(`Invalid YAML: line must contain ':' - ${line}`);
    }

    const key = line.substring(0, colonIndex).trim();
    const value = line.substring(colonIndex + 1).trim();

    // If this is a new array, initialize it
    if (value === '' || value === '[]') {
      currentArray = [];
      currentArrayKey = key;
      metadata[key] = currentArray;
    } else {
      // Regular key-value
      currentArray = null;
      metadata[key] = parseYAMLValue(value);
    }
  }

  // Validate required fields
  validateLessonMetadata(metadata);

  return metadata as LessonMetadata;
}

/**
 * Parse YAML value types (strings, numbers, booleans, arrays)
 */
function parseYAMLValue(value: string): unknown {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (!isNaN(Number(value)) && value !== '') return Number(value);

  // Handle JSON-style arrays: ["item1", "item2"]
  if (value.startsWith('[') && value.endsWith(']')) {
    try {
      return JSON.parse(value);
    } catch {
      throw new Error(`Invalid JSON array: ${value}`);
    }
  }

  // Remove quotes if present
  if ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }

  return value;
}

/**
 * Parse array item from YAML format
 * Handles quoted and unquoted values
 */
function parseYAMLArrayItem(item: string): string {
  // Remove quotes if present
  if ((item.startsWith('"') && item.endsWith('"')) ||
      (item.startsWith("'") && item.endsWith("'"))) {
    return item.slice(1, -1);
  }
  return item;
}

/**
 * Validate that frontmatter contains all required fields
 */
function validateLessonMetadata(metadata: Record<string, unknown>): asserts metadata is Record<string, unknown> & LessonMetadata {
  const required = ['title', 'summary', 'duration', 'active', 'difficulty', 'learningObjectives', 'tags'];
  const missing = required.filter((field) => !(field in metadata));

  if (missing.length > 0) {
    throw new Error(
      `Invalid frontmatter: missing required fields - ${missing.join(', ')}`
    );
  }

  // Validate field types
  if (typeof metadata.title !== 'string') {
    throw new Error('Invalid frontmatter: title must be a string');
  }
  if (typeof metadata.summary !== 'string') {
    throw new Error('Invalid frontmatter: summary must be a string');
  }
  if (typeof metadata.duration !== 'string') {
    throw new Error('Invalid frontmatter: duration must be a string');
  }
  if (typeof metadata.active !== 'boolean') {
    throw new Error('Invalid frontmatter: active must be a boolean');
  }
  if (!['beginner', 'intermediate', 'advanced'].includes(metadata.difficulty as string)) {
    throw new Error('Invalid frontmatter: difficulty must be beginner, intermediate, or advanced');
  }
  if (!Array.isArray(metadata.learningObjectives)) {
    throw new Error('Invalid frontmatter: learningObjectives must be an array');
  }
  if (!Array.isArray(metadata.tags)) {
    throw new Error('Invalid frontmatter: tags must be an array');
  }
}

/**
 * Extract lesson order from filename (e.g., "lesson_1.md" -> 1)
 */
export function extractLessonOrder(filename: string): number {
  const match = filename.match(/lesson_(\d+)\.md$/);
  if (!match) {
    throw new Error(`Invalid lesson filename format: ${filename} (expected lesson_N.md)`);
  }
  return parseInt(match[1], 10);
}

/**
 * Extract lesson ID from filename (e.g., "lesson_1.md" -> "lesson_1")
 */
export function extractLessonId(filename: string): string {
  const match = filename.match(/^(lesson_\d+)\.md$/);
  if (!match) {
    throw new Error(`Invalid lesson filename format: ${filename} (expected lesson_N.md)`);
  }
  return match[1];
}
