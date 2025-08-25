# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
- `yarn dev` - Start development server with nodemon
- `yarn build` - Compile TypeScript to dist/
- `yarn start` - Run compiled production build
- `yarn test` - Run Jest tests
- `yarn type-check` - Run TypeScript compiler without emit
- `yarn lint` - Run ESLint on source files
- `yarn lint:fix` - Auto-fix ESLint issues
- `yarn code-quality` - Run full quality check (lint + format + type-check)
- `yarn code-quality:fix` - Auto-fix all quality issues

### Database Commands
- `docker-compose -f docker-compose.dev.yml up postgres redis -d` - Start databases only
- `npx prisma generate` - Generate Prisma client
- `npx prisma migrate dev` - Run migrations in development
- `npx prisma db seed` - Seed database (if configured)

### Testing & Quality
The project uses strict TypeScript configuration with comprehensive ESLint rules. Always run `yarn code-quality` before committing. Tests use Jest framework.

## Architecture Overview

This is a **high-performance NFT collection management backend** built with:
- **Express.js** with TypeScript
- **Prisma ORM** with PostgreSQL
- **Redis** for caching and rate limiting
- **JWT authentication** with bcrypt password hashing
- **Comprehensive middleware** for security, logging, and error handling

### Key Architectural Patterns

**Database Layer**: Uses Prisma with performance monitoring (`queryWithMetrics`) and transaction retries. All queries are logged and monitored for performance.

**Authentication**: JWT-based auth with bcrypt password hashing. Supports both email/password and optional wallet address linking.

**Error Handling**: Centralized error handling with custom `AppError` class. All errors are logged with Winston.

**Security**: 
- Helmet for security headers
- CORS configuration
- Rate limiting (global + Redis-based)
- Input validation with Joi schemas
- Comprehensive logging for security events

**Performance**: 
- Connection pooling (20 max connections)
- Query performance monitoring
- Compression middleware
- Automatic cleanup of old records

## Project Structure

```
src/
├── app.ts              # Express app configuration with middleware
├── index.ts            # Server entry point with graceful shutdown
├── config/             # Database connections and configuration
├── lib/                # Prisma client with performance monitoring
├── middleware/         # Express middleware (auth, error handling, logging)
├── routes/             # API route definitions
├── services/           # Business logic layer
├── types/              # TypeScript type definitions
└── utils/              # Utilities (logger, performance monitoring)
```

### Database Schema (Prisma)

Core models:
- **User**: Email/password auth with optional wallet addresses
- **NFTCollection**: Collections with metadata and creator relationship  
- **NFT**: Individual tokens with attributes, rarity, and marketplace features
- **NFTTransaction**: Transaction history for minting, transfers, sales

All models use UUIDs and include proper indexing for performance at scale.

### Key Services

**AuthService** (`src/services/authService.ts`): Complete user management with registration, login, profile updates, and JWT token handling.

**CollectionService**: NFT collection management (referenced in routes but implementation may need completion based on current git status).

### Development Notes

- Uses strict TypeScript with `strict-type-checked` ESLint rules
- All database queries wrapped in `queryWithMetrics` for performance monitoring
- Comprehensive error logging with Winston
- Pre-commit hooks with lint-staged ensure code quality
- Supports clustering for production deployments

### Environment Requirements

- Node.js 18+
- PostgreSQL (via Docker)
- Redis (via Docker)
- Required env vars: DATABASE_URL, REDIS_URL, JWT_SECRET

### Testing Strategy

Jest testing framework configured. Run individual tests with `yarn test -- --testNamePattern="specific test"`.

### Important Implementation Details

- Always use the `queryWithMetrics` wrapper for database operations
- Error handling follows the `AppError` pattern for consistent responses
- All API endpoints should be documented with Swagger (available at `/api-docs`)
- Rate limiting is implemented at multiple layers - respect the 1 req/sec limit for sensitive operations