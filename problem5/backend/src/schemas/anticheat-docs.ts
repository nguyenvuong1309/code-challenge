/**
 * @swagger
 * components:
 *   schemas:
 *     AntiCheatSystem:
 *       description: |
 *         ## 🛡️ Anti-Cheat System Documentation
 *
 *         The Mining Game Backend implements a comprehensive multi-layer anti-cheat system
 *         designed to detect and prevent various forms of cheating and automated behavior.
 *
 *         ### 🔍 Detection Methods
 *
 *         #### 1. Request Timing Analysis
 *         - **TOO_FAST_REQUESTS**: Actions performed faster than humanly possible
 *         - **REGULAR_TIMING_PATTERN**: Perfectly regular intervals indicating automation
 *         - **EXCESSIVE_MINING_FREQUENCY**: Mining at maximum rate for extended periods
 *
 *         #### 2. Network Fingerprinting
 *         - **MULTIPLE_IP_ADDRESSES**: Same wallet used from different IP addresses rapidly
 *         - **MULTIPLE_USER_AGENTS**: Inconsistent browser/client identification
 *         - **BOT_USER_AGENT**: Known bot or automation tool user-agents
 *
 *         #### 3. Cryptographic Security
 *         - **INVALID_SIGNATURE**: Failed wallet signature verification
 *         - **DUPLICATE_NONCE**: Reuse of nonces (replay attack attempts)
 *         - **EXPIRED_SIGNATURE**: Using expired authentication tokens
 *
 *         #### 4. Behavioral Pattern Analysis
 *         - **SUSPICIOUS_PATTERN**: AI-based detection of non-human behavior patterns
 *         - **BURST_MINING**: Attempting to mine multiple times rapidly
 *         - **ENERGY_MANIPULATION**: Attempting to mine without sufficient energy
 *
 *         ### ⚖️ Violation Severity Levels
 *
 *         Each violation is assigned a severity score from 1-5:
 *
 *         | Level | Description | Action | Examples |
 *         |-------|-------------|--------|----------|
 *         | 1 | Low - Possible false positive | Log only | Slightly fast requests |
 *         | 2 | Medium - Suspicious behavior | Warning | Multiple IPs, irregular patterns |
 *         | 3 | High - Likely cheating | Temporary restrictions | Bot user agents, regular timing |
 *         | 4 | Critical - Clear cheating | Account flagging | Signature manipulation |
 *         | 5 | Extreme - Malicious activity | Immediate ban | Replay attacks, system abuse |
 *
 *         ### 📊 Scoring System
 *
 *         Each player has a cumulative suspicious score:
 *         - **0-10**: Clean account, no restrictions
 *         - **11-25**: Monitored account, additional logging
 *         - **26-50**: Flagged account, temporary restrictions
 *         - **51-100**: Banned account, no mining allowed
 *
 *         ### 🚨 Response Actions
 *
 *         Based on violation type and score:
 *
 *         #### NONE (Score: 0-10)
 *         - Action logged for analysis
 *         - No restrictions applied
 *
 *         #### WARNING (Score: 11-25)
 *         - Player notified of suspicious activity
 *         - Increased monitoring enabled
 *         - Rate limiting may be stricter
 *
 *         #### TEMP_BAN (Score: 26-50)
 *         - Mining disabled for 24-48 hours
 *         - Account marked for manual review
 *         - Re-evaluation after cooling period
 *
 *         #### PERMANENT_BAN (Score: 51+)
 *         - All mining activities blocked
 *         - Account permanently flagged
 *         - Manual appeal process required
 *
 *         #### BLOCKED (Immediate)
 *         - Current action blocked
 *         - No scoring applied
 *         - Used for rate limiting violations
 *
 *         ### 🔧 Configuration Parameters
 *
 *         #### Timing Thresholds
 *         ```
 *         MIN_ACTION_INTERVAL: 1000ms (1 second)
 *         HUMAN_VARIANCE_THRESHOLD: 200ms
 *         REGULAR_PATTERN_THRESHOLD: 50ms deviation
 *         BURST_WINDOW: 5 seconds
 *         ```
 *
 *         #### Network Security
 *         ```
 *         MAX_IP_CHANGES: 3 per hour
 *         USER_AGENT_STABILITY: Must be consistent per session
 *         SIGNATURE_EXPIRY: 30 seconds for mining, 5 minutes for auth
 *         ```
 *
 *         #### Behavioral Analysis
 *         ```
 *         PATTERN_ANALYSIS_WINDOW: 100 actions
 *         ENTROPY_THRESHOLD: Minimum randomness required
 *         MACHINE_LEARNING_MODEL: Real-time pattern detection
 *         ```
 *
 *         ### 📈 Monitoring & Analytics
 *
 *         The system provides real-time monitoring:
 *
 *         #### Violation Tracking
 *         - Real-time violation counts by type
 *         - Player risk score distributions
 *         - False positive rate monitoring
 *
 *         #### Performance Metrics
 *         - Detection latency (< 10ms target)
 *         - System accuracy rates
 *         - Resource utilization tracking
 *
 *         #### Alert System
 *         - Immediate alerts for severity 4+ violations
 *         - Daily reports on system performance
 *         - Trending analysis for new attack patterns
 *
 *         ### 🛠️ Developer Integration
 *
 *         #### Error Handling
 *         ```javascript
 *         // Example error responses
 *         {
 *           "success": false,
 *           "error": "Action blocked by anti-cheat system: SUSPICIOUS_PATTERN",
 *           "code": "ANTICHEAT_VIOLATION",
 *           "details": {
 *             "violation_type": "SUSPICIOUS_PATTERN",
 *             "severity": 3,
 *             "current_score": 35,
 *             "action_taken": "TEMP_BAN"
 *           }
 *         }
 *         ```
 *
 *         #### Rate Limiting Headers
 *         ```
 *         X-RateLimit-Remaining: 0
 *         X-RateLimit-Reset: 1635724861
 *         X-AntiCheat-Score: 25
 *         X-AntiCheat-Status: MONITORED
 *         ```
 *
 *         ### ⚠️ Important Notes
 *
 *         #### For Legitimate Users
 *         - Use consistent network connection when possible
 *         - Don't use automation tools or scripts
 *         - Maintain reasonable mining intervals (1+ second between actions)
 *         - Use official wallet software for signing
 *
 *         #### For Developers
 *         - Always handle anti-cheat errors gracefully
 *         - Implement proper retry logic with exponential backoff
 *         - Never attempt to bypass or circumvent detection systems
 *         - Contact support for false positive reports
 *
 *         ### 📞 Support & Appeals
 *
 *         If you believe you've been incorrectly flagged:
 *         1. Stop all mining activities immediately
 *         2. Document the issue with timestamps and actions taken
 *         3. Contact support with your wallet address and evidence
 *         4. Wait for manual review (typically 24-48 hours)
 *
 *         **Remember**: The anti-cheat system is designed to protect the game economy
 *         and ensure fair play for all legitimate players.
 *
 *       type: object
 *       properties:
 *         documentation:
 *           type: string
 *           description: This schema exists only for documentation purposes
 *
 *     ViolationTypes:
 *       type: object
 *       description: |
 *         ## 🚫 Complete Anti-Cheat Violation Reference
 *
 *         ### Timing-Based Violations
 *
 *       properties:
 *         TOO_FAST_REQUESTS:
 *           type: object
 *           description: |
 *             **Actions performed faster than humanly possible**
 *
 *             - **Trigger**: Actions within < 500ms intervals
 *             - **Severity**: 3-4
 *             - **Action**: Warning → Temp Ban
 *             - **Example**: Clicking mine button rapidly via automation
 *           properties:
 *             severity: { type: integer, example: 3 }
 *             threshold: { type: string, example: "500ms minimum interval" }
 *             typical_action: { type: string, example: "WARNING" }
 *
 *         REGULAR_TIMING_PATTERN:
 *           type: object
 *           description: |
 *             **Perfectly regular intervals indicating bot behavior**
 *
 *             - **Trigger**: Actions with < 50ms timing variance over 20+ actions
 *             - **Severity**: 4
 *             - **Action**: Temp Ban
 *             - **Example**: Script mining exactly every 1000ms
 *           properties:
 *             severity: { type: integer, example: 4 }
 *             threshold: { type: string, example: "< 50ms variance over 20 actions" }
 *             typical_action: { type: string, example: "TEMP_BAN" }
 *
 *         EXCESSIVE_MINING_FREQUENCY:
 *           type: object
 *           description: |
 *             **Mining at maximum possible rate for extended periods**
 *
 *             - **Trigger**: Mining at exactly 1-second intervals for > 100 consecutive actions
 *             - **Severity**: 3
 *             - **Action**: Warning → Monitoring
 *             - **Example**: Perfect rate mining without breaks
 *           properties:
 *             severity: { type: integer, example: 3 }
 *             threshold: { type: string, example: "100+ consecutive 1s interval actions" }
 *             typical_action: { type: string, example: "WARNING" }
 *
 *         MULTIPLE_IP_ADDRESSES:
 *           type: object
 *           description: |
 *             **Same wallet used from different IP addresses rapidly**
 *
 *             - **Trigger**: > 3 IP changes within 1 hour
 *             - **Severity**: 2-3
 *             - **Action**: Monitoring → Warning
 *             - **Example**: Account sharing or VPN switching
 *           properties:
 *             severity: { type: integer, example: 2 }
 *             threshold: { type: string, example: "3 IP changes per hour" }
 *             typical_action: { type: string, example: "WARNING" }
 *
 *         MULTIPLE_USER_AGENTS:
 *           type: object
 *           description: |
 *             **Inconsistent browser/client identification within session**
 *
 *             - **Trigger**: User-Agent changes within same session
 *             - **Severity**: 2
 *             - **Action**: Monitoring
 *             - **Example**: Browser switching or header manipulation
 *           properties:
 *             severity: { type: integer, example: 2 }
 *             threshold: { type: string, example: "User-Agent change in session" }
 *             typical_action: { type: string, example: "MONITORING" }
 *
 *         BOT_USER_AGENT:
 *           type: object
 *           description: |
 *             **Known bot or automation tool user-agents detected**
 *
 *             - **Trigger**: User-Agent matches known bot patterns
 *             - **Severity**: 4-5
 *             - **Action**: Immediate Block → Temp Ban
 *             - **Example**: "curl", "wget", "puppeteer", "selenium", etc.
 *           properties:
 *             severity: { type: integer, example: 4 }
 *             threshold: { type: string, example: "Known bot user-agent patterns" }
 *             typical_action: { type: string, example: "BLOCKED" }
 *
 *         INVALID_SIGNATURE:
 *           type: object
 *           description: |
 *             **Failed wallet signature verification**
 *
 *             - **Trigger**: Signature doesn't match wallet + message
 *             - **Severity**: 4-5
 *             - **Action**: Block → Temp Ban
 *             - **Example**: Signature manipulation or wallet impersonation
 *           properties:
 *             severity: { type: integer, example: 4 }
 *             threshold: { type: string, example: "Cryptographic verification failure" }
 *             typical_action: { type: string, example: "BLOCKED" }
 *
 *         DUPLICATE_NONCE:
 *           type: object
 *           description: |
 *             **Reuse of nonces indicating replay attack attempts**
 *
 *             - **Trigger**: Same nonce used multiple times for mining
 *             - **Severity**: 5
 *             - **Action**: Immediate Ban
 *             - **Example**: Replaying previous valid mining requests
 *           properties:
 *             severity: { type: integer, example: 5 }
 *             threshold: { type: string, example: "Any nonce reuse" }
 *             typical_action: { type: string, example: "PERMANENT_BAN" }
 *
 *         SUSPICIOUS_PATTERN:
 *           type: object
 *           description: |
 *             **AI-based detection of non-human behavior patterns**
 *
 *             - **Trigger**: Machine learning model confidence > 85%
 *             - **Severity**: 3-4
 *             - **Action**: Warning → Temp Ban
 *             - **Example**: Complex behavioral patterns indicating automation
 *           properties:
 *             severity: { type: integer, example: 3 }
 *             threshold: { type: string, example: "ML model confidence > 85%" }
 *             typical_action: { type: string, example: "WARNING" }
 *
 * tags:
 *   - name: Anti-Cheat Documentation
 *     description: Complete anti-cheat system documentation and violation reference
 */

export const antiCheatDocumentation = {
  info: 'This file contains comprehensive anti-cheat system documentation for Swagger',
  version: '1.0.0',
};
