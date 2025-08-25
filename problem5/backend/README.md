# Mining Game Backend

High-performance backend system for a Web3 mining/clicker game built with Node.js, Express, PostgreSQL, and Redis. Designed to handle 1M+ concurrent users with comprehensive anti-cheat systems and rate limiting.

## 🎮 Game Rules

- **1 tap = 1 coin = 1 energy**
- **Energy regeneration**: 1 energy per 12 seconds (100 energy = 20 minutes)
- **Max energy**: 100
- **Rate limit**: 1 action per second per user
- **Anti-cheat**: Comprehensive signature verification and behavior analysis

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Load Balancer │────│   Express Apps   │────│   PostgreSQL    │
│    (Optional)   │    │   (Clustered)    │    │   (Master/Slave)│
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                       ┌──────────────────┐
                       │      Redis       │
                       │  (Rate Limiting, │
                       │   Caching, etc.) │
                       └──────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Git

### 1. Clone and Setup

```bash
cd problem5/backend
cp .env.example .env
# Edit .env with your configuration
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start with Docker

```bash
docker-compose up --build
```

The backend will be available at `http://localhost:3000`

### 4. Development Mode

```bash
# Start databases only
docker-compose up postgres redis -d

# Run in development mode
npm run dev
```

## 📊 Database Schema

### Core Tables

- **players**: User accounts with wallet authentication
- **mining_sessions**: Individual mining action records  
- **action_history**: Detailed action tracking for anti-cheat
- **anti_cheat_logs**: Security violation records

### Key Features

- **Wallet-based authentication** using Ethereum signatures
- **Energy regeneration system** with PostgreSQL functions
- **Performance indexes** for 1M+ users
- **Automatic cleanup** of old records

## 🛡️ Security Features

### Anti-Cheat System

- **Signature verification** for all mining actions
- **Behavioral analysis** detecting automation patterns
- **Rate limiting** at multiple levels (global, wallet, IP)
- **IP reputation tracking**
- **Request fingerprinting**
- **Suspicious activity scoring**

### Rate Limiting

- **1 request/second per wallet** for mining actions
- **Burst protection** (max 5 requests in 10 seconds)
- **IP-based fallback** rate limiting
- **Redis-based** with atomic operations

## 🔌 API Endpoints

### Authentication
```http
GET  /api/auth/message/:wallet_address     # Get signing message
POST /api/auth/login                       # Wallet login
POST /api/auth/verify                      # Verify signature
```

### Game Actions
```http
POST /api/game/mine                        # Mining action (1 tap)
GET  /api/game/mining-message/:wallet/:nonce  # Get mining message
GET  /api/game/stats/:wallet_address       # Mining statistics
GET  /api/game/energy/:wallet_address      # Current energy status
GET  /api/game/rate-limit/:wallet_address  # Rate limit status
```

### Player Info
```http
GET /api/player/:wallet_address           # Complete player profile
GET /api/player/:wallet_address/history   # Action history (paginated)
GET /api/player/:wallet_address/sessions  # Mining sessions
GET /api/player/:wallet_address/security  # Security/anti-cheat info
```

### Health Checks
```http
GET /health                               # Health check
GET /health/ready                         # Kubernetes readiness
GET /health/live                          # Kubernetes liveness
```

## 📋 API Usage Examples

### 1. Wallet Login

```bash
# Get message to sign
curl "http://localhost:3000/api/auth/message/0x742d35Cc6634C0532925a3b8D397b5dcEF72b0d1"

# Login with signature
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_address": "0x742d35Cc6634C0532925a3b8D397b5dcEF72b0d1",
    "signature": "0x...",
    "message": "Login to Mining Game\nWallet: 0x742d35Cc6634C0532925a3b8D397b5dcEF72b0d1\nTimestamp: 1635724800000",
    "timestamp": 1635724800000
  }'
```

### 2. Mining Action

```bash
# Get mining message
curl "http://localhost:3000/api/game/mining-message/0x742d35Cc6634C0532925a3b8D397b5dcEF72b0d1/abc123"

# Execute mining
curl -X POST http://localhost:3000/api/game/mine \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_address": "0x742d35Cc6634C0532925a3b8D397b5dcEF72b0d1",
    "signature": "0x...",
    "timestamp": 1635724800000,
    "nonce": "abc123"
  }'
```

### 3. Check Player Stats

```bash
curl "http://localhost:3000/api/player/0x742d35Cc6634C0532925a3b8D397b5dcEF72b0d1"
```

## 🔧 Configuration

### Environment Variables

```bash
NODE_ENV=production              # Environment
PORT=3000                       # Server port
DATABASE_URL=postgresql://...    # PostgreSQL connection
REDIS_URL=redis://...           # Redis connection
ALLOWED_ORIGINS=http://...      # CORS origins
LOG_LEVEL=info                  # Logging level
```

### Performance Settings

- **Connection pooling**: 20 max connections per instance
- **Clustering**: Automatically scales to CPU cores in production
- **Query monitoring**: Logs slow queries (>100ms)
- **Automatic cleanup**: Removes old records periodically

## 🚀 Production Deployment

### Docker Production

```bash
# Build production image
docker build -t mining-game-backend .

# Run with production config
docker-compose -f docker-compose.prod.yml up -d
```

### Scaling Considerations

1. **Horizontal scaling**: Multiple app instances behind load balancer
2. **Database scaling**: Read replicas for query distribution  
3. **Redis clustering**: For rate limiting at scale
4. **CDN**: For static assets and API caching
5. **Monitoring**: Comprehensive logging and metrics

### Performance Optimizations

- **Database indexes** on all query columns
- **Connection pooling** with automatic management
- **Query optimization** with EXPLAIN analysis
- **Memory caching** for frequently accessed data
- **Batch processing** for bulk operations

## 📊 Monitoring & Logging

### Health Monitoring

```bash
curl http://localhost:3000/health
```

### Performance Metrics

- Connection pool utilization
- Query execution times
- Rate limiting statistics
- Anti-cheat detection rates
- Memory and CPU usage

### Log Files

```
logs/
├── error.log      # Error logs only
├── combined.log   # All log levels
└── access.log     # HTTP requests (production)
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Load testing
npm run load:test
```

## 🔒 Security Best Practices

1. **Never expose private keys** in code or logs
2. **Validate all inputs** with Joi schemas
3. **Rate limit everything** to prevent abuse
4. **Monitor suspicious activity** continuously
5. **Use HTTPS** in production
6. **Regular security audits** of dependencies

## 📈 Performance Benchmarks

Expected performance with proper infrastructure:

- **1M concurrent users**
- **Sub-100ms** response times for mining actions
- **99.9% uptime** with proper monitoring
- **Horizontal scaling** to handle traffic spikes

## 🛠️ Development

### Project Structure

```
src/
├── config/          # Database and Redis configuration
├── controllers/     # Business logic controllers  
├── middleware/      # Express middleware (auth, rate limiting, etc.)
├── models/          # Database models and schemas
├── routes/          # API route definitions
├── services/        # Business logic services
├── types/           # TypeScript type definitions
└── utils/           # Utility functions and helpers
```

### Code Style

- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for formatting
- **Joi** for validation
- **Winston** for logging

## 🤝 Contributing

1. Follow existing code patterns
2. Add comprehensive tests
3. Update documentation
4. Follow security best practices
5. Performance test any changes

## ⚠️ Important Notes

- This is a **backend-only** implementation
- **No frontend** is included
- Designed for **high performance** and **security**
- Requires proper **infrastructure** for 1M users
- **Production deployment** needs additional monitoring and scaling

## 📞 Support

For issues or questions:
1. Check the logs in `logs/` directory
2. Verify database and Redis connections
3. Check rate limiting status
4. Review anti-cheat logs for blocked actions