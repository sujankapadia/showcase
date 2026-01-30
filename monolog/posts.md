+++
site_title: "Showcase Updates"
author: Sujan Kapadia
+++

+++
title: "Automating the Data Pipeline"
date: 2026-01-29
+++

The showcase site pulls data from several sources — GitHub, YouTube, LinkedIn, Chariot Solutions, and Medium. Initially, most of this was collected through one-off web scrapes and CLI commands. This week I built automated refresh scripts for each data source.

**GitHub repos** and **YouTube videos** were straightforward — `gh repo list` and `yt-dlp` with a playlist ID give clean, structured output every time.

**LinkedIn** required the `csv-parse` library to correctly handle multiline quoted fields in the LinkedIn export CSV.

**Chariot Solutions content** was the most interesting. I first tried using the **Claude Agent SDK** to replicate how the data was originally collected — having an LLM extract items from search result pages via WebFetch. It worked, but each run returned a different set of items (~59-62 out of 75). The small model inside WebFetch is non-deterministic. Switching to **cheerio** with CSS selectors gave a perfect 74/74 match every time. The script also fetches publication dates from individual post pages, caching them so subsequent runs skip already-dated entries.

Lesson: LLM-based extraction is great for one-off exploration, but for repeatable data pipelines, deterministic HTML parsing wins.

*This post was produced by Claude Code.*

+++
title: "Building the Showcase Site"
date: 2026-01-25
+++

Started building the personal showcase website using **Astro 5** and **Tailwind CSS v4**. The dark theme is inspired by astro.build's design with navy backgrounds and cyan/purple accents.

The site aggregates content from multiple sources:
- LinkedIn posts
- Medium articles
- GitHub repositories
- Speaking engagements
