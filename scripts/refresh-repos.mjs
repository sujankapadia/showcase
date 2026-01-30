#!/usr/bin/env node

// Fetches repository data from GitHub via the gh CLI
// and writes it to raw-data/github_repos.csv.
// Run scripts/csv-to-json.mjs afterwards to convert to JSON for the Astro build.

import { writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUTPUT = resolve(ROOT, 'raw-data', 'github_repos.csv');

const GITHUB_USER = 'sujankapadia';

console.log(`Fetching repos for ${GITHUB_USER}...\n`);

try {
  const raw = execSync(
    `gh repo list ${GITHUB_USER} --json name,description,url,primaryLanguage,stargazerCount,forkCount,isPrivate,createdAt,updatedAt --limit 100`,
    { encoding: 'utf-8', timeout: 15000 }
  );

  const repos = JSON.parse(raw);

  // Build CSV
  const header = 'Name,Description,URL,Language,Stars,Forks,Private,Created,Updated';
  const rows = repos.map((repo) => {
    const lang = repo.primaryLanguage?.name || '';
    const desc = (repo.description || '').replace(/"/g, '""');
    return [
      repo.name,
      `"${desc}"`,
      repo.url,
      lang,
      repo.stargazerCount,
      repo.forkCount,
      repo.isPrivate ? 'True' : 'False',
      repo.createdAt.slice(0, 10),
      repo.updatedAt.slice(0, 10),
    ].join(',');
  });

  const csv = [header, ...rows].join('\n') + '\n';
  writeFileSync(OUTPUT, csv, 'utf-8');
  console.log(`Wrote ${repos.length} repos to raw-data/github_repos.csv`);
} catch (error) {
  console.error('[ERROR] Failed to fetch repos:', error.message);
  process.exit(1);
}
