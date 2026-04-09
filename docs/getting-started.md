# Getting Started

## Prerequisites

- Node.js 11.9.0 or higher
- npm, yarn, pnpm, or bun
- Supabase account
- Python 3.11+ (for ETL pipeline)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/VynoDePal/ai-viz-portal.git
cd ai-viz-portal
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Install Python dependencies (for ETL pipeline):
```bash
pip install -r requirements.txt
```

4. Configure environment variables:
```bash
cp .env.example .env.local
```

Update `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Authentication

The project includes authentication pages:
- `/auth/login` - Sign in with email/password
- `/auth/signup` - Create a new account
