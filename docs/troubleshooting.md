# Troubleshooting Guide

This guide helps you resolve common issues with the AI Viz Portal.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Development Issues](#development-issues)
- [Database Issues](#database-issues)
- [API Issues](#api-issues)
- [Deployment Issues](#deployment-issues)
- [Performance Issues](#performance-issues)
- [Getting Help](#getting-help)

## Installation Issues

### Node.js Version Error

**Problem**: Node.js version is not compatible.

**Solution**:
```bash
# Install Node.js 20 or higher
nvm install 20
nvm use 20
```

### Dependency Installation Failures

**Problem**: `npm install` fails with errors.

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install
```

### Environment Variables Missing

**Problem**: Application fails to start due to missing environment variables.

**Solution**:
```bash
# Copy example environment file
cp .env.example .env.local

# Edit .env.local with your values
nano .env.local
```

## Development Issues

### Port Already in Use

**Problem**: Port 3000 is already in use.

**Solution**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
npm run dev -- -p 3001
```

### Hot Reload Not Working

**Problem**: Changes are not reflected in the browser.

**Solution**:
1. Restart the development server
2. Clear browser cache
3. Check for file watcher limits:
   ```bash
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

### TypeScript Errors

**Problem**: TypeScript compilation errors.

**Solution**:
```bash
# Check TypeScript errors
npx tsc --noEmit

# Update TypeScript types
npm install -D @types/node
```

## Database Issues

### Supabase Connection Failed

**Problem**: Cannot connect to Supabase.

**Solution**:
1. Verify environment variables are correct
2. Check Supabase project status
3. Verify network connectivity
4. Check Supabase logs for errors

### Realtime Not Working

**Problem**: Real-time updates are not received.

**Solution**:
1. Enable Realtime for the table in Supabase
2. Check RLS policies allow Realtime
3. Verify subscription syntax
4. Check browser console for errors

### Query Timeout

**Problem**: Database queries timeout.

**Solution**:
1. Add indexes to improve query performance
2. Optimize complex queries
3. Increase timeout in Supabase settings
4. Check for long-running queries

## API Issues

### Authentication Failed

**Problem**: API returns 401 Unauthorized.

**Solution**:
1. Verify API key is correct
2. Check API key is active
3. Verify API key has not expired
4. Check Authorization header format

### Rate Limit Exceeded

**Problem**: API returns 429 Too Many Requests.

**Solution**:
1. Wait for rate limit to reset
2. Implement exponential backoff
3. Request higher rate limit
4. Cache responses

### CORS Errors

**Problem**: CORS errors when calling API from browser.

**Solution**:
1. Verify CORS configuration in Supabase
2. Add allowed origins
3. Use proxy in development
4. Check preflight requests

## Deployment Issues

### Build Fails

**Problem**: Build fails during deployment.

**Solution**:
1. Check build logs for errors
2. Verify all dependencies are installed
3. Check for TypeScript errors
4. Verify environment variables

### Deployment Timeout

**Problem**: Deployment times out.

**Solution**:
1. Increase timeout in Vercel settings
2. Optimize build process
3. Reduce bundle size
4. Check for long-running build scripts

### Environment Variables Missing in Production

**Problem**: Application fails in production due to missing variables.

**Solution**:
1. Add variables in Vercel dashboard
2. Select correct environment (Production)
3. Redeploy after adding variables
4. Verify variable names match

## Performance Issues

### Slow Page Load

**Problem**: Pages load slowly.

**Solution**:
1. Enable image optimization
2. Implement code splitting
3. Use lazy loading for components
4. Optimize bundle size
5. Enable compression

### High Memory Usage

**Problem**: Application uses too much memory.

**Solution**:
1. Check for memory leaks
2. Optimize component re-renders
3. Use React.memo for expensive components
4. Implement virtualization for long lists
5. Clean up event listeners

### Database Slow Queries

**Problem**: Database queries are slow.

**Solution**:
1. Add appropriate indexes
2. Optimize query structure
3. Use query limits and pagination
4. Implement caching
5. Use Supabase query analyzer

## Getting Help

### Check Documentation

- [User Guide](./user-guide.md)
- [Developer Guide](./developer-guide.md)
- [API Reference](./api-reference.md)
- [Deployment Guide](./deployment.md)

### Search Issues

Search existing GitHub issues for similar problems:
- [GitHub Issues](https://github.com/VynoDePal/ai-viz-portal/issues)

### Create an Issue

If you can't find a solution, create a new issue with:
- Description of the problem
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details
- Error messages or logs

### Contact Support

For critical issues, contact support at support@ai-viz-portal.com.
