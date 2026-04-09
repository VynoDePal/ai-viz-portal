# Development

## Code Quality

### Linting
Run linting:
```bash
npm run lint
```

### Formatting
Format code with Prettier:
```bash
npm run format
```

Check formatting:
```bash
npm run format:check
```

### Python Code Quality
Format Python code with Ruff:
```bash
ruff format .
```

Lint Python code with Ruff:
```bash
ruff check .
```

## Testing

Run unit tests:
```bash
npm run test
```

Run tests with UI:
```bash
npm run test:ui
```

## Build

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

etl/                 # Python ETL pipeline
├── __init__.py
├── extract.py       # Data extraction
├── transform.py     # Data transformation
├── load.py          # Data loading
└── validate.py      # Data validation
```
