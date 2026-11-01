import { describe, it, expect, beforeEach } from 'vitest';
import {
  parseFrontmatter,
  extractLessonOrder,
  extractLessonId,
} from '../../../src/utils/frontmatterParser';

describe('frontmatterParser', () => {
  describe('parseFrontmatter', () => {
    it('should parse valid frontmatter with all required fields', () => {
      const markdown = `---
title: Introduction to Numbers
summary: Learn basic numbers in French
duration: 10-15 minutes
active: true
difficulty: beginner
learningObjectives:
- Learn numbers 1-10
- Practice pronunciation
tags:
- vocabulary
- pronunciation
---

# Content here`;

      const result = parseFrontmatter(markdown);

      expect(result.metadata).toEqual({
        title: 'Introduction to Numbers',
        summary: 'Learn basic numbers in French',
        duration: '10-15 minutes',
        active: true,
        difficulty: 'beginner',
        learningObjectives: ['Learn numbers 1-10', 'Practice pronunciation'],
        tags: ['vocabulary', 'pronunciation'],
      });

      expect(result.content).toEqual('# Content here');
    });

    it('should parse multiline content after frontmatter', () => {
      const markdown = `---
title: Test
summary: Test summary
duration: 5 minutes
active: true
difficulty: beginner
learningObjectives:
- Objective 1
tags:
- tag1
---

## Introduction

This is a test lesson with multiple paragraphs.

- Point 1
- Point 2`;

      const result = parseFrontmatter(markdown);

      expect(result.content).toContain('## Introduction');
      expect(result.content).toContain('This is a test lesson');
      expect(result.content).toContain('- Point 1');
    });

    it('should throw error if frontmatter delimiters are missing', () => {
      const markdown = `title: Missing Delimiters
summary: Test`;

      expect(() => parseFrontmatter(markdown)).toThrow(
        'Invalid markdown format: missing frontmatter delimiters (---)'
      );
    });

    it('should throw error if required fields are missing', () => {
      const markdown = `---
title: Incomplete
summary: Missing duration and other fields
---

Content`;

      expect(() => parseFrontmatter(markdown)).toThrow(
        'Invalid frontmatter: missing required fields'
      );
    });

    it('should throw error if title is not a string', () => {
      const markdown = `---
title: 123
summary: Test
duration: 5 minutes
active: true
difficulty: beginner
learningObjectives:
- Test
tags:
- test
---

Content`;

      // In this case, "123" gets parsed as a number, should throw
      expect(() => parseFrontmatter(markdown)).toThrow(
        'Invalid frontmatter: title must be a string'
      );
    });

    it('should throw error if active is not boolean', () => {
      const markdown = `---
title: Test
summary: Test
duration: 5 minutes
active: yes
difficulty: beginner
learningObjectives:
- Test
tags:
- test
---

Content`;

      expect(() => parseFrontmatter(markdown)).toThrow(
        'Invalid frontmatter: active must be a boolean'
      );
    });

    it('should throw error if difficulty is invalid', () => {
      const markdown = `---
title: Test
summary: Test
duration: 5 minutes
active: true
difficulty: expert
learningObjectives:
- Test
tags:
- test
---

Content`;

      expect(() => parseFrontmatter(markdown)).toThrow(
        'Invalid frontmatter: difficulty must be beginner, intermediate, or advanced'
      );
    });

    it('should throw error if learningObjectives is not an array', () => {
      const markdown = `---
title: Test
summary: Test
duration: 5 minutes
active: true
difficulty: beginner
learningObjectives: Not an array
tags:
- test
---

Content`;

      expect(() => parseFrontmatter(markdown)).toThrow(
        'Invalid frontmatter: learningObjectives must be an array'
      );
    });

    it('should parse empty arrays for learningObjectives and tags', () => {
      const markdown = `---
title: Test
summary: Test summary
duration: 5 minutes
active: true
difficulty: beginner
learningObjectives: []
tags: []
---

Content`;

      const result = parseFrontmatter(markdown);

      expect(result.metadata.learningObjectives).toEqual([]);
      expect(result.metadata.tags).toEqual([]);
    });

    it('should handle quoted string values', () => {
      const markdown = `---
title: "Test Title"
summary: 'Test Summary'
duration: 5 minutes
active: true
difficulty: beginner
learningObjectives:
- "Objective 1"
tags:
- 'tag1'
---

Content`;

      const result = parseFrontmatter(markdown);

      expect(result.metadata.title).toBe('Test Title');
      expect(result.metadata.summary).toBe('Test Summary');
      expect(result.metadata.learningObjectives[0]).toBe('Objective 1');
      expect(result.metadata.tags[0]).toBe('tag1');
    });
  });

  describe('extractLessonOrder', () => {
    it('should extract order from valid lesson filename', () => {
      expect(extractLessonOrder('lesson_1.md')).toBe(1);
      expect(extractLessonOrder('lesson_5.md')).toBe(5);
      expect(extractLessonOrder('lesson_42.md')).toBe(42);
    });

    it('should throw error for invalid filename format', () => {
      expect(() => extractLessonOrder('lesson.md')).toThrow(
        'Invalid lesson filename format: lesson.md'
      );

      expect(() => extractLessonOrder('lesson_a.md')).toThrow(
        'Invalid lesson filename format: lesson_a.md'
      );

      expect(() => extractLessonOrder('lesson_1.txt')).toThrow(
        'Invalid lesson filename format: lesson_1.txt'
      );

      expect(() => extractLessonOrder('1.md')).toThrow(
        'Invalid lesson filename format: 1.md'
      );
    });
  });

  describe('extractLessonId', () => {
    it('should extract lesson ID from valid filename', () => {
      expect(extractLessonId('lesson_1.md')).toBe('lesson_1');
      expect(extractLessonId('lesson_5.md')).toBe('lesson_5');
      expect(extractLessonId('lesson_99.md')).toBe('lesson_99');
    });

    it('should throw error for invalid filename format', () => {
      expect(() => extractLessonId('lesson.md')).toThrow(
        'Invalid lesson filename format: lesson.md'
      );

      expect(() => extractLessonId('lesson_a.md')).toThrow(
        'Invalid lesson filename format: lesson_a.md'
      );

      expect(() => extractLessonId('lesson_1.txt')).toThrow(
        'Invalid lesson filename format: lesson_1.txt'
      );

      expect(() => extractLessonId('1.md')).toThrow(
        'Invalid lesson filename format: 1.md'
      );
    });
  });
});
