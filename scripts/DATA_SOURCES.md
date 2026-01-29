# Data Sources & Refresh Procedures

Documents how each data file in `raw-data/` was originally sourced and how to refresh it.

## Overview

| CSV File | Records | Source | Refresh Method |
|----------|---------|--------|----------------|
| `github_repos.csv` | 22 | GitHub API (`gh` CLI) | `npm run refresh:repos` |
| `youtube_videos.csv` | 31 | YouTube playlist (`yt-dlp`) | `npm run refresh:youtube` |
| `linkedin_ai_posts.csv` | 43 | LinkedIn export + AI keyword curation | `npm run curate:linkedin` (requires fresh export) |
| `chariot_content.csv` | 75 | Chariot Solutions website scrape | Manual (see below) |
| `medium_articles.csv` | 9 | Medium profile scrape | Manual (see below) |
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
- **Command:** `npm run curate:linkedin` *(not yet wired up)*
- **Source:** LinkedIn data export (`linkedin/complete-export/Shares.csv`)
- **Process:**
  1. Download a fresh LinkedIn data export (Settings > Get a copy of your data)
  2. Place the `Shares.csv` file at `linkedin/complete-export/Shares.csv`
  3. Run the curation script — takes the 50 most recent posts and filters by AI-related keywords
- **AI Keywords:** ai, artificial intelligence, machine learning, ml, llm, gpt, claude, openai, anthropic, gemini, agent, chatgpt, neural, deep learning, model, prompt, token, embedding, inference

---

## Manual Refresh

### Chariot Solutions Content
- **File:** `raw-data/chariot_content.csv`
- **Original source:** Scraped from `https://chariotsolutions.com/?s=sujan` (pages 1-8) using Claude's WebFetch tool
- **Content types:** Blog posts (13), Podcasts/TechChat episodes (49), Events (5), News (2), Other (6)
- **Columns:** Title, URL, Type, Description
- **To refresh:** Search `chariotsolutions.com/?s=sujan` and extract all results. Each result has a title, URL, content type, and description. Compare against existing CSV for new entries.

### Medium Articles
- **File:** `raw-data/medium_articles.csv`
- **Original source:** Scraped from `https://medium.com/@sujankapadia` profile page using Claude's WebFetch tool
- **Columns:** Title, URL, Date, Tags
- **To refresh:** Visit the Medium profile page and extract article titles, URLs, publication dates, and tags. Compare against existing CSV for new entries.

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
npm run csv-to-json
npm run build
```
