# Architecture Documentation

This document provides an overview of the AI Viz Portal system architecture.

## Table of Contents

- [System Overview](#system-overview)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Database Architecture](#database-architecture)
- [API Architecture](#api-architecture)
- [Security Architecture](#security-architecture)
- [Deployment Architecture](#deployment-architecture)
- [Monitoring Architecture](#monitoring-architecture)

## System Overview

The AI Viz Portal is a modern web application built with Next.js and Supabase. It follows a client-server architecture with real-time capabilities.

### High-Level Architecture

```
┌─────────────────┐
│   Client (SPA)  │
│   Next.js App   │
└────────┬────────┘
         │
         │ HTTP/WebSocket
         │
┌────────▼────────┐
│  Supabase       │
│  - PostgreSQL   │
│  - Auth         │
│  - Realtime     │
│  - Storage      │
│  - Edge Functions│
└─────────────────┘
```

## Frontend Architecture

### Technology Stack

- **Framework**: Next.js 16.2.3 with App Router
- **UI Library**: React 19.2.4
- **Styling**: Tailwind CSS 4
- **Visualization**: Recharts, D3.js
- **State Management**: React Hooks, Context API
- **Type Safety**: TypeScript 5

### Component Architecture

The frontend follows a component-based architecture with clear separation of concerns:

```
src/
├── app/              # Next.js App Router (pages and layouts)
├── components/       # Reusable React components
│   ├── ui/           # Base UI components (buttons, inputs, etc.)
│   ├── visualization/ # Data visualization components
│   ├── team/         # Team collaboration components
│   └── monitoring/   # Monitoring dashboard components
├── lib/             # Utility functions and helpers
└── types/           # TypeScript type definitions
```

### Data Flow

1. **Client fetches data** from Supabase via the client library
2. **Real-time subscriptions** receive updates via Supabase Realtime
3. **Components update** automatically when data changes
4. **Optimistic updates** provide immediate feedback

### Performance Optimization

- **Code splitting**: Automatic with Next.js App Router
- **Image optimization**: Next.js Image component
- **Font optimization**: Next.js font optimization
- **Caching**: Supabase query caching
- **Lazy loading**: React.lazy() for heavy components

## Backend Architecture

### Supabase Services

The backend is built on Supabase, which provides:

1. **PostgreSQL Database**: Primary data store
2. **Authentication**: User authentication and authorization
3. **Realtime**: Real-time data synchronization
4. **Storage**: File storage for assets
5. **Edge Functions**: Serverless functions for custom logic

### API Routes

Next.js API routes provide server-side endpoints:

```
src/app/api/
└── v1/
    ├── models/       # Model endpoints
    ├── benchmarks/   # Benchmark endpoints
    ├── rankings/     # Ranking endpoints
    └── compare/      # Comparison endpoints
```

### Edge Functions

Supabase Edge Functions handle:
- Custom business logic
- Third-party integrations
- Background processing
- Webhook handling

## Database Architecture

### Database Schema

The database uses PostgreSQL with the following main tables:

- **users**: User accounts and profiles
- **models**: AI model information
- **benchmarks**: Benchmark definitions
- **model_benchmarks**: Model performance on benchmarks
- **teams**: Team information for multi-tenant support
- **team_members**: Team membership
- **team_invitations**: Team invitations
- **api_keys**: API keys for public API access

### Relationships

- Users → Teams (one-to-many)
- Teams → Team Members (one-to-many)
- Models → Model Benchmarks (one-to-many)
- Benchmarks → Model Benchmarks (one-to-many)

### Data Integrity

- **Foreign keys**: Enforce referential integrity
- **Constraints**: Unique constraints on key fields
- **Indexes**: Optimize query performance
- **Row Level Security**: Fine-grained access control

## API Architecture

### REST API

The public REST API follows RESTful conventions:

- **Base URL**: `/api/v1`
- **Authentication**: Bearer token
- **Rate Limiting**: 1000 requests/hour per API key
- **Versioning**: URL-based versioning

### Endpoints

- `GET /models`: List models
- `GET /models/:id`: Get model details
- `GET /benchmarks`: List benchmarks
- `GET /rankings`: Get rankings
- `POST /compare`: Compare models

### API Security

- **Authentication**: API key validation
- **Authorization**: Permission-based access control
- **Rate Limiting**: Token bucket algorithm
- **HTTPS**: All endpoints use HTTPS

## Security Architecture

### Authentication

- **Supabase Auth**: Handles user authentication
- **JWT Tokens**: Stateless authentication
- **Session Management**: Secure session handling
- **Password Hashing**: bcrypt with salt

### Authorization

- **Row Level Security (RLS)**: Database-level access control
- **Role-Based Access Control**: User roles and permissions
- **API Key Permissions**: Granular API key permissions
- **Team Permissions**: Multi-tenant access control

### Data Protection

- **Encryption at Rest**: Database encryption
- **Encryption in Transit**: TLS 1.3
- **PII Protection**: Sensitive data handling
- **Audit Logging**: Access and change logging

## Deployment Architecture

### Hosting

- **Frontend**: Vercel (Next.js hosting)
- **Backend**: Supabase (managed services)
- **CI/CD**: GitHub Actions

### Environments

- **Development**: Local development
- **Staging**: Staging environment for testing
- **Production**: Production environment

### Deployment Pipeline

1. **CI Pipeline**: Linting, testing, building
2. **Staging Deployment**: Deploy to staging
3. **Smoke Tests**: Run smoke tests on staging
4. **Production Deployment**: Deploy to production
5. **Rollback**: Automatic rollback on failure

## Monitoring Architecture

### Application Monitoring

- **Performance Metrics**: Page load times, API response times
- **Error Tracking**: Error logging and alerting
- **Health Checks**: System health monitoring
- **Uptime Monitoring**: Service availability

### Logging

- **Application Logs**: Structured logging
- **Access Logs**: API access logging
- **Error Logs**: Error stack traces
- **Audit Logs**: User activity logging

### Alerting

- **Slack Notifications**: Deployment status alerts
- **Email Alerts**: Critical error notifications
- **Dashboard Alerts**: Real-time monitoring dashboard
