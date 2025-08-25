# 🛠️ Code Quality Setup Guide

## 📋 Overview

This project uses a comprehensive code quality setup with ESLint, Prettier, and Husky to ensure consistent code style, catch errors early, and maintain high code quality standards.

## 🔧 Tools & Configuration

### ESLint Configuration
- **Config File**: `.eslintrc.js`
- **Parser**: `@typescript-eslint/parser`
- **Extends**: 
  - ESLint recommended rules
  - TypeScript ESLint recommended rules
  - Import/export linting
  - Node.js best practices
  - Prettier integration

### Prettier Configuration
- **Config File**: `.prettierrc.js`
- **Features**:
  - Consistent code formatting
  - 100 character line width
  - Single quotes preferred
  - Trailing commas for cleaner diffs
  - 2-space indentation

### Husky Git Hooks
- **Pre-commit Hook**: Runs lint-staged and type checking
- **Configuration**: `.husky/pre-commit`

### Lint-staged
- **Purpose**: Only lint/format files that are staged for commit
- **Actions**:
  - ESLint with auto-fix
  - Prettier formatting
  - Type checking

## 📦 Available Scripts

```bash
# Linting
npm run lint              # Run ESLint on all TypeScript files
npm run lint:fix          # Run ESLint with auto-fix

# Formatting
npm run format            # Format all files with Prettier
npm run format:check      # Check if files are properly formatted

# Type Checking
npm run type-check        # Run TypeScript compiler without emitting files
npm run type-check:watch  # Run type checking in watch mode

# Code Quality (Combined)
npm run code-quality      # Run lint + format:check + type-check
npm run code-quality:fix  # Run lint:fix + format (auto-fix everything)
```

## 🚦 Pre-commit Process

When you commit code, the following happens automatically:

1. **Lint-staged runs** on staged files:
   - ESLint fixes issues automatically
   - Prettier formats code
   
2. **Type checking runs** on entire project:
   - Ensures no TypeScript errors
   
3. **Commit proceeds** only if all checks pass

## 📏 Code Style Rules

### TypeScript Rules
- **Unused variables**: Must start with `_` if intentionally unused
- **Explicit any**: Warned but allowed (legacy code compatibility)
- **Type safety**: Strict rules for async/await and promises
- **Import organization**: Alphabetical with proper grouping

### Code Quality Rules
- **No console.log**: Use proper logging instead
- **No debugger**: Removed in production
- **Prefer modern syntax**: const, arrow functions, template literals
- **Security rules**: No eval, no script URLs

### Import Organization
```typescript
// 1. Built-in modules
import fs from 'fs';
import path from 'path';

// 2. External libraries  
import express from 'express';
import redis from 'redis';

// 3. Internal modules
import { GameService } from '../services/gameService';
import logger from '../utils/logger';
```

## 🎯 Best Practices

### 1. Before Committing
```bash
# Check your code quality
npm run code-quality

# Auto-fix common issues
npm run code-quality:fix
```

### 2. Editor Integration
Configure your editor for:
- ESLint integration with auto-fix on save
- Prettier integration with format on save
- TypeScript error highlighting

### 3. Handling Pre-commit Failures

If pre-commit hooks fail:

```bash
# Fix linting issues
npm run lint:fix

# Fix formatting
npm run format

# Fix type errors manually, then
npm run type-check

# Try committing again
git commit -m "your message"
```

### 4. Bypassing Hooks (Emergency Only)
```bash
# Only use in emergencies
git commit --no-verify -m "emergency fix"
```

## ⚙️ Configuration Files

### `.eslintrc.js`
- Main ESLint configuration
- TypeScript-specific rules
- Import/export rules
- Security rules
- Prettier integration

### `.prettierrc.js`
- Code formatting rules
- File-specific overrides
- Consistent style settings

### `.prettierignore`
- Files to exclude from formatting
- Build outputs, logs, configs

### `package.json` - lint-staged
```json
{
  "lint-staged": {
    "src/**/*.{ts,js}": [
      "eslint --fix",
      "prettier --write"
    ],
    "src/**/*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

## 🔍 Troubleshooting

### Common Issues

1. **ESLint errors on commit**:
   ```bash
   npm run lint:fix
   git add .
   git commit -m "fix: resolve linting issues"
   ```

2. **Prettier formatting conflicts**:
   ```bash
   npm run format
   git add .
   git commit -m "style: format code with prettier"
   ```

3. **TypeScript errors**:
   - Fix manually in code
   - Run `npm run type-check` to verify

4. **Import resolution errors**:
   - Check file paths are correct
   - Ensure TypeScript configuration is proper

### Skipping Rules (Use Sparingly)

```typescript
// Disable specific rule for next line
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = response.data;

// Disable rule for entire file (avoid)
/* eslint-disable @typescript-eslint/no-explicit-any */
```

## 🎪 IDE Setup

### VS Code Extensions
- ESLint (dbaeumer.vscode-eslint)
- Prettier (esbenp.prettier-vscode)
- TypeScript Hero (rbbit.typescript-hero)

### VS Code Settings
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "prettier.requireConfig": true,
  "typescript.preferences.organizeImports": true
}
```

## 📊 Benefits

- **Consistent Code Style**: All team members follow same standards
- **Error Prevention**: Catch issues before they reach production  
- **Automated Fixes**: Many issues fixed automatically
- **Better Code Reviews**: Focus on logic, not style
- **Documentation**: Self-documenting code with proper formatting
- **Type Safety**: Prevent runtime errors with TypeScript checking

---

**Happy coding with high-quality standards!** 🚀