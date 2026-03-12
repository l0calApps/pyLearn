# 🐍 PyLearn

An interactive Python learning platform with 30 progressive levels, dark-themed code editor, and gamification elements.

## Features

- **30 Progressive Levels** — Hello World through OOP and functional programming
- **Dark Code Editor** — JetBrains Mono font, line numbers, syntax-aware UI
- **Instant Feedback** — Compare output, show solutions and explanations
- **Gamification** — Streak tracking, completion badges, progress visualization
- **Level Selector** — Category filtering, color-coded completion status
- **Persistent Progress** — Saved to localStorage between sessions

## Quick Start

### Production (Docker)

```bash
docker compose up -d
```

App runs at **http://localhost:3000**

### Development (Hot Reload)

```bash
docker compose --profile dev up pylearn-dev
```

Dev server at **http://localhost:3001**

### Local Development (no Docker)

```bash
npm install
npm run dev
```

## Tech Stack

- **React 18** — UI framework
- **Vite 5** — Build tool
- **Tailwind CSS 3** — Utility styles
- **Nginx** — Production web server
- **Docker** — Containerization

## Curriculum

| Levels | Topics |
|--------|--------|
| 1–5 | Basics: print, variables, input |
| 6–7 | Strings & Booleans |
| 8–10 | Control Flow & Loops |
| 11–13 | Data Structures: Lists, Dicts |
| 14–16 | Functions |
| 17–18 | String Methods & Comprehensions |
| 19–20 | Tuples & Sets |
| 21 | Exception Handling |
| 22–24 | Advanced Functions & Lambda |
| 25–27 | More Data Structures |
| 28 | Map & Filter |
| 29 | OOP & Classes |
| 30 | Capstone Challenge |
