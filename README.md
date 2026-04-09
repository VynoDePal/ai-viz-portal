# AI Viz Portal

A modern platform for visualizing and comparing AI model performance metrics with real-time updates.

## Technology Stack

- **Frontend**: Next.js 16.2.3 with App Router, React 19.2.4
- **Styling**: Tailwind CSS 4
- **Visualization**: Recharts
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage, Edge Functions)
- **Language**: TypeScript 5
- **Code Quality**: ESLint, Prettier, Ruff

## Getting Started

### Prerequisites

- Node.js 11.9.0 or higher
- npm, yarn, pnpm, or bun
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/VynoDePal/ai-viz-portal.git
cd ai-viz-portal
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env.local
```

Update `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Authentication

The project includes authentication pages:
- `/auth/login` - Sign in with email/password
- `/auth/signup` - Create a new account

## Development

### Code Quality

Run linting:
```bash
npm run lint
```

Format code:
```bash
npm run format
```

Check formatting:
```bash
npm run format:check
```

### Build

```bash
npm run build
```

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── auth/         # Authentication pages
│   └── ...
├── components/      # React components
│   ├── ui/          # UI components
│   ├── dashboard/   # Dashboard components
│   └── visualization/ # Visualization components
├── lib/             # Utilities and configurations
├── types/           # TypeScript type definitions
└── utils/           # Helper functions
```

## License

MIT
