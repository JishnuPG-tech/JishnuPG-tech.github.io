# Desktop SQL IDE

A modern desktop SQL IDE built with **Electron**, **React**, and **FastAPI** — inspired by tools like DbVisualizer. Connect to databases, write SQL, and visualize results with a clean dark-themed interface.

## Features

- 🔌 **Database Connections** – SQLite, PostgreSQL, and MySQL with saved profiles
- 📝 **SQL Editor** – Monaco-powered editor with syntax highlighting, auto-complete, and multi-tab support
- ▶️ **Query Execution** – Run queries with a button or `Ctrl+Enter`; see execution time and errors
- 📊 **Results Viewer** – Sortable, filterable data grid with pagination and clipboard copy
- 🗂️ **Schema Explorer** – Browse databases, tables, and column types in the sidebar
- 🕘 **Query History** – View and re-run previously executed queries
- 📤 **Export** – Download results as CSV or Excel

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Desktop  | Electron                          |
| Frontend | React 18, Tailwind CSS, Monaco Editor |
| Backend  | FastAPI, SQLAlchemy               |

## Getting Started

### Prerequisites

- Node.js ≥ 18
- Python ≥ 3.10
- pip

### Install

```bash
# Install Node dependencies
npm install

# Install Python dependencies
cd backend && pip install -r requirements.txt && cd ..
```

### Development

```bash
npm run dev
```

This starts the Vite dev server, the FastAPI backend, and Electron simultaneously.

### Build

```bash
npm run build
```

Produces a distributable `.exe` (Windows) inside the `release/` folder.

## Project Structure

```
desktop-sql-ide/
├── electron/          # Electron main & preload scripts
├── src/               # React frontend
│   ├── components/    # UI components
│   └── store/         # Zustand state store
├── backend/           # FastAPI backend
│   └── routes/        # API route handlers
├── index.html
├── vite.config.js
└── package.json
```

## Security

- Database passwords are encrypted using Fernet symmetric encryption and stored locally in the app-data directory. They are never written to disk in plain text.
- The backend only listens on `localhost`; no ports are exposed externally.

## Future Enhancements

- AI-based SQL suggestions
- Visual query builder
- ER diagram generator
- Cloud database support