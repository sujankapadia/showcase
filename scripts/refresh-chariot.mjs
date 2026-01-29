#!/usr/bin/env node

// Refreshes Chariot Solutions content data by scraping search results.
// Uses cheerio for deterministic HTML parsing.
// Merges with manual entries from chariot_content_manual.csv.
// Fetches publication dates from individual post pages (skips URLs already dated).
// Requires: network access to chariotsolutions.com
// Writes to: raw-data/chariot_content.csv

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';
import * as cheerio from 'cheerio';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUTPUT = resolve(ROOT, 'raw-data', 'chariot_content.csv');
const MANUAL = resolve(ROOT, 'raw-data', 'chariot_content_manual.csv');

const BASE_URL = 'https://chariotsolutions.com';
const SEARCH_URL = `${BASE_URL}/?s=sujan`;
const MAX_PAGES = 20; // Safety limit

// Content types to include (from WordPress article classes like "type-blog")
const VALID_TYPES = new Set(['blog', 'podcast', 'event', 'news', 'presentation', 'webinar', 'video']);

// Map WordPress type slugs to display labels
const TYPE_LABELS = {
  blog: 'Blog',
  podcast: 'Podcast',
  event: 'Event',
  news: 'News',
  presentation: 'Presentation',
  webinar: 'Webinar',
  video: 'Video',
};

const HEADERS = ['Title', 'URL', 'Type', 'Description', 'Date'];

function toCsvRow(obj) {
  return HEADERS
    .map((f) => {
      const val = obj[f] || '';
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    })
    .join(',');
}

function loadExistingData() {
  if (!existsSync(OUTPUT)) return new Map();
  const content = readFileSync(OUTPUT, 'utf-8').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const rows = parse(content, { columns: true, skip_empty_lines: true });
  const map = new Map();
  for (const row of rows) {
    map.set(row.URL, row);
  }
  return map;
}

function loadManualEntries() {
  if (!existsSync(MANUAL)) return [];
  const content = readFileSync(MANUAL, 'utf-8').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  return parse(content, { columns: true, skip_empty_lines: true });
}

function extractItems(html) {
  const $ = cheerio.load(html);
  const items = [];

  $('article').each((_i, el) => {
    const classes = $(el).attr('class') || '';
    const typeMatch = classes.match(/type-(\w+)/);
    const type = typeMatch ? typeMatch[1] : 'unknown';

    // Skip non-content types (e.g. "page" for bio pages)
    if (!VALID_TYPES.has(type)) return;

    const titleEl = $(el).find('.entry-title a');
    const title = titleEl.text().trim();
    const url = titleEl.attr('href') || '';
    const description = $(el).find('.entry-summary p').first().text().trim();

    // Clean up description — remove "Podcast: Play in new window..." prefix
    const cleanDesc = description
      .replace(/^Podcast:\s*Play in new window\s*\|\s*Download\s*\([^)]*\)\s*\|\s*Embed\s*/i, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (title && url) {
      items.push({
        Title: title,
        URL: url,
        Type: TYPE_LABELS[type] || type,
        Description: cleanDesc,
        Date: '',
      });
    }
  });

  return items;
}

function getNextPageUrl(html) {
  const $ = cheerio.load(html);
  const next = $('.nav-links a').filter((_i, el) => $(el).text().includes('Next'));
  return next.attr('href') || null;
}

async function fetchDate(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) return '';
    const html = await response.text();
    const $ = cheerio.load(html);
    const datetime = $('time.entry-date').attr('datetime') || $('time').first().attr('datetime') || '';
    if (!datetime) return '';
    // Extract YYYY-MM-DD from ISO datetime
    return datetime.substring(0, 10);
  } catch {
    return '';
  }
}

console.log('Refreshing Chariot Solutions content...\n');

// Load existing data to preserve dates already fetched
const existing = loadExistingData();
console.log(`Existing entries with dates: ${[...existing.values()].filter(r => r.Date).length}`);

// Scrape search results
const allItems = [];
const seenUrls = new Set();
let currentUrl = SEARCH_URL;

for (let page = 1; page <= MAX_PAGES; page++) {
  console.log(`  Fetching page ${page}: ${currentUrl}`);

  const response = await fetch(currentUrl);
  if (!response.ok) {
    console.log(`  HTTP ${response.status} — stopping`);
    break;
  }

  const html = await response.text();
  const items = extractItems(html);

  if (items.length === 0) {
    console.log('  No items found — stopping');
    break;
  }

  // Deduplicate by URL, preserve existing dates
  for (const item of items) {
    if (!seenUrls.has(item.URL)) {
      seenUrls.add(item.URL);
      const prev = existing.get(item.URL);
      if (prev?.Date) {
        item.Date = prev.Date;
      }
      allItems.push(item);
    }
  }

  console.log(`  Found ${items.length} items (${allItems.length} total)`);

  const nextUrl = getNextPageUrl(html);
  if (!nextUrl) {
    console.log('  No next page — done');
    break;
  }
  currentUrl = nextUrl;
}

// Merge manual entries (additive — only URLs not already present)
const manualEntries = loadManualEntries();
let manualAdded = 0;
for (const entry of manualEntries) {
  if (!seenUrls.has(entry.URL)) {
    seenUrls.add(entry.URL);
    const prev = existing.get(entry.URL);
    if (prev?.Date && !entry.Date) {
      entry.Date = prev.Date;
    }
    allItems.push({ Title: entry.Title, URL: entry.URL, Type: entry.Type, Description: entry.Description || '', Date: entry.Date || '' });
    manualAdded++;
  }
}
if (manualEntries.length > 0) {
  console.log(`\nManual entries: ${manualEntries.length} total, ${manualAdded} new`);
}

// Fetch dates for entries that haven't been checked yet
// "none" marks entries where we checked but no date was found on the page
const needDates = allItems.filter((item) => !item.Date);
if (needDates.length > 0) {
  console.log(`\nFetching dates for ${needDates.length} entries...`);
  for (let i = 0; i < needDates.length; i++) {
    const item = needDates[i];
    process.stdout.write(`  [${i + 1}/${needDates.length}] ${item.Title.substring(0, 50)}...`);
    const date = await fetchDate(item.URL);
    item.Date = date || 'none';
    console.log(date || '(no date found)');
  }
} else {
  console.log('\nAll entries already have dates.');
}

console.log(`\nTotal unique items: ${allItems.length}`);

// Write CSV
const csvLines = [HEADERS.join(','), ...allItems.map(toCsvRow)];
writeFileSync(OUTPUT, csvLines.join('\n') + '\n', 'utf-8');
console.log(`Wrote ${allItems.length} items to raw-data/chariot_content.csv`);
