# Developer Guide

This guide provides information for developers working on the AI Viz Portal project.

## Table of Contents

- [Development Environment Setup](#development-environment-setup)
- [Project Structure](#project-structure)
- [Code Style](#code-style)
- [Testing](#testing)
- [Building](#building)
- [Database](#database)
- [API Development](#api-development)
- [Common Tasks](#common-tasks)

## Development Environment Setup

### Prerequisites

- Node.js 20 or higher
- npm or yarn
- Python 3.11 (for ETL pipeline)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/VynoDePal/ai-viz-portal.git
cd ai-viz-portal

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

## Project Structure

```
ai-viz-portal/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── api/             # API routes
│   │   │   └── v1/         # API version 1
│   │   ├── (dashboard)/    # Dashboard pages
│   │   ├── (rankings)/     # Rankings pages
│   │   ├── (trends)/      # Trends pages
│   │   ├── (predictions)/  # Predictions pages
│   │   └── layout.tsx      # Root layout
│   ├── components/         # React components
│   │   ├── ui/            # UI components
│   │   ├── visualization/ # Visualization components
│   │   ├── team/          # Team components
│   │   └── monitoring/    # Monitoring components
│   ├── lib/               # Utility functions
│   │   ├── timeSeriesUtils.ts
│   │   ├── predictionUtils.ts
│   │   ├── monitoringUtils.ts
│   │   ├── teamUtils.ts
│   │   └── apiUtils.ts
│   ├── types/             # TypeScript types
│   │   ├── team.ts
│   │   └── api.ts
│   └── __tests__/         # Test files
│       ├── time-series.test.ts
│       ├── prediction.test.ts
│       ├── monitoring.test.ts
│       ├── team.test.ts
│       └── api.test.ts
├── docs/                  # Documentation
├── .github/               # GitHub Actions workflows
│   └── workflows/
│       ├── ci.yml
│       ├── deploy-staging.yml
│       └── deploy-production.yml
├── public/                # Static assets
├── openapi.json           # OpenAPI specification
└── package.json
```

## Code Style

### TypeScript

We use TypeScript 5 with strict mode enabled. All new code should be written in TypeScript.

### ESLint

Run ESLint to check for code quality issues:

```bash
npm run lint
```

### Prettier

Format code with Prettier:

```bash
npm run format
```

### Ruff

Use Ruff for Python code linting and formatting:

```bash
ruff check .
ruff format .
```

## Testing

### Unit Tests

Run unit tests with Vitest:

```bash
npm test
```

### Integration Tests

Run integration tests:

```bash
npm run test:integration
```

### E2E Tests

Run E2E tests with Playwright:

```bash
npm run test:e2e
```

### Coverage

Generate coverage reports:

```bash
npm run test:coverage
```

## Building

### Development Build

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Database

### Supabase Setup

1. Create a Supabase project
2. Configure environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   ```

### Database Migrations

Use Supabase migrations to manage database schema changes.

### Realtime Subscriptions

The application uses Supabase Realtime for real-time updates. Subscribe to changes:

```typescript
const subscription = supabase
  .channel('models')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'models' }, payload => {
    console.log('Change received!', payload)
  })
  .subscribe()
```

## API Development

### API Routes

API routes are located in `src/app/api/v1/`. Each route follows RESTful conventions.

### Authentication

API endpoints use Bearer token authentication. Include the API key in the Authorization header:

```
Authorization: Bearer aivp_your_api_key_here
```

### Rate Limiting

API requests are rate limited to 1000 requests per hour per API key.

### Adding New Endpoints

1. Create a new route file in `src/app/api/v1/`
2. Implement the handler function
3. Update the OpenAPI specification in `openapi.json`
4. Add tests in `src/__tests__/api.test.ts`

## Common Tasks

### Adding a New Component

1. Create the component file in the appropriate directory
2. Export the component
3. Add tests in `src/__tests__/`
4. Update documentation if needed

### Adding a New Utility Function

1. Create the utility function in `src/lib/`
2. Export the function
3. Add tests in `src/__tests__/`
4. Update TypeScript types if needed

### Adding a New Page

1. Create a new directory in `src/app/` following the route group pattern
2. Create `page.tsx` for the page content
3. Create `layout.tsx` if the page needs a custom layout
4. Update navigation if needed

### Database Schema Changes

1. Create a Supabase migration
2. Update TypeScript types in `src/types/`
3. Update documentation in `docs/database-schema.md`
4. Test the migration in a development environment
