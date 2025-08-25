/**
 * @swagger
 * components:
 *   schemas:
 *     Player:
 *       type: object
 *       required:
 *         - wallet_address
 *         - username
 *         - total_coins
 *         - energy
 *         - created_at
 *       properties:
 *         wallet_address:
 *           type: string
 *           pattern: '^0x[a-fA-F0-9]{40}$'
 *           description: 'Ethereum wallet address'
 *           example: '0x742d35Cc6634C0532925a3b8D397b5dcEF72b0d1'
 *         username:
 *           type: string
 *           maxLength: 50
 *           description: 'Player display name'
 *           example: 'Player_72b0d1'
 *         total_coins:
 *           type: integer
 *           minimum: 0
 *           description: 'Total coins earned by player'
 *           example: 1500
 *         energy:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *           description: 'Current player energy (0-100)'
 *           example: 85
 *         last_action_time:
 *           type: string
 *           format: date-time
 *           description: 'Timestamp of last player action'
 *           example: '2023-11-01T10:30:00Z'
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 'Player registration timestamp'
 *           example: '2023-10-01T08:15:30Z'
 *
 *     MiningSession:
 *       type: object
 *       required:
 *         - session_id
 *         - player_wallet
 *         - coins_earned
 *         - energy_used
 *         - created_at
 *       properties:
 *         session_id:
 *           type: string
 *           format: uuid
 *           description: 'Unique session identifier'
 *           example: '123e4567-e89b-12d3-a456-426614174000'
 *         player_wallet:
 *           type: string
 *           pattern: '^0x[a-fA-F0-9]{40}$'
 *           description: 'Player wallet address'
 *           example: '0x742d35Cc6634C0532925a3b8D397b5dcEF72b0d1'
 *         coins_earned:
 *           type: integer
 *           minimum: 1
 *           description: 'Coins earned in this session (always 1)'
 *           example: 1
 *         energy_used:
 *           type: integer
 *           minimum: 1
 *           description: 'Energy consumed in this session (always 1)'
 *           example: 1
 *         action_count:
 *           type: integer
 *           minimum: 1
 *           description: 'Number of actions in this session'
 *           example: 1
 *         ip_address:
 *           type: string
 *           format: ipv4
 *           description: 'Client IP address (for anti-cheat)'
 *           example: '192.168.1.100'
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 'Session creation timestamp'
 *           example: '2023-11-01T10:30:00Z'
 *
 *     ActionHistory:
 *       type: object
 *       required:
 *         - action_id
 *         - player_wallet
 *         - action_type
 *         - timestamp
 *       properties:
 *         action_id:
 *           type: string
 *           format: uuid
 *           description: 'Unique action identifier'
 *           example: '123e4567-e89b-12d3-a456-426614174001'
 *         player_wallet:
 *           type: string
 *           pattern: '^0x[a-fA-F0-9]{40}$'
 *           description: 'Player wallet address'
 *           example: '0x742d35Cc6634C0532925a3b8D397b5dcEF72b0d1'
 *         action_type:
 *           type: string
 *           enum: ['MINE', 'LOGIN', 'ENERGY_REGEN']
 *           description: 'Type of action performed'
 *           example: 'MINE'
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: 'Action timestamp'
 *           example: '2023-11-01T10:30:00Z'
 *         coins_earned:
 *           type: integer
 *           minimum: 0
 *           description: 'Coins earned from this action'
 *           example: 1
 *         energy_delta:
 *           type: integer
 *           description: 'Energy change (negative for consumption, positive for regeneration)'
 *           example: -1
 *         ip_address:
 *           type: string
 *           format: ipv4
 *           description: 'Client IP address'
 *           example: '192.168.1.100'
 *         response_time_ms:
 *           type: integer
 *           minimum: 0
 *           description: 'Server response time in milliseconds'
 *           example: 45
 *         validated:
 *           type: boolean
 *           description: 'Whether action passed validation'
 *           example: true
 *
 *     AntiCheatLog:
 *       type: object
 *       required:
 *         - log_id
 *         - player_wallet
 *         - violation_type
 *         - severity
 *         - detected_at
 *       properties:
 *         log_id:
 *           type: string
 *           format: uuid
 *           description: 'Unique log identifier'
 *           example: '123e4567-e89b-12d3-a456-426614174002'
 *         player_wallet:
 *           type: string
 *           pattern: '^0x[a-fA-F0-9]{40}$'
 *           description: 'Player wallet address'
 *           example: '0x742d35Cc6634C0532925a3b8D397b5dcEF72b0d1'
 *         violation_type:
 *           type: string
 *           enum:
 *             - 'RATE_LIMIT'
 *             - 'INVALID_SIGNATURE'
 *             - 'SUSPICIOUS_PATTERN'
 *             - 'EXCESSIVE_MINING_FREQUENCY'
 *             - 'MULTIPLE_IP_ADDRESSES'
 *             - 'MULTIPLE_USER_AGENTS'
 *             - 'DUPLICATE_NONCE'
 *             - 'BOT_USER_AGENT'
 *             - 'TOO_FAST_REQUESTS'
 *             - 'REGULAR_TIMING_PATTERN'
 *           description: 'Type of violation detected'
 *           example: 'SUSPICIOUS_PATTERN'
 *         severity:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           description: 'Violation severity (1=low, 5=critical)'
 *           example: 3
 *         evidence_data:
 *           type: object
 *           description: 'JSON data containing violation evidence'
 *           example:
 *             score: 25
 *             violations: ['MULTIPLE_IP_ADDRESSES']
 *             endpoint: '/api/game/mine'
 *         detected_at:
 *           type: string
 *           format: date-time
 *           description: 'Violation detection timestamp'
 *           example: '2023-11-01T10:30:00Z'
 *         action_taken:
 *           type: string
 *           enum: ['NONE', 'WARNING', 'TEMP_BAN', 'PERMANENT_BAN', 'BLOCKED', 'FLAGGED', 'LOGGED']
 *           description: 'Action taken in response to violation'
 *           example: 'WARNING'
 *
 *     AuthRequest:
 *       type: object
 *       required:
 *         - wallet_address
 *         - signature
 *         - message
 *         - timestamp
 *       properties:
 *         wallet_address:
 *           type: string
 *           pattern: '^0x[a-fA-F0-9]{40}$'
 *           description: 'Ethereum wallet address'
 *           example: '0x742d35Cc6634C0532925a3b8D397b5dcEF72b0d1'
 *         signature:
 *           type: string
 *           description: 'Ethereum signature of the message'
 *           example: '0x1234567890abcdef...'
 *         message:
 *           type: string
 *           description: 'Exact message that was signed'
 *           example: 'Login to Mining Game\\nWallet: 0x742d35Cc6634C0532925a3b8D397b5dcEF72b0d1\\nTimestamp: 1635724800000'
 *         timestamp:
 *           type: integer
 *           description: 'Unix timestamp in milliseconds (must be within 5 minutes)'
 *           example: 1635724800000
 *
 *     MineRequest:
 *       type: object
 *       required:
 *         - wallet_address
 *         - signature
 *         - timestamp
 *         - nonce
 *       properties:
 *         wallet_address:
 *           type: string
 *           pattern: '^0x[a-fA-F0-9]{40}$'
 *           description: 'Ethereum wallet address'
 *           example: '0x742d35Cc6634C0532925a3b8D397b5dcEF72b0d1'
 *         signature:
 *           type: string
 *           description: 'Ethereum signature of the mining message'
 *           example: '0x1234567890abcdef...'
 *         timestamp:
 *           type: integer
 *           description: 'Unix timestamp in milliseconds (must be within 30 seconds)'
 *           example: 1635724800000
 *         nonce:
 *           type: string
 *           minLength: 8
 *           maxLength: 64
 *           description: 'Unique nonce to prevent replay attacks'
 *           example: 'abc123xyz789'
 *
 *     RateLimitInfo:
 *       type: object
 *       required:
 *         - remaining
 *         - resetTime
 *         - blocked
 *       properties:
 *         remaining:
 *           type: integer
 *           minimum: 0
 *           description: 'Remaining requests in current window'
 *           example: 0
 *         resetTime:
 *           type: integer
 *           description: 'Unix timestamp when rate limit resets'
 *           example: 1635724860000
 *         blocked:
 *           type: boolean
 *           description: 'Whether requests are currently blocked'
 *           example: true
 *
 *     PlayerStats:
 *       type: object
 *       properties:
 *         wallet_address:
 *           type: string
 *           pattern: '^0x[a-fA-F0-9]{40}$'
 *           example: '0x742d35Cc6634C0532925a3b8D397b5dcEF72b0d1'
 *         username:
 *           type: string
 *           example: 'Player_72b0d1'
 *         total_coins:
 *           type: integer
 *           example: 1500
 *         current_energy:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *           example: 85
 *         total_sessions:
 *           type: integer
 *           example: 1500
 *         coins_today:
 *           type: integer
 *           example: 50
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: '2023-10-01T08:15:30Z'
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: '2023-11-01T10:30:00Z'
 *
 *     Pagination:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *         limit:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           example: 20
 *         total_records:
 *           type: integer
 *           minimum: 0
 *           example: 150
 *         total_pages:
 *           type: integer
 *           minimum: 0
 *           example: 8
 *         has_next:
 *           type: boolean
 *           example: true
 *         has_previous:
 *           type: boolean
 *           example: false
 *
 *     SuccessResponse:
 *       type: object
 *       required:
 *         - success
 *         - data
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           description: 'Response data (varies by endpoint)'
 *
 *     ErrorResponse:
 *       type: object
 *       required:
 *         - success
 *         - error
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           description: 'Error message'
 *           example: 'Invalid wallet address format'
 *
 *     ValidationError:
 *       allOf:
 *         - $ref: '#/components/schemas/ErrorResponse'
 *         - type: object
 *           properties:
 *             error:
 *               example: 'Invalid wallet address format'
 *           example:
 *             success: false
 *             error: 'Invalid wallet address format'
 *
 *     UnauthorizedError:
 *       allOf:
 *         - $ref: '#/components/schemas/ErrorResponse'
 *         - type: object
 *           properties:
 *             error:
 *               example: 'Invalid signature'
 *           example:
 *             success: false
 *             error: 'Invalid signature'
 *
 *     ForbiddenError:
 *       allOf:
 *         - $ref: '#/components/schemas/ErrorResponse'
 *         - type: object
 *           properties:
 *             error:
 *               example: 'Account is banned'
 *           example:
 *             success: false
 *             error: 'Account is banned'
 *
 *     RateLimitError:
 *       allOf:
 *         - $ref: '#/components/schemas/ErrorResponse'
 *         - type: object
 *           properties:
 *             error:
 *               example: 'Rate limit exceeded. Try again in 1 second.'
 *           example:
 *             success: false
 *             error: 'Rate limit exceeded. Try again in 1 second.'
 *
 *     AntiCheatError:
 *       allOf:
 *         - $ref: '#/components/schemas/ErrorResponse'
 *         - type: object
 *           properties:
 *             error:
 *               example: 'Action blocked by anti-cheat system'
 *           example:
 *             success: false
 *             error: 'Action blocked by anti-cheat system'
 *
 *     NotFoundError:
 *       allOf:
 *         - $ref: '#/components/schemas/ErrorResponse'
 *         - type: object
 *           properties:
 *             error:
 *               example: 'Player not found'
 *           example:
 *             success: false
 *             error: 'Player not found'
 *
 *     InternalServerError:
 *       allOf:
 *         - $ref: '#/components/schemas/ErrorResponse'
 *         - type: object
 *           properties:
 *             error:
 *               example: 'Internal server error'
 *           example:
 *             success: false
 *             error: 'Internal server error'
 */

// This file contains Swagger schema definitions for the Mining Game Backend API
