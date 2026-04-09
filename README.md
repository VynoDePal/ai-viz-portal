# AI Viz Portal

A modern platform for visualizing and comparing AI model performance metrics with real-time updates.

## Technology Stack

- **Frontend**: Next.js 16.2.3 with App Router, React 19.2.4
- **Styling**: Tailwind CSS 4
- **Visualization**: Recharts
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage, Edge Functions)
- **Language**: TypeScript 5, Python 3.11
- **Code Quality**: ESLint, Prettier, Ruff

## Documentation

- [Getting Started](./docs/getting-started.md) - Installation and setup instructions
- [Development](./docs/development.md) - Development workflow and project structure
- [Database Schema](./docs/database-schema.md) - Database tables and relationships
- [ETL Pipeline](./docs/etl-pipeline.md) - Data import from Excel/CSV files

## Quick Start

```bash
# Clone the repository
git clone https://github.com/VynoDePal/ai-viz-portal.git
cd ai-viz-portal

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## License

MIT
