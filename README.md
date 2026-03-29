# Lekhak

Lekhak is a modern, privacy-first personal productivity desktop application. It integrates tasks, rich notes, and scheduled reminders into a unified, beautifully designed aesthetic tailored for Windows. 

All your data is stored locally via SQLite—no accounts, no cloud sync, and absolute privacy.

## Core Features

- **Prioritized Tasks**: Manage your to-do list with low, medium, and high priority tags, calendar due dates, and status filters.
- **Rich Notes**: A minimalist note-taking environment featuring auto-save, pinning, and instant full-text search.
- **Scheduled Reminders**: Set up one-off or recurring (daily/weekly/monthly) background notifications with native OS alerts.
- **System Tray Integration**: Lekhak runs quietly in the background. Closing the app minimizes it to the tray, ensuring you never miss a scheduled reminder.
- **Adaptive UI**: A premium, high-contrast monochrome design system with seamless dark and light mode support.

## Technology Stack

- **Framework**: [Electron](https://electronjs.org) + [React 19](https://react.dev)
- **Tooling**: [Vite](https://vitejs.dev) + TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com) + Lucide Icons
- **Database**: [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- **Utilities**: `date-fns` for precise local time handling

## Development Guide

### Prerequisites
- Node.js 18+
- npm

### Installation & Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/lekhak.git
   cd lekhak
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development environment:
   ```bash
   npm run dev
   ```

### Application Data

By default, the internal SQLite database (`lekhak.db`) and user preferences are automatically stored in the standard OS user-data directory:
- **Windows**: `%APPDATA%\lekhak`

Because the app is entirely offline, you can easily back up, restore, or migrate your data by moving this single `.db` file.

## Packaging

To compile the application and build a production-ready Windows installer:
```bash
npm run build
```
The compiled executable and installer will be generated in the `release/` directory.

## License

This project is licensed under the [MIT License](LICENSE).
