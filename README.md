# Lekhak

A personal productivity desktop app for Windows. Todos, notes, and reminders — all in one place, stored locally.

![Lekhak screenshot placeholder](docs/screenshot.png)

## Features

- **To-do list** — add tasks with priority levels and due dates, filter by status
- **Notes** — write and autosave freeform notes, pin favourites, full-text search
- **Reminders** — schedule notifications with optional daily/weekly/monthly repeat
- **System tray** — app stays alive in the background, close button hides to tray
- **Dark & light theme** — toggle from the sidebar
- All data is stored in a local SQLite database — no account, no cloud, no tracking

## Stack

- [Electron](https://electronjs.org) + [Vite](https://vitejs.dev)
- [React](https://react.dev) + TypeScript
- [Tailwind CSS](https://tailwindcss.com)
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) for local persistence
- [date-fns](https://date-fns.org) for date handling

## Getting started

**Prerequisites:** Node.js 18+, npm

```bash
git clone https://github.com/your-username/lekhak.git
cd lekhak
npm install
npm run dev
```

The app opens automatically. Data is saved to your OS user-data directory (`%APPDATA%\lekhak` on Windows).

## Build

```bash
npm run build
```

Produces a Windows installer under `release/`.

## Project layout

```
src/
  main/         # Electron main process (window, IPC, SQLite, tray, reminders)
  preload/      # Context bridge — exposes a typed API to the renderer
  renderer/     # React app
    components/
      todos/
      notes/
      reminders/
    types/
```

## Data

The SQLite database lives at `%APPDATA%\lekhak\lekhak.db`. You can back it up or copy it between machines freely.

## License

MIT
