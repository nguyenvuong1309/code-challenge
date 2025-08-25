import swaggerJsdoc, { Options } from 'swagger-jsdoc';

const options: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mining Game Backend API',
      version: '1.0.0',
      description: `
## 🎮 High-Performance Web3 Mining Game Backend

A robust backend system designed for 1M+ concurrent users with comprehensive anti-cheat systems, 
wallet-based authentication, and advanced rate limiting.

### 🏗️ System Architecture
- **Express.js** with TypeScript and clustering
- **PostgreSQL** with performance indexes and connection pooling  
- **Redis** for rate limiting and caching
- **Docker** for containerization and scaling

### 🎯 Game Rules
- **1 tap = 1 coin = 1 energy consumed**
- **Energy regeneration**: 1 energy every 12 seconds (100 energy = 20 minutes)
- **Maximum energy**: 100
- **Rate limit**: 1 mining action per second per wallet
- **Authentication**: Ethereum wallet signature verification

### 🛡️ Security Features
- **Wallet-based authentication** with signature verification
- **Multi-layer rate limiting** (wallet-based, IP-based, burst protection)
- **Advanced anti-cheat system** with behavioral analysis
- **Request fingerprinting** and suspicious pattern detection
- **Comprehensive logging** and violation tracking

### 🚀 Performance Optimizations
- **Connection pooling** for database efficiency
- **Redis clustering** support for horizontal scaling
- **Query optimization** with performance indexes
- **Automatic cleanup** of historical data
- **Health monitoring** and metrics collection

## 📋 How to Use This API

### Authentication Flow
1. **Get Auth Message**: Call \`GET /api/auth/message/{wallet_address}\`
2. **Sign Message**: Use MetaMask or wallet to sign the returned message
3. **Login**: Call \`POST /api/auth/login\` with signature
4. **Use APIs**: Include wallet_address in subsequent requests

### Mining Flow
1. **Check Energy**: Call \`GET /api/game/energy/{wallet_address}\`
2. **Get Mining Message**: Call \`GET /api/game/mining-message/{wallet_address}/{nonce}\`
3. **Sign Message**: Sign the returned message with wallet
4. **Mine**: Call \`POST /api/game/mine\` with signature

### Rate Limiting
- All requests are rate limited based on wallet address
- Mining actions: **1 request per second per wallet**
- General APIs: **1 request per second per wallet**
- Check rate limit status: \`GET /api/game/rate-limit/{wallet_address}\`

### Error Handling
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid signature)
- **403**: Forbidden (banned account or anti-cheat violation)
- **429**: Too Many Requests (rate limit exceeded)
- **500**: Internal Server Error

---
*⚠️ **Security Note**: Never share your private keys. All signatures should be generated client-side using secure wallet software.*
      `,
      contact: {
        name: 'Mining Game Support',
        email: 'support@example.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://api.mining-game.example.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        WalletSignature: {
          type: 'apiKey',
          in: 'body',
          name: 'signature',
          description: `
**Ethereum Wallet Signature Authentication**

This API uses Ethereum wallet signatures for authentication instead of traditional tokens.

**Process:**
1. Get message to sign from \`/api/auth/message/{wallet_address}\`
2. Sign the message using your Ethereum wallet (MetaMask, etc.)
3. Include the signature in your request body along with wallet_address

**Security:**
- Each message includes a timestamp to prevent replay attacks
- Signatures are valid for 5 minutes after generation
- All mining actions require fresh signatures with nonces
          `,
        },
      },
      parameters: {
        WalletAddress: {
          name: 'wallet_address',
          in: 'path',
          required: true,
          description: 'Ethereum wallet address (42 characters, starts with 0x)',
          schema: {
            type: 'string',
            pattern: '^0x[a-fA-F0-9]{40}$',
            example: '0x742d35Cc6634C0532925a3b8D397b5dcEF72b0d1',
          },
        },
        Page: {
          name: 'page',
          in: 'query',
          required: false,
          description: 'Page number for pagination (starts from 1)',
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1,
            example: 1,
          },
        },
        Limit: {
          name: 'limit',
          in: 'query',
          required: false,
          description: 'Number of items per page',
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 20,
            example: 20,
          },
        },
      },
      headers: {
        RateLimitHeaders: {
          description: 'Rate limiting information headers',
          schema: {
            type: 'object',
            properties: {
              'X-RateLimit-Limit': {
                type: 'string',
                description: 'Request limit per time window',
                example: '1',
              },
              'X-RateLimit-Remaining': {
                type: 'string',
                description: 'Remaining requests in current window',
                example: '0',
              },
              'X-RateLimit-Reset': {
                type: 'string',
                description: 'Unix timestamp when rate limit resets',
                example: '1635724860',
              },
              'Retry-After': {
                type: 'string',
                description: 'Seconds to wait before retrying (when rate limited)',
                example: '1',
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Wallet-based authentication endpoints using Ethereum signatures',
      },
      {
        name: 'Game Actions',
        description: 'Core game mechanics - mining actions and energy management',
      },
      {
        name: 'Player Info',
        description: 'Player profile, statistics, and history tracking',
      },
      {
        name: 'Health',
        description: 'System health monitoring and status checks',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/schemas/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
