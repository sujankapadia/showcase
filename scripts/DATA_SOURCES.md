# Data Sources & Refresh Procedures

Documents how each data file in `raw-data/` was originally sourced and how to refresh it.

## Overview

| CSV File | Records | Source | Refresh Method |
|----------|---------|--------|----------------|
| `github_repos.csv` | 22 | GitHub API (`gh` CLI) | `npm run refresh:repos` |
| `youtube_videos.csv` | 31 | YouTube playlist (`yt-dlp`) | `npm run refresh:youtube` |
| `linkedin_ai_posts.csv` | 43 | LinkedIn export + AI keyword curation | `npm run curate:linkedin` (requires fresh export) |
| `chariot_content.csv` | 75 | Chariot Solutions website scrape | `npm run refresh:chariot` |
| `medium_articles.csv` | 9 | Medium RSS feed | `npm run refresh:medium` |
| `speaking_engagements.csv` | 9 | Web research + manual additions | Manual (see below) |

## Pipeline

```
raw-data/*.csv  -->  npm run csv-to-json  -->  src/data/*.json  -->  Astro build
```

All CSV files are converted to JSON via `npm run csv-to-json` (`scripts/csv-to-json.mjs`), which uses the `csv-parse` library for robust handling of multiline quoted fields.

---

## Automated Refresh

### GitHub Repos
- **Script:** `scripts/refresh-repos.mjs`
- **Command:** `npm run refresh:repos`
- **Source:** GitHub API via `gh repo list sujankapadia`
- **Requires:** `gh` CLI authenticated
- **Notes:** Outputs `True`/`False` for Private field (not `true`/`false`) to match site code that filters on `r.Private === 'False'`.

### YouTube Videos
- **Script:** `scripts/refresh-youtube.mjs`
- **Command:** `npm run refresh:youtube`
- **Source:** YouTube playlist via `yt-dlp`
- **Playlist ID:** `PLloqgzEeMq16Lp9wKyqn31rOu0JhcokT4`
- **Requires:** `yt-dlp` (`brew install yt-dlp`). Playlist must be unlisted or public.

### LinkedIn AI Posts
- **Script:** `scripts/curate-linkedin.mjs`
- **Command:** `npm run curate:linkedin`
- **Source:** LinkedIn data export (`linkedin/complete-export/Shares.csv`)
- **Process:**
  1. Download a fresh LinkedIn data export (Settings > Get a copy of your data)
  2. Place the `Shares.csv` file at `linkedin/complete-export/Shares.csv`
  3. Run the curation script — takes the 50 most recent posts and filters by AI-related keywords
- **AI Keywords:** ai, artificial intelligence, machine learning, ml, llm, gpt, claude, openai, anthropic, gemini, agent, chatgpt, neural, deep learning, model, prompt, token, embedding, inference

### Chariot Solutions Content
- **Script:** `scripts/refresh-chariot.mjs`
- **Command:** `npm run refresh:chariot`
- **Source:** Scraped from `https://chariotsolutions.com/?s=sujan` using `cheerio` CSS selectors
- **Requires:** Network access to chariotsolutions.com
- **Content types:** Blog posts, Podcasts/TechChat episodes, Events, News, and more
- **Columns:** Title, URL, Type, Description, Date
- **Date fetching:** Dates are extracted from individual post pages (`<time>` element). Cached in the CSV so subsequent runs only fetch dates for new entries. Pages without dates are marked `none` to avoid re-fetching.
- **Manual entries:** Additional entries not found in search results can be added to `raw-data/chariot_content_manual.csv`. The script merges these in (additive only, matched by URL).
- **Notes:** Follows pagination automatically. Filters out non-content types (e.g., staff profile pages). Deterministic — produces identical output on every run.

### Medium Articles
- **Script:** `scripts/refresh-medium.mjs`
- **Command:** `npm run refresh:medium`
- **Source:** Medium RSS feed at `https://medium.com/feed/@sujankapadia` parsed with `cheerio` (XML mode)
- **Requires:** Network access to medium.com
- **Columns:** Title, URL, Date, Tags
- **Notes:** Medium blocks direct HTML scraping (403), so the RSS feed is used instead. Strips tracking query parameters from URLs.

---

## Manual Refresh

### Speaking Engagements
- **File:** `raw-data/speaking_engagements.csv`
- **Original source:** Web research by Claude (searched for Sujan Kapadia speaking engagements) + 3 events added manually by user
- **Columns:** Title, Date, Type, Role, Location, Description, URL
- **To refresh:** Manually add new engagements as they occur. Verify dates are accurate (Claude's web research produced one incorrect year).
- **Note on dates:** One entry uses `2016-05-00` for unknown day — the site handles this with `.replace('-00', '-01')`.

---

## Build Integration

The full build pipeline runs:
```bash
npm run build    # runs build:updates && astro build
```

To refresh all automated data and rebuild:
```bash
npm run refresh:repos
npm run refresh:youtube
npm run refresh:chariot
npm run refresh:medium
npm run csv-to-json
npm run build
```
