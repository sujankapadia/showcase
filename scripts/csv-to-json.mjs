#!/usr/bin/env node

// Converts CSV files in raw-data/ to JSON files in src/data/
// for consumption by the Astro build.

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const RAW_DATA = resolve(ROOT, 'raw-data');
const DATA_DIR = resolve(ROOT, 'src', 'data');

// Map CSV filenames to their JSON output names
const FILES = [
  { csv: 'github_repos.csv', json: 'github-repos.json' },
  { csv: 'linkedin_ai_posts.csv', json: 'linkedin-posts.json' },
  { csv: 'medium_articles.csv', json: 'medium-articles.json' },
  { csv: 'youtube_videos.csv', json: 'youtube-videos.json' },
  { csv: 'chariot_content.csv', json: 'chariot-content.json' },
  { csv: 'speaking_engagements.csv', json: 'speaking.json' },
];

console.log('Converting CSV files to JSON...\n');

let converted = 0;

for (const { csv, json } of FILES) {
  const csvPath = resolve(RAW_DATA, csv);
  const jsonPath = resolve(DATA_DIR, json);

  if (!existsSync(csvPath)) {
    console.log(`  [SKIP] ${csv} not found`);
    continue;
  }

  const content = readFileSync(csvPath, 'utf-8').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const data = parse(content, { columns: true, skip_empty_lines: true });
  writeFileSync(jsonPath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  console.log(`  [OK] ${csv} → ${json} (${data.length} records)`);
  converted++;
}

console.log(`\nConverted ${converted} file(s).`);
