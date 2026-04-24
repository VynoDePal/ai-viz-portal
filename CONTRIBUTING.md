# Contributing to AI Viz Portal

Thank you for your interest in contributing to AI Viz Portal! This document provides guidelines for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors.

### Our Standards

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Fork and Clone

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ai-viz-portal.git
   cd ai-viz-portal
   ```

3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/VynoDePal/ai-viz-portal.git
   ```

### Install Dependencies

```bash
npm install
```

### Set Up Environment

```bash
cp .env.example .env.local
```

## Development Workflow

### Create a Branch

Create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` for new features
- `fix/` for bug fixes
- `docs/` for documentation changes
- `refactor/` for code refactoring
- `test/` for test additions

### Make Changes

1. Write code following the coding standards
2. Add tests for new functionality
3. Update documentation as needed
4. Run tests to ensure everything passes

### Commit Changes

Write clear, descriptive commit messages:

```bash
git add .
git commit -m "feat: add new feature description"
```

Commit message format:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation
- `style:` for code style changes
- `refactor:` for code refactoring
- `test:` for test changes
- `chore:` for maintenance tasks

### Sync with Upstream

Keep your fork up to date:

```bash
git fetch upstream
git rebase upstream/main
```

## Pull Request Process

### Before Submitting

Ensure your PR:
- Passes all tests
- Follows coding standards
- Includes documentation updates
- Has a clear description

### Submit PR

1. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Create a pull request on GitHub

3. Fill in the PR template:
   - Describe the changes
   - Link related issues
   - Add screenshots for UI changes
   - List breaking changes

### Review Process

- Maintainers will review your PR
- Address review feedback
- Make requested changes
- Keep the PR updated

### Merge

Once approved, your PR will be merged by maintainers.

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Avoid `any` types
- Use proper type definitions

### React

- Use functional components
- Use hooks for state management
- Follow React best practices
- Use proper prop types

### Styling

- Use Tailwind CSS classes
- Follow the existing design system
- Use responsive design principles
- Ensure dark mode compatibility

### Code Quality

- Run ESLint before committing:
  ```bash
  npm run lint
  ```
- Format code with Prettier:
  ```bash
  npm run format
  ```
- Use Ruff for Python code:
  ```bash
  ruff check .
  ruff format .
  ```

## Testing Guidelines

### Unit Tests

- Write unit tests for utility functions
- Aim for high code coverage
- Test edge cases
- Use descriptive test names

### Integration Tests

- Test component integration
- Test API endpoints
- Test database operations
- Use test fixtures

### E2E Tests

- Test critical user flows
- Use Playwright for E2E testing
- Test across browsers
- Test on mobile devices

### Running Tests

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

## Documentation

### Code Documentation

- Add JSDoc comments for functions
- Document complex logic
- Add inline comments where necessary
- Keep documentation up to date

### README Updates

- Update README.md for new features
- Add examples for new APIs
- Update installation instructions if needed
- Update configuration documentation

### API Documentation

- Update OpenAPI specification for API changes
- Add examples for new endpoints
- Document breaking changes
- Update API version if needed

## Reporting Issues

### Bug Reports

When reporting bugs, include:
- Description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details
- Screenshots if applicable

### Feature Requests

When requesting features, include:
- Description of the feature
- Use case for the feature
- Proposed implementation
- Alternative approaches considered

### Security Issues

For security issues, please email security@ai-viz-portal.com instead of creating a public issue.

## Questions?

If you have questions about contributing:
- Check existing issues and discussions
- Ask in a new issue with the `question` label
- Join our community discussions

Thank you for contributing to AI Viz Portal!
