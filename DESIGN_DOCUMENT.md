# Personal Showcase Website - Design Document

## Project Overview

**Purpose:** Personal showcase website for networking, thought leadership visibility, consulting leads, and career opportunities.

**Domain:** sujankapadia.com (or similar)

**Target Audience:**
- Potential consulting clients
- Tech community peers
- Recruiters/hiring managers
- Conference organizers
- People interested in AI/developer tools

---

## Brand Identity

### Name & Title
- **Name:** Sujan Kapadia
- **Title:** Chief AI Officer, Chariot Solutions
- **Tagline:** Role-focused (e.g., "Chief AI Officer | Building intelligent systems")

### Visual Identity
- **Headshot:** User-provided professional photo
- **Color Mode:** System preference default with manual toggle (dark/light)
- **Accent Color:** Blue/Teal
  - Primary: `#0ea5e9` (sky-500) or `#14b8a6` (teal-500)
  - Use for: links, CTAs, hover states, highlights
- **Typography:** Clean, modern sans-serif (Inter, Plus Jakarta Sans, or similar)
- **Overall Aesthetic:** Clean, content-first, professional with subtle pizazz

---

## Site Structure

```
/                     → Homepage
/about                → About / Bio
/writing              → Blog posts & articles
/writing/[slug]       → Individual post (for Medium articles hosted on-site)
/speaking             → Speaking engagements
/projects             → GitHub repos & side projects
/media                → Videos & podcasts
/consulting           → Consulting services
/contact              → Contact form & links
```

### Page Breakdown

#### Homepage (`/`)
1. **Hero Section**
   - Name, title, role-focused tagline
   - Professional headshot
   - Primary CTA: "Get in touch" or "Learn more"
   - Secondary CTA: "View my work"

2. **"Featured In" Section**
   - Logos: Technical.ly, Chariot Solutions, Reactive NY, Zip Code Wilmington, etc.
   - Subtle, grayscale logos that highlight on hover

3. **Latest Thinking (LinkedIn Posts)**
   - **Spotlight post:** Large, quote-style featured post (manually curated)
   - **Recent posts:** Row of 3-4 compact cards below
   - Link to full writing section

4. **Recent Talks**
   - Featured video (embedded player)
   - Grid/row of 3-4 additional video thumbnails
   - Link to media section

5. **Featured Projects**
   - 3-4 key repos: claude-code-analytics, mcp-gateway, monolog, snaplist
   - Card format with name, description, language badge, stars
   - Link to full projects section

6. **Testimonials**
   - 2-3 testimonials from two sources:
     - **LinkedIn Recommendations:** Direct quotes (from Recommendations_Received.csv)
     - **Paraphrased:** Manually added informal endorsements (marked as paraphrased)
   - Card format with quote, name, title, company
   - Visual distinction between direct quotes and paraphrased
   - Link to full LinkedIn recommendations

7. **Quick Contact CTA**
   - Brief text + "Get in touch" button

#### About (`/about`)
- Professional bio (2-3 paragraphs)
- Career timeline/journey (optional visual timeline)
- Current focus areas (AI agents, developer tools, etc.)
- Contact CTA at bottom

#### Writing (`/writing`)
- **Featured Posts:** Curated top 3-5 posts (pinned)
- **All Posts:** Filterable/sortable list
  - Filters: Topic (AI, Scala, Leadership, Career), Source (LinkedIn, Medium, Chariot)
  - Sort: Date (newest first)
- Each post card shows: title, excerpt, date, source, topic tags
- External links open in new tab with indicator

#### Speaking (`/speaking`)
- **Upcoming Events:** Highlighted section (if any)
- **Past Engagements:** Reverse chronological list
  - Each shows: event name, date, role, location, description
  - Video link where available
- **Speaking Topics:** List of topics available for speaking
- **CTA:** "Interested in having me speak? Get in touch"

#### Projects (`/projects`)
- **Featured Projects:** Larger cards with descriptions
  - claude-code-analytics, mcp-gateway, monolog, snaplist
- **All Repositories:** Grid of all public repos
  - Name, description, language, stars
  - Links to GitHub
- **Side Projects & Experiments:** Brief mentions of other work

#### Media (`/media`)
- **Featured Video:** Large embedded player
  - Default: "What Does It Mean to Be a Developer in the Age of AI Agents?" or Technical.ly talk
- **Video Grid:** All videos from YouTube playlist
  - Thumbnails with title overlay
  - Click opens modal or links to YouTube
- **Podcast Appearances:** List/grid of TechChat Tuesdays and other podcasts

#### Consulting (`/consulting`)
- **Overview:** Brief description of consulting services offered
- **Areas of Expertise:** AI strategy, coding agents, developer tools, modernization
- **Engagement Types:** Advisory, workshops, implementation support
- **Process:** How engagements typically work
- **CTA:** "Let's discuss your project" → Contact form

#### Contact (`/contact`)
- Contact form (name, email, message, inquiry type)
- Direct email link
- Social links: LinkedIn, GitHub, Twitter/X (if applicable)
- Consulting inquiry CTA

---

## Content Sources

| Source | File | Items | Usage |
|--------|------|-------|-------|
| LinkedIn Posts | `linkedin_ai_posts.csv` | 43 | Curated thought leadership |
| LinkedIn All | `complete-export/Shares.csv` | 901 | Archive/searchable |
| LinkedIn Recommendations | `complete-export/Recommendations_Received.csv` | — | Testimonials section |
| YouTube | `youtube_videos.csv` | 31 | Media section |
| GitHub | `github_repos.csv` | 21 | Projects section |
| Medium | `medium_articles.csv` | 9 | Writing section |
| Chariot | `chariot_content.csv` | 74 | Writing, media, speaking |
| Speaking | `speaking_engagements.csv` | 9 | Speaking section |

---

## Content Prioritization

### Tier 1 - Feature Prominently
- Recent AI-focused LinkedIn posts (curated selection)
- Speaking engagements (authority builder)
- Key GitHub projects: `claude-code-analytics`, `mcp-gateway`, `monolog`, `snaplist`
- "Adding Conversational AI to Your App" blog series
- Videos where featured as speaker

### Tier 2 - Easily Accessible
- Full GitHub portfolio
- All Medium articles
- Chariot blog posts authored
- TechChat Tuesdays episodes

### Tier 3 - Archive/Searchable
- Older LinkedIn posts
- All podcast appearances
- Older Scala/Akka technical content

---

## Content Hosting Strategy

### Hybrid Approach
Different strategies for different content sources:

| Source | Strategy | Rationale |
|--------|----------|-----------|
| **LinkedIn Posts** | Excerpt on-site + link to original | You don't own the canonical version; keeps content fresh |
| **Medium Articles** | Full content hosted on-site | You own this content; better SEO and user experience |
| **Chariot Blog Posts** | Excerpt + link to Chariot | Chariot owns canonical; drives traffic to employer |

### Implementation
- LinkedIn/Chariot: Show first 150-200 characters, "Continue reading →" link
- Medium: Full markdown copy in `/src/content/posts/`, with `canonicalUrl` in frontmatter
- All external links open in new tab with visual indicator (↗)

---

## AI-Assisted Content Curation

### Overview
Rather than manually selecting which LinkedIn posts to feature, Claude Code intelligently curates content based on defined criteria. This runs as a local script triggered manually (typically after a fresh LinkedIn export).

### Curation Workflow

```
┌─────────────────────────────────────────────────────────────┐
│  Manual Trigger: You run curation script locally            │
│                                                             │
│  1. Load fresh LinkedIn export (weekly CSV update)          │
│  2. Claude analyzes posts using criteria:                   │
│     - Recency (favor recent, but include standout older)    │
│     - Topic relevance (AI, leadership, tech trends)         │
│     - Quality signals (length, substance, insights)         │
│     - Diversity (mix of topics, not all same theme)         │
│  3. Selects:                                                │
│     - 1 "Spotlight" post (best recent insight)              │
│     - 3-4 "Recent" posts (supporting variety)               │
│     - 10-15 posts for "All Writing" page                    │
│  4. Outputs curated JSON to /src/data/curated-posts.json    │
│  5. You review, optionally override, then commit            │
│  6. Site rebuilds with new curated content                  │
└─────────────────────────────────────────────────────────────┘
```

### Curation Script (`scripts/curate-content.sh`)
```bash
#!/bin/bash
# Run Claude Code to curate LinkedIn posts
claude --prompt "Analyze linkedin/complete-export/Shares.csv and select:
  1. One 'spotlight' post (most insightful recent post about AI/tech)
  2. Four 'recent' posts (varied topics, recent, high quality)
  3. Fifteen posts for the archive (best of all time, diverse)

  Output as JSON to src/data/curated-posts.json with format:
  {
    spotlight: { date, excerpt, link, topics },
    recent: [...],
    archive: [...]
  }

  Criteria: Favor AI/agents content, thoughtful insights,
  avoid pure reshares, prefer substantive commentary."
```

### Manual Override
- Curated JSON can be manually edited before commit
- Add `"pinned": true` to any post to keep it featured regardless of curation
- Useful for posts tied to upcoming events or launches

### Refresh Cadence
- Weekly: Download fresh LinkedIn export
- Weekly (or as needed): Run curation script
- Commit changes → triggers site rebuild

### Why This Approach
- **On-brand:** Chief AI Officer's site uses AI for curation
- **Low effort:** No manual selection, just review and approve
- **Flexible:** Can override or pin specific posts
- **Fresh:** Content stays current with minimal work

---

## UI/UX Specifications

### Visualization Patterns

#### LinkedIn Posts (Thought Leadership)
- **Hybrid A+B Pattern:**
  - Spotlight: Single large card with quote-style typography
    - First ~200 chars of post
    - Date, "LinkedIn" badge
    - Link to full post
  - Recent: Row of 3-4 compact cards
    - ~100 chars excerpt
    - Date, topic tag
    - Horizontal scroll on mobile

#### Videos
- **Option C Pattern:**
  - Featured: 16:9 embedded player (YouTube)
  - Grid: 2x3 or responsive grid of thumbnails
  - Hover: Title overlay + play icon

#### Projects
- Card-based grid
- Each card: Name, description (2 lines), language badge, star count
- Hover: Subtle lift + "View on GitHub" prompt

### Pizazz & Micro-interactions

| Element | Interaction | Implementation |
|---------|-------------|----------------|
| Cards | Hover lift + shadow | `transform: translateY(-4px)`, `box-shadow` increase |
| Buttons | Hover glow/pulse | Subtle `box-shadow` animation on accent color |
| Page sections | Fade-in on scroll | Intersection Observer + CSS transitions |
| Links | Underline animation | `background-size` or `border-bottom` transition |
| Color mode toggle | Smooth transition | `transition: background-color 0.3s, color 0.3s` |
| Navigation | Active state indicator | Accent color underline or background |

### Responsive Design
- **Desktop:** Full layouts as designed
- **Tablet:** Adjusted grids (3→2 columns)
- **Mobile:** Single column, hamburger nav, horizontal scroll for card rows

---

## Tech Stack

### Framework: Astro
- **Why:** Content-first, zero JS by default, excellent performance
- **Version:** Latest stable
- **Features used:**
  - Static site generation
  - Content collections for posts
  - Component islands for interactive elements

### Styling: Tailwind CSS
- Utility-first, easy theming
- Dark mode support built-in (`class` strategy)
- Custom accent color configuration

### Hosting: Vercel or Netlify
- Free tier sufficient
- Automatic deployments from Git
- Edge functions if needed later

### Optional Integrations
- **Analytics:** Plausible or Fathom (privacy-focused)
- **Contact form:** Formspree, Netlify Forms, or custom
- **CMS:** Optional - Decap CMS or Keystatic for content editing

---

## File Structure (Astro)

```
/
├── public/
│   ├── images/
│   │   ├── headshot.jpg
│   │   └── logos/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── ThemeToggle.astro
│   │   ├── PostCard.astro
│   │   ├── VideoCard.astro
│   │   ├── ProjectCard.astro
│   │   ├── SpotlightPost.astro
│   │   ├── TestimonialCard.astro
│   │   └── FeaturedIn.astro
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── writing.astro
│   │   ├── speaking.astro
│   │   ├── projects.astro
│   │   ├── media.astro
│   │   ├── consulting.astro
│   │   └── contact.astro
│   ├── content/
│   │   ├── posts/          (Medium articles as markdown)
│   │   └── config.ts
│   ├── data/
│   │   ├── curated-posts.json    (AI-curated LinkedIn posts)
│   │   ├── youtube-videos.json
│   │   ├── github-repos.json
│   │   ├── speaking.json
│   │   ├── testimonials.json     (from LinkedIn recommendations)
│   │   └── featured-in.json
│   └── styles/
│       └── global.css
├── scripts/
│   └── curate-content.sh         (AI curation script)
├── astro.config.mjs
├── tailwind.config.mjs
└── package.json
```

---

## Data Flow

1. **CSV files** (collected) → Convert to JSON for site consumption
2. **JSON data files** → Imported into Astro pages/components
3. **Curated content** → Markdown files in `content/` with frontmatter
4. **External links** → Open in new tabs, tracked as outbound

---

## Implementation Phases

### Phase 1: Foundation
- [ ] Initialize Astro project with Tailwind
- [ ] Set up base layout, header, footer
- [ ] Implement dark/light mode toggle
- [ ] Create basic page routes
- [ ] Convert CSV data files to JSON

### Phase 2: Homepage
- [ ] Hero section with headshot and tagline
- [ ] Featured In logos section
- [ ] Spotlight post + recent posts row
- [ ] Featured video + video grid
- [ ] Featured projects section
- [ ] Testimonials section (from LinkedIn recommendations)
- [ ] Quick contact CTA

### Phase 3: Content Pages
- [ ] About page with bio
- [ ] Writing page with filters
- [ ] Speaking page with timeline
- [ ] Projects page with full grid
- [ ] Media page with videos/podcasts
- [ ] Consulting page with services
- [ ] Contact page with form

### Phase 4: AI Curation Setup
- [ ] Create curation script (scripts/curate-content.sh)
- [ ] Test curation with sample LinkedIn export
- [ ] Document curation workflow
- [ ] Integrate curated output into site

### Phase 5: Polish
- [ ] Micro-interactions and animations
- [ ] Mobile responsiveness
- [ ] SEO optimization (meta tags, OG images)
- [ ] Performance optimization
- [ ] Accessibility review

### Phase 6: Launch
- [ ] Domain setup (sujankapadia.com)
- [ ] Deployment configuration (Vercel/Netlify)
- [ ] Analytics integration (Plausible/Fathom)
- [ ] Final testing
- [ ] Go live!

---

## Resolved Decisions

| Question | Decision |
|----------|----------|
| **Blog hosting** | Hybrid: LinkedIn/Chariot = excerpt + link; Medium = full on-site |
| **LinkedIn curation** | AI-assisted via Claude Code, local script + manual trigger |
| **Consulting page** | Yes, dedicated `/consulting` page |
| **Testimonials** | Yes, from LinkedIn Recommendations + manually paraphrased endorsements |

---

## Future Features (Post-Launch)

- [ ] **Newsletter signup** - Email capture for updates (Buttondown/ConvertKit)
- [ ] **Search** - Full-text search across all content
- [ ] **RSS feed** - For writing/posts section
- [ ] **Speaking inquiry form** - Dedicated form for conference organizers
- [ ] **Case studies** - Detailed project/engagement write-ups
- [ ] **Automated GitHub sync** - Refresh repo data via GitHub API

---

## Resources

### Collected Data Files
- `/linkedin/complete-export/Shares.csv` - All LinkedIn posts (901)
- `/linkedin/complete-export/Recommendations_Received.csv` - LinkedIn recommendations (testimonials)
- `/linkedin_ai_posts.csv` - Curated AI-focused posts (43)
- `/youtube_videos.csv` - YouTube playlist videos (31)
- `/github_repos.csv` - GitHub repositories (21)
- `/medium_articles.csv` - Medium articles (9)
- `/chariot_content.csv` - Chariot blogs, podcasts, events (74)
- `/speaking_engagements.csv` - Speaking history (9)

### Design References
- [Design Shack - Portfolio Trends 2025](https://designshack.net/articles/trends/portfolio-design/)
- [CloudCannon - Static Site Generators 2025](https://cloudcannon.com/blog/the-top-five-static-site-generators-for-2025-and-when-to-use-them/)
- [Knapsack Creative - Consultant Website Features](https://knapsackcreative.com/blog-industry/consultant-website-essential-features)
