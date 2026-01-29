# Sujan Kapadia - Personal Showcase

Personal showcase website for networking, thought leadership visibility, consulting leads, and career opportunities.

## Tech Stack

- **Framework:** [Astro](https://astro.build/) v5
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) v4
- **Typography:** Inter font
- **Theme:** Dark-only, Astro.build-inspired (navy backgrounds, purple/cyan accents)
- **Hosting:** [Netlify](https://netlify.com/)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Fetch project updates from tracked repos and generate HTML
npm run build:updates

# Build for production (runs build:updates automatically)
npm run build

# Preview production build
npm run preview
```

The development server runs at `http://localhost:4321`.

## Project Structure

```
├── scripts/
│   └── build-updates.mjs   # Fetches & merges monolog posts from tracked repos
├── templates/
│   └── updates-template.html # Monolog template for /updates page
├── monolog/
│   └── posts.md             # This repo's own microblog posts
├── updates.config.yaml      # Config listing GitHub repos to track
├── src/
│   ├── components/
│   │   ├── Header.astro     # Navigation
│   │   └── Footer.astro     # Social links and quick links
│   ├── layouts/
│   │   └── BaseLayout.astro # Base template with head slot
│   ├── pages/
│   │   ├── index.astro      # Homepage
│   │   ├── about.astro      # Bio and focus areas
│   │   ├── writing.astro    # Posts from LinkedIn, Medium, Chariot
│   │   ├── speaking.astro   # Speaking engagements
│   │   ├── projects.astro   # GitHub repositories
│   │   ├── updates.astro    # Aggregated project updates (via monolog)
│   │   ├── media.astro      # Videos and podcasts
│   │   ├── consulting.astro # Services offered
│   │   └── contact.astro    # Contact form
│   ├── data/                # JSON data files (generated from CSV)
│   │   ├── linkedin-posts.json
│   │   ├── github-repos.json
│   │   ├── youtube-videos.json
│   │   ├── medium-articles.json
│   │   ├── chariot-content.json
│   │   └── speaking.json
│   └── styles/
│       └── global.css       # Tailwind config and custom styles
└── public/
    └── headshot.jpg         # Profile photo
```

## Data Sources

| Source | File | Items | Usage |
|--------|------|-------|-------|
| LinkedIn Posts | `linkedin-posts.json` | 43 | Homepage, Writing page |
| GitHub Repos | `github-repos.json` | 21 | Homepage, Projects page |
| YouTube Videos | `youtube-videos.json` | 31 | Media page |
| Medium Articles | `medium-articles.json` | 9 | Writing page |
| Chariot Content | `chariot-content.json` | 75 | Writing, Media pages |
| Speaking Events | `speaking.json` | 9 | Speaking page |

### Updating Data

1. Export fresh data from source (LinkedIn, GitHub, etc.)
2. Place CSV files in project root
3. Run conversion script to update JSON:

```bash
python3 << 'EOF'
import csv, json
from pathlib import Path

def csv_to_json(csv_path, json_path):
    with open(csv_path) as f:
        data = list(csv.DictReader(f))
    with open(json_path, 'w') as f:
        json.dump(data, f, indent=2)

# Add conversion commands as needed
EOF
```

4. Rebuild the site

## Project Updates (`/updates`)

The `/updates` page aggregates microblog posts from tracked GitHub repositories using [monolog](https://github.com/sujankapadia/monolog).

**How it works:**
1. `updates.config.yaml` lists GitHub repos to track
2. Each tracked repo has a `monolog/posts.md` file with microblog posts
3. `npm run build:updates` fetches each repo's posts via the GitHub API, merges them chronologically, and runs monolog to generate HTML
4. The Astro page embeds the generated HTML within the site layout

**Adding a tracked repo:**
```yaml
# updates.config.yaml
repos:
  - url: https://github.com/owner/repo
    name: Display Name
    # branch: main        # optional, defaults to main
    # path: monolog/posts.md  # optional, defaults to monolog/posts.md
```

## Features

- **Dark theme** - Astro.build-inspired design with navy, purple, and cyan accents
- **Responsive design** - Mobile-first with tablet and desktop breakpoints
- **Dynamic content** - Pages load from JSON data files
- **Project updates** - Aggregated microblog posts from tracked repos via monolog
- **External links** - Open in new tabs with visual indicators
- **Hover effects** - Cards lift with shadow on hover
- **SEO ready** - Meta tags and Open Graph support

## License

All rights reserved.
