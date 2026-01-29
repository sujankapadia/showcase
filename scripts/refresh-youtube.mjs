#!/usr/bin/env node

// Refreshes YouTube video data from a playlist using yt-dlp.
// Requires: yt-dlp (brew install yt-dlp)
// Writes to: raw-data/youtube_videos.csv

import { writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUTPUT = resolve(ROOT, 'raw-data', 'youtube_videos.csv');

const PLAYLIST_ID = 'PLloqgzEeMq16Lp9wKyqn31rOu0JhcokT4';
const PLAYLIST_URL = `https://www.youtube.com/playlist?list=${PLAYLIST_ID}`;

// Check yt-dlp is installed
try {
  execSync('which yt-dlp', { stdio: 'ignore' });
} catch {
  console.error('[ERROR] yt-dlp is not installed. Install with: brew install yt-dlp');
  process.exit(1);
}

console.log('Fetching YouTube playlist data...\n');
console.log(`Playlist: ${PLAYLIST_URL}`);

// Fetch URL and title for each video in the playlist
const raw = execSync(
  `yt-dlp --flat-playlist --print "%(url)s\t%(title)s" "${PLAYLIST_URL}" 2>/dev/null`,
  { encoding: 'utf-8', timeout: 60000 }
).trim();

const lines = raw.split('\n').filter(Boolean);
console.log(`Videos found: ${lines.length}`);

// Build CSV with proper escaping
const csvRows = ['URL,Title'];
for (const line of lines) {
  const [url, ...titleParts] = line.split('\t');
  const title = titleParts.join('\t');
  // CSV-escape the title (may contain commas, quotes)
  if (title.includes(',') || title.includes('"') || title.includes('\n')) {
    csvRows.push(`${url},"${title.replace(/"/g, '""')}"`);
  } else {
    csvRows.push(`${url},${title}`);
  }
}

writeFileSync(OUTPUT, csvRows.join('\n') + '\n', 'utf-8');
console.log(`\nWrote ${lines.length} videos to raw-data/youtube_videos.csv`);
