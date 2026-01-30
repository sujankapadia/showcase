#!/usr/bin/env node

// Refreshes Medium articles data from the RSS feed.
// Uses cheerio to parse the XML feed.
// Requires: network access to medium.com
// Writes to: raw-data/medium_articles.csv

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUTPUT = resolve(ROOT, 'raw-data', 'medium_articles.csv');

const FEED_URL = 'https://medium.com/feed/@sujankapadia';

const HEADERS = ['Title', 'URL', 'Date', 'Tags'];

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

console.log('Refreshing Medium articles...\n');
console.log(`Feed: ${FEED_URL}`);

const response = await fetch(FEED_URL);
if (!response.ok) {
  console.error(`[ERROR] HTTP ${response.status} fetching RSS feed`);
  process.exit(1);
}

const xml = await response.text();
const $ = cheerio.load(xml, { xmlMode: true });

const articles = [];

$('item').each((_i, el) => {
  const title = $(el).find('title').text();
  const link = $(el).find('link').text().split('?')[0]; // strip tracking params
  const date = $(el).find('pubDate').text();
  const tags = [];
  $(el).find('category').each((_j, cat) => tags.push($(cat).text()));

  if (title && link) {
    articles.push({
      Title: title,
      URL: link,
      Date: date,
      Tags: tags.join(', '),
    });
  }
});

console.log(`Articles found: ${articles.length}`);

// Write CSV
const csvLines = [HEADERS.join(','), ...articles.map(toCsvRow)];
writeFileSync(OUTPUT, csvLines.join('\n') + '\n', 'utf-8');
console.log(`\nWrote ${articles.length} articles to raw-data/medium_articles.csv`);
