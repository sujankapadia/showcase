#!/usr/bin/env node

// Fetches monolog/posts.md from tracked GitHub repos, merges them
// chronologically, and runs monolog to generate an HTML fragment
// for the /updates page.

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// --- Step 1: Read config ---
const configPath = resolve(ROOT, 'updates.config.yaml');
if (!existsSync(configPath)) {
  console.error('[ERROR] updates.config.yaml not found');
  process.exit(1);
}
const config = yaml.load(readFileSync(configPath, 'utf-8'));

if (!config.repos || config.repos.length === 0) {
  console.error('[ERROR] No repos configured in updates.config.yaml');
  process.exit(1);
}

// --- Step 2: Fetch posts.md from each repo ---
async function fetchPostsFile(repo) {
  const { url, name } = repo;
  const postsPath = repo.path || 'monolog/posts.md';
  const branch = repo.branch || 'main';

  // Derive owner/repo from URL
  const match = url.match(/github\.com\/([^/]+\/[^/]+)/);
  if (!match) {
    console.warn(`[WARN] Invalid GitHub URL for ${name}: ${url}`);
    return null;
  }
  const ownerRepo = match[1].replace(/\.git$/, '');

  // Try gh api first (handles private repos via auth)
  try {
    const apiPath = `repos/${ownerRepo}/contents/${postsPath}?ref=${branch}`;
    const result = execSync(`gh api ${apiPath} --jq '.content'`, {
      encoding: 'utf-8',
      timeout: 15000,
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();

    const content = Buffer.from(result, 'base64').toString('utf-8');
    console.log(`[OK] Fetched ${postsPath} from ${name} (via gh api)`);
    return { name, content };
  } catch {
    // Fallback: raw.githubusercontent.com (public repos only)
    try {
      const rawUrl = `https://raw.githubusercontent.com/${ownerRepo}/${branch}/${postsPath}`;
      const response = await fetch(rawUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const content = await response.text();
      console.log(`[OK] Fetched ${postsPath} from ${name} (via raw URL)`);
      return { name, content };
    } catch (fetchError) {
      console.warn(`[WARN] Could not fetch posts from ${name}: ${fetchError.message}`);
      console.warn(`       Skipping this repo.`);
      return null;
    }
  }
}

// --- Step 3: Extract individual posts from a posts.md file ---
function extractPosts(content, projectName) {
  // Split on +++ delimiters to find YAML front matter blocks
  // Pattern: +++\n<yaml>\n+++ followed by content until next +++ or EOF
  const blocks = content.split(/^\+\+\+\s*$/m);

  // blocks[0] = anything before first +++
  // blocks[1] = first YAML (site metadata)
  // blocks[2] = content after site metadata (before next +++)
  // blocks[3] = second YAML (first post metadata)
  // blocks[4] = content after first post metadata
  // ...

  if (blocks.length < 4) {
    console.warn(`[WARN] ${projectName}: No posts found (need site metadata + at least 1 post)`);
    return [];
  }

  const posts = [];

  // Skip blocks[0] (before first +++) and blocks[1]+[2] (site metadata + its trailing content)
  // Posts start at index 3 (YAML), 4 (content), 5 (YAML), 6 (content), ...
  for (let i = 3; i < blocks.length; i += 2) {
    const yamlBlock = blocks[i];
    const contentBlock = (blocks[i + 1] || '').trim();

    if (!yamlBlock.trim()) continue;

    // Parse date from YAML for sorting
    const dateMatch = yamlBlock.match(/date:\s*(.+)/);
    const dateStr = dateMatch ? dateMatch[1].trim().replace(/["']/g, '') : '1970-01-01';

    posts.push({
      yaml: yamlBlock.trim(),
      content: contentBlock,
      projectName,
      date: dateStr,
    });
  }

  return posts;
}

// --- Step 4: Main ---
async function main() {
  console.log('Building project updates...\n');

  // Fetch all repos in parallel
  const results = await Promise.all(config.repos.map((repo) => fetchPostsFile(repo)));

  // Filter out failures
  const successful = results.filter(Boolean);

  if (successful.length === 0) {
    console.warn('[WARN] No repos returned posts. Generating empty updates page.');
    // Write empty merged file so the Astro page can gracefully show "no updates"
    const mergedPath = resolve(ROOT, 'src', 'data', 'updates-merged.md');
    writeFileSync(mergedPath, '', 'utf-8');
    const outputPath = resolve(ROOT, 'src', 'data', 'updates-output.html');
    writeFileSync(outputPath, '', 'utf-8');
    return;
  }

  // Extract and tag posts from each repo
  let allPosts = [];
  for (const { name, content } of successful) {
    const posts = extractPosts(content, name);
    allPosts.push(...posts);
  }

  if (allPosts.length === 0) {
    console.warn('[WARN] No posts found across all repos. Generating empty updates page.');
    const mergedPath = resolve(ROOT, 'src', 'data', 'updates-merged.md');
    writeFileSync(mergedPath, '', 'utf-8');
    const outputPath = resolve(ROOT, 'src', 'data', 'updates-output.html');
    writeFileSync(outputPath, '', 'utf-8');
    return;
  }

  // Sort by date descending (newest first)
  allPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  console.log(`\nMerged ${allPosts.length} posts from ${successful.length} repo(s).\n`);

  // --- Step 5: Build merged posts.md ---
  let merged = '';

  // Site metadata block
  merged += '+++\n';
  merged += `site_title: "${config.site_title}"\n`;
  merged += `author: ${config.author}\n`;
  merged += '+++\n\n';

  // Post blocks with project badge injected into content
  for (const post of allPosts) {
    merged += '+++\n';
    merged += post.yaml + '\n';
    merged += '+++\n\n';

    // Inject project badge as raw HTML at the start of content
    const badge = `<span class="project-badge">${post.projectName}</span>\n\n`;
    merged += badge;

    if (post.content) {
      merged += post.content + '\n\n';
    }
  }

  const mergedPath = resolve(ROOT, 'src', 'data', 'updates-merged.md');
  writeFileSync(mergedPath, merged, 'utf-8');
  console.log(`Wrote merged posts to: src/data/updates-merged.md`);

  // --- Step 6: Run monolog CLI ---
  const templatePath = resolve(ROOT, 'templates', 'updates-template.html');
  const outputPath = resolve(ROOT, 'src', 'data', 'updates-output.html');

  if (!existsSync(templatePath)) {
    console.error(`[ERROR] Template not found: ${templatePath}`);
    process.exit(1);
  }

  const cmd = `npx monolog -i "${mergedPath}" -o "${outputPath}" -t "${templatePath}" --permalinks`;
  console.log(`Running: ${cmd}\n`);

  try {
    execSync(cmd, { encoding: 'utf-8', stdio: 'inherit' });
    console.log(`\nGenerated updates HTML: src/data/updates-output.html`);
  } catch (error) {
    console.error('[ERROR] monolog CLI failed:', error.message);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
