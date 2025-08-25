# System Architecture Diagrams

## 1. High-Level System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Client<br/>React/Vue]
        MOB[Mobile App<br/>React Native]
    end
    
    subgraph "CDN & Load Balancer"
        CDN[CloudFlare CDN]
        LB[Load Balancer<br/>Nginx/HAProxy]
    end
    
    subgraph "API Gateway Layer"
        GW[API Gateway<br/>Kong/AWS API Gateway]
    end
    
    subgraph "Microservices"
        AUTH[Auth Service<br/>Node.js]
        GAME[Game Service<br/>Node.js]
        RT[Real-time Service<br/>Node.js + Socket.IO]
        ANALYTICS[Analytics Service<br/>Node.js]
    end
    
    subgraph "Data Layer"
        PG1[(PostgreSQL<br/>Users & Auth)]
        PG2[(PostgreSQL<br/>Game Data)]
        REDIS[(Redis<br/>Cache & Leaderboard)]
        INFLUX[(InfluxDB<br/>Analytics)]
    end
    
    subgraph "External Services"
        BLOCKCHAIN[Blockchain Network<br/>Ethereum/Polygon]
        MONITORING[Monitoring<br/>Grafana/Prometheus]
    end
    
    WEB --> CDN
    MOB --> CDN
    CDN --> LB
    LB --> GW
    
    GW --> AUTH
    GW --> GAME
    GW --> RT
    GW --> ANALYTICS
    
    AUTH --> PG1
    GAME --> PG2
    GAME --> REDIS
    RT --> REDIS
    ANALYTICS --> INFLUX
    
    GAME --> BLOCKCHAIN
    ALL_SERVICES --> MONITORING
```

## 2. Real-time Communication Flow

```mermaid
sequenceDiagram
    participant Client
    participant Gateway
    participant GameService
    participant RealtimeService
    participant Redis
    participant Database
    participant Blockchain
    
    Client->>Gateway: POST /game/action
    Gateway->>GameService: Forward request
    
    GameService->>GameService: Validate rate limit
    GameService->>GameService: Validate JWT token
    GameService->>GameService: Check game logic
    
    GameService->>Blockchain: Verify proof
    Blockchain-->>GameService: Proof validation result
    
    GameService->>Database: Save action
    GameService->>Database: Update user score
    
    GameService->>Redis: Update leaderboard
    GameService->>RealtimeService: Notify score update
    
    RealtimeService->>Redis: Get updated leaderboard
    RealtimeService->>Client: Broadcast leaderboard update
    
    GameService-->>Gateway: Action processed
    Gateway-->>Client: Response with new score
```

## 3. Authentication & Authorization Flow

```mermaid
flowchart TD
    A[Client Login Request] --> B{Valid Credentials?}
    B -->|No| C[Return 401 Error]
    B -->|Yes| D[Verify Wallet Signature]
    D --> E{Signature Valid?}
    E -->|No| F[Return 403 Error]
    E -->|Yes| G[Generate JWT Token]
    G --> H[Store Session in Redis]
    H --> I[Return Tokens to Client]
    
    I --> J[Client Makes API Request]
    J --> K[API Gateway Validates JWT]
    K --> L{Token Valid?}
    L -->|No| M[Return 401 Error]
    L -->|Yes| N[Check Rate Limits]
    N --> O{Within Limits?}
    O -->|No| P[Return 429 Error]
    O -->|Yes| Q[Forward to Service]
    Q --> R[Service Processes Request]
```

## 4. Anti-Cheat System Architecture

```mermaid
graph TB
    subgraph "Action Processing"
        ACTION[User Action]
        VALIDATE[Validation Pipeline]
    end
    
    subgraph "Validation Layers"
        RATE[Rate Limiting<br/>1 action/second]
        AUTH_CHECK[Authentication<br/>JWT Validation]
        GAME_LOGIC[Game Logic<br/>Progression Check]
        CRYPTO[Cryptographic<br/>Proof Verification]
        BEHAVIOR[Behavior Analysis<br/>Pattern Detection]
    end
    
    subgraph "Detection Systems"
        PATTERN[Pattern Analysis<br/>ML Models]
        LOCATION[Location Analysis<br/>IP Geolocation]
        TIMING[Timing Analysis<br/>Action Frequency]
        SIGNATURE[Signature Analysis<br/>Blockchain Verification]
    end
    
    subgraph "Response Actions"
        ACCEPT[Accept Action]
        REVIEW[Flag for Review]
        BLOCK[Block Action]
        BAN[Temporary Ban]
    end
    
    ACTION --> VALIDATE
    VALIDATE --> RATE
    RATE --> AUTH_CHECK
    AUTH_CHECK --> GAME_LOGIC
    GAME_LOGIC --> CRYPTO
    CRYPTO --> BEHAVIOR
    
    BEHAVIOR --> PATTERN
    BEHAVIOR --> LOCATION
    BEHAVIOR --> TIMING
    BEHAVIOR --> SIGNATURE
    
    PATTERN --> ACCEPT
    PATTERN --> REVIEW
    LOCATION --> REVIEW
    TIMING --> BLOCK
    SIGNATURE --> BAN
```

## 5. Database Schema Relationships

```mermaid
erDiagram
    USERS ||--o{ USER_SCORES : has
    USERS ||--o{ GAME_ACTIONS : performs
    USERS ||--o{ ACTION_HISTORY : tracks
    GAME_ACTIONS ||--|| ACTION_HISTORY : records
    
    USERS {
        uuid id PK
        string username UK
        string email UK
        string wallet_address UK
        string password_hash
        enum tier
        timestamp created_at
    }
    
    USER_SCORES {
        uuid user_id PK,FK
        bigint total_score
        timestamp last_action_at
        int action_count
        int suspicious_flags
    }
    
    GAME_ACTIONS {
        uuid id PK
        uuid user_id FK
        string action_type
        jsonb action_data
        string proof_hash
        string blockchain_tx_hash
        int score_earned
        boolean is_validated
        timestamp created_at
    }
    
    ACTION_HISTORY {
        uuid id PK
        uuid user_id FK
        uuid action_id FK
        bigint previous_score
        int score_change
        inet ip_address
        string session_id
        timestamp created_at
    }
```

## 6. Microservices Communication

```mermaid
graph LR
    subgraph "Client Requests"
        WEB[Web Client]
        MOBILE[Mobile Client]
    end
    
    subgraph "API Gateway"
        GATEWAY[Kong Gateway<br/>Rate Limiting<br/>Authentication<br/>Routing]
    end
    
    subgraph "Core Services"
        AUTH[Auth Service<br/>:3001]
        GAME[Game Service<br/>:3002]
        REALTIME[Realtime Service<br/>:3003]
        ANALYTICS[Analytics Service<br/>:3004]
    end
    
    subgraph "Data Services"
        USER_DB[(User Database<br/>PostgreSQL)]
        GAME_DB[(Game Database<br/>PostgreSQL)]
        CACHE[(Redis Cache<br/>Leaderboards)]
        METRICS[(InfluxDB<br/>Metrics)]
    end
    
    subgraph "External"
        BLOCKCHAIN[Blockchain<br/>Network]
    end
    
    WEB --> GATEWAY
    MOBILE --> GATEWAY
    
    GATEWAY --> AUTH
    GATEWAY --> GAME
    GATEWAY --> REALTIME
    GATEWAY --> ANALYTICS
    
    AUTH <--> USER_DB
    GAME <--> GAME_DB
    GAME <--> CACHE
    REALTIME <--> CACHE
    ANALYTICS <--> METRICS
    
    GAME <--> BLOCKCHAIN
    
    GAME -.->|Events| REALTIME
    GAME -.->|Metrics| ANALYTICS
    AUTH -.->|User Events| ANALYTICS
```

## 7. Deployment Architecture (Kubernetes)

```mermaid
graph TB
    subgraph "Kubernetes Cluster"
        subgraph "Ingress"
            INGRESS[Nginx Ingress<br/>SSL Termination<br/>Load Balancing]
        end
        
        subgraph "Application Pods"
            AUTH_POD[Auth Service<br/>Replicas: 3]
            GAME_POD[Game Service<br/>Replicas: 5]
            RT_POD[Realtime Service<br/>Replicas: 3]
            ANALYTICS_POD[Analytics Service<br/>Replicas: 2]
        end
        
        subgraph "Services"
            AUTH_SVC[Auth Service]
            GAME_SVC[Game Service]
            RT_SVC[Realtime Service]
            ANALYTICS_SVC[Analytics Service]
        end
        
        subgraph "ConfigMaps & Secrets"
            CONFIG[ConfigMaps<br/>Environment Variables]
            SECRETS[Secrets<br/>Database Credentials<br/>JWT Keys]
        end
    end
    
    subgraph "External Data Layer"
        RDS[(AWS RDS<br/>PostgreSQL)]
        ELASTICACHE[(AWS ElastiCache<br/>Redis)]
        CLOUDWATCH[AWS CloudWatch<br/>Monitoring]
    end
    
    INGRESS --> AUTH_POD
    INGRESS --> GAME_POD
    INGRESS --> RT_POD
    INGRESS --> ANALYTICS_POD
    
    AUTH_POD --> AUTH_SVC
    GAME_POD --> GAME_SVC
    RT_POD --> RT_SVC
    ANALYTICS_POD --> ANALYTICS_SVC
    
    AUTH_SVC --> RDS
    GAME_SVC --> RDS
    GAME_SVC --> ELASTICACHE
    RT_SVC --> ELASTICACHE
    
    CONFIG --> AUTH_POD
    CONFIG --> GAME_POD
    CONFIG --> RT_POD
    CONFIG --> ANALYTICS_POD
    
    SECRETS --> AUTH_POD
    SECRETS --> GAME_POD
    SECRETS --> RT_POD
    SECRETS --> ANALYTICS_POD
    
    AUTH_POD --> CLOUDWATCH
    GAME_POD --> CLOUDWATCH
    RT_POD --> CLOUDWATCH
    ANALYTICS_POD --> CLOUDWATCH
```

## 8. Data Flow Architecture

```mermaid
flowchart TD
    subgraph "Data Ingestion"
        USER_ACTION[User Action]
        API_REQUEST[API Request]
    end
    
    subgraph "Processing Pipeline"
        VALIDATION[Validation Layer]
        BUSINESS_LOGIC[Business Logic]
        PERSISTENCE[Data Persistence]
    end
    
    subgraph "Data Storage"
        OLTP[(OLTP Database<br/>PostgreSQL)]
        CACHE[(Cache Layer<br/>Redis)]
        OLAP[(OLAP Database<br/>InfluxDB)]
    end
    
    subgraph "Data Distribution"
        REALTIME[Real-time Updates]
        BATCH[Batch Processing]
        ANALYTICS[Analytics Pipeline]
    end
    
    subgraph "Data Consumption"
        LEADERBOARD[Live Leaderboard]
        REPORTS[Analytics Reports]
        ALERTS[Security Alerts]
    end
    
    USER_ACTION --> API_REQUEST
    API_REQUEST --> VALIDATION
    VALIDATION --> BUSINESS_LOGIC
    BUSINESS_LOGIC --> PERSISTENCE
    
    PERSISTENCE --> OLTP
    PERSISTENCE --> CACHE
    PERSISTENCE --> OLAP
    
    CACHE --> REALTIME
    OLTP --> BATCH
    OLAP --> ANALYTICS
    
    REALTIME --> LEADERBOARD
    BATCH --> REPORTS
    ANALYTICS --> ALERTS
```

## 9. Security Architecture

```mermaid
graph TB
    subgraph "Perimeter Security"
        WAF[Web Application Firewall]
        DDOS[DDoS Protection]
        CDN[CDN Security]
    end
    
    subgraph "Application Security"
        JWT[JWT Authentication]
        RBAC[Role-Based Access Control]
        RATE_LIMIT[Rate Limiting]
    end
    
    subgraph "Data Security"
        ENCRYPTION[Data Encryption<br/>AES-256]
        TLS[TLS 1.3<br/>In Transit]
        SECRETS[Secret Management<br/>HashiCorp Vault]
    end
    
    subgraph "Monitoring & Compliance"
        SIEM[Security Information<br/>Event Management]
        AUDIT[Audit Logging]
        COMPLIANCE[SOC 2 Compliance]
    end
    
    subgraph "Blockchain Security"
        SIGNATURE[Digital Signatures]
        MERKLE[Merkle Proofs]
        SMART_CONTRACT[Smart Contract<br/>Verification]
    end
    
    WAF --> JWT
    DDOS --> RATE_LIMIT
    CDN --> RBAC
    
    JWT --> ENCRYPTION
    RBAC --> TLS
    RATE_LIMIT --> SECRETS
    
    ENCRYPTION --> SIEM
    TLS --> AUDIT
    SECRETS --> COMPLIANCE
    
    SIGNATURE --> SMART_CONTRACT
    MERKLE --> SMART_CONTRACT
```

## 10. Monitoring & Observability

```mermaid
graph TD
    subgraph "Application Layer"
        APP1[Auth Service]
        APP2[Game Service]
        APP3[Realtime Service]
        APP4[Analytics Service]
    end
    
    subgraph "Metrics Collection"
        PROMETHEUS[Prometheus<br/>Metrics Server]
        JAEGER[Jaeger<br/>Distributed Tracing]
        ELK[ELK Stack<br/>Log Aggregation]
    end
    
    subgraph "Visualization"
        GRAFANA[Grafana<br/>Dashboards]
        KIBANA[Kibana<br/>Log Analysis]
    end
    
    subgraph "Alerting"
        ALERT_MANAGER[AlertManager]
        PAGERDUTY[PagerDuty<br/>Incident Management]
        SLACK[Slack<br/>Notifications]
    end
    
    subgraph "Custom Metrics"
        BUSINESS_METRICS[Business Metrics<br/>- Active Users<br/>- Actions/Second<br/>- Fraud Detection]
        TECH_METRICS[Technical Metrics<br/>- Response Time<br/>- Error Rate<br/>- Throughput]
    end
    
    APP1 --> PROMETHEUS
    APP2 --> PROMETHEUS
    APP3 --> PROMETHEUS
    APP4 --> PROMETHEUS
    
    APP1 --> JAEGER
    APP2 --> JAEGER
    APP3 --> JAEGER
    APP4 --> JAEGER
    
    APP1 --> ELK
    APP2 --> ELK
    APP3 --> ELK
    APP4 --> ELK
    
    PROMETHEUS --> GRAFANA
    ELK --> KIBANA
    JAEGER --> GRAFANA
    
    PROMETHEUS --> ALERT_MANAGER
    ALERT_MANAGER --> PAGERDUTY
    ALERT_MANAGER --> SLACK
    
    PROMETHEUS --> BUSINESS_METRICS
    PROMETHEUS --> TECH_METRICS
```