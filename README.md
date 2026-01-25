# Sujan Kapadia - Personal Showcase

Personal showcase website for networking, thought leadership visibility, consulting leads, and career opportunities.

## Tech Stack

- **Framework:** [Astro](https://astro.build/) v5
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) v4
- **Typography:** Inter font
- **Theme:** Dark/light mode with system preference detection

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The development server runs at `http://localhost:4321`.

## Project Structure

```
src/
├── components/
│   ├── Header.astro      # Navigation with dark mode toggle
│   └── Footer.astro      # Social links and quick links
├── layouts/
│   └── BaseLayout.astro  # Base template with theme detection
├── pages/
│   ├── index.astro       # Homepage
│   ├── about.astro       # Bio and focus areas
│   ├── writing.astro     # Posts from LinkedIn, Medium, Chariot
│   ├── speaking.astro    # Speaking engagements
│   ├── projects.astro    # GitHub repositories
│   ├── media.astro       # Videos and podcasts
│   ├── consulting.astro  # Services offered
│   └── contact.astro     # Contact form
├── data/                 # JSON data files (generated from CSV)
│   ├── linkedin-posts.json
│   ├── github-repos.json
│   ├── youtube-videos.json
│   ├── medium-articles.json
│   ├── chariot-content.json
│   └── speaking.json
└── styles/
    └── global.css        # Tailwind config and custom styles
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

## Features

- **Responsive design** - Mobile-first with tablet and desktop breakpoints
- **Dark mode** - System preference with manual toggle
- **Dynamic content** - Pages load from JSON data files
- **External links** - Open in new tabs with visual indicators
- **Hover effects** - Cards lift with shadow on hover
- **SEO ready** - Meta tags and Open Graph support

## License

All rights reserved.
