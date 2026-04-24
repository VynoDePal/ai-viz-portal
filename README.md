# AI Viz Portal

A modern platform for visualizing and comparing AI model performance metrics with real-time updates.

## Features

- 📊 Interactive visualizations for AI model benchmarks
- 🔄 Real-time data updates with Supabase Realtime
- 📈 Trend analysis and prediction charts
- 🔍 Advanced filtering and search capabilities
- 👥 Multi-tenant support for team collaboration
- 🔐 Secure authentication and authorization
- 📡 Public REST API for external access
- 🚀 CI/CD pipeline with automated testing and deployment
- 📊 Monitoring and alerting system

## Technology Stack

- **Frontend**: Next.js 16.2.3 with App Router, React 19.2.4
- **Styling**: Tailwind CSS 4
- **Visualization**: Recharts, D3.js
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage, Edge Functions)
- **Language**: TypeScript 5, Python 3.11
- **Code Quality**: ESLint, Prettier, Ruff
- **Testing**: Vitest, Playwright
- **CI/CD**: GitHub Actions

## Documentation

- [Getting Started](./docs/getting-started.md) - Installation and setup instructions
- [User Guide](./docs/user-guide.md) - How to use the platform
- [Developer Guide](./docs/developer-guide.md) - Development workflow and project structure
- [API Reference](./docs/api-reference.md) - Public REST API documentation
- [Architecture](./docs/architecture.md) - System architecture overview
- [Deployment](./docs/deployment.md) - Deployment instructions
- [Contributing](./CONTRIBUTING.md) - Contribution guidelines
- [Troubleshooting](./docs/troubleshooting.md) - Common issues and solutions
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

## Project Structure

```
ai-viz-portal/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # React components
│   ├── lib/             # Utility functions
│   ├── types/           # TypeScript types
│   └── __tests__/       # Test files
├── docs/                # Documentation
├── .github/             # GitHub Actions workflows
└── public/              # Static assets
```

## License

MIT
