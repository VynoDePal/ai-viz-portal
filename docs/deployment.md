# Deployment Guide

This guide provides instructions for deploying the AI Viz Portal to various environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Vercel Deployment](#vercel-deployment)
- [Supabase Setup](#supabase-setup)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring](#monitoring)
- [Rollback](#rollback)

## Prerequisites

Before deploying, ensure you have:

- A Vercel account
- A Supabase project
- GitHub repository access
- Required environment variables

## Environment Variables

### Required Variables

Create a `.env.local` file with the following variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Vercel (for deployment)
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_PROJECT_ID=your-vercel-project-id

# Slack (for notifications)
SLACK_WEBHOOK=your-slack-webhook-url
```

### Optional Variables

```bash
# Analytics
NEXT_PUBLIC_GA_ID=your-google-analytics-id

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_MONITORING=true
```

## Vercel Deployment

### Initial Setup

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Link project**:
   ```bash
   vercel link
   ```

### Deploy to Production

```bash
# Build and deploy
vercel --prod
```

### Deploy to Preview

```bash
# Deploy to preview environment
vercel
```

### Environment Configuration

Configure environment variables in Vercel:

1. Go to project settings in Vercel
2. Navigate to "Environment Variables"
3. Add all required variables
4. Select the appropriate environment (Production, Preview, Development)

## Supabase Setup

### Create Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Enter project details
4. Wait for project to be created

### Database Setup

1. **Run migrations**:
   ```bash
   supabase db push
   ```

2. **Enable Row Level Security**:
   - Go to Authentication > Policies
   - Enable RLS for all tables
   - Create appropriate policies

3. **Enable Realtime**:
   - Go to Database > Replication
   - Enable Realtime for required tables

### Storage Setup

1. **Create storage buckets**:
   - Go to Storage
   - Create buckets for file uploads
   - Configure bucket policies

## CI/CD Pipeline

The project uses GitHub Actions for CI/CD:

### Workflow Files

- `.github/workflows/ci.yml`: Continuous Integration
- `.github/workflows/deploy-staging.yml`: Staging Deployment
- `.github/workflows/deploy-production.yml`: Production Deployment

### CI Pipeline

The CI pipeline runs on every push:

1. **Linting**: ESLint and Prettier checks
2. **Formatting**: Code formatting validation
3. **Testing**: Unit and integration tests
4. **Build**: Application build
5. **Artifact Upload**: Upload build artifacts

### Staging Deployment

Triggered on pushes to `develop` branch:

1. Build application
2. Deploy to Vercel staging
3. Run smoke tests
4. Notify Slack

### Production Deployment

Triggered on pushes to `main` branch:

1. Run tests
2. Build application
3. Deploy to Vercel production
4. Run smoke tests
5. Rollback on failure
6. Notify Slack

## Monitoring

### Application Monitoring

The application includes built-in monitoring:

- **Performance Metrics**: Page load times, API response times
- **Error Tracking**: Error logging and alerting
- **Health Checks**: System health monitoring

### Monitoring Dashboard

Access the monitoring dashboard at `/monitoring` (requires admin access).

### Alert Configuration

Configure alerts in the monitoring dashboard:
- Error rate thresholds
- Performance thresholds
- Uptime monitoring

## Rollback

### Automatic Rollback

The production deployment workflow includes automatic rollback on failure.

### Manual Rollback

To manually rollback:

```bash
# Rollback to previous deployment
vercel rollback
```

### Rollback to Specific Deployment

```bash
# Rollback to specific deployment
vercel rollback <deployment-url>
```

## Troubleshooting

### Build Failures

If the build fails:

1. Check the build logs in Vercel
2. Verify all environment variables are set
3. Ensure dependencies are up to date
4. Check for TypeScript errors

### Deployment Failures

If deployment fails:

1. Check Vercel deployment logs
2. Verify Supabase connection
3. Check environment variables
4. Review GitHub Actions logs

### Runtime Errors

If you encounter runtime errors:

1. Check the monitoring dashboard
2. Review application logs
3. Check Supabase logs
4. Verify database connections

## Best Practices

### Pre-Deployment Checklist

- [ ] All tests pass
- [ ] Code is linted and formatted
- [ ] Environment variables are set
- [ ] Database migrations are applied
- [ ] Backup is created
- [ ] Rollback plan is ready

### Post-Deployment Checklist

- [ ] Verify deployment is live
- [ ] Run smoke tests
- [ ] Check monitoring dashboard
- [ ] Verify database connections
- [ ] Test critical user flows
- [ ] Monitor error rates
