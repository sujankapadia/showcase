#!/usr/bin/env node

// Curates AI-focused LinkedIn posts from the full LinkedIn export.
// Takes the most recent 50 posts and filters by AI-related keywords.
// Reads from: linkedin/complete-export/Shares.csv
// Writes to:  raw-data/linkedin_ai_posts.csv

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const INPUT = resolve(ROOT, 'linkedin', 'complete-export', 'Shares.csv');
const OUTPUT = resolve(ROOT, 'raw-data', 'linkedin_ai_posts.csv');

if (!existsSync(INPUT)) {
  console.error(`[ERROR] LinkedIn export not found: ${INPUT}`);
  console.error('        Place your LinkedIn export at linkedin/complete-export/');
  process.exit(1);
}

const AI_KEYWORDS = [
  'ai', 'artificial intelligence', 'machine learning', 'ml', 'llm', 'gpt',
  'claude', 'openai', 'anthropic', 'gemini', 'agent', 'chatgpt', 'neural',
  'deep learning', 'model', 'prompt', 'token', 'embedding', 'inference',
];

function toCsvRow(headers, obj) {
  return headers
    .map((h) => {
      const val = obj[h] || '';
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    })
    .join(',');
}

console.log('Curating AI-focused LinkedIn posts...\n');

const content = readFileSync(INPUT, 'utf-8').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
const rows = parse(content, { columns: true, skip_empty_lines: true });

console.log(`Total posts in export: ${rows.length}`);

// Take most recent 50 (already sorted by date descending in LinkedIn export)
const recent50 = rows.slice(0, 50);
console.log(`Most recent 50 posts selected`);

// Filter by AI keywords
const aiPosts = recent50.filter((row) => {
  const text = (row['ShareCommentary'] || '').toLowerCase();
  return AI_KEYWORDS.some((kw) => text.includes(kw));
});

console.log(`AI-related posts found: ${aiPosts.length}`);

// Write curated CSV
const headers = Object.keys(rows[0]);
const csvLines = [headers.join(','), ...aiPosts.map((row) => toCsvRow(headers, row))];
writeFileSync(OUTPUT, csvLines.join('\n') + '\n', 'utf-8');
console.log(`\nWrote ${aiPosts.length} curated posts to raw-data/linkedin_ai_posts.csv`);
