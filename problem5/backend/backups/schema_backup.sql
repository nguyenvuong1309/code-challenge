-- Mining Game Database Schema
-- Optimized for 1M concurrent users with performance indexes

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Players table with wallet-based authentication
CREATE TABLE players (
    wallet_address VARCHAR(42) PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    total_coins BIGINT DEFAULT 0 NOT NULL,
    energy INTEGER DEFAULT 100 NOT NULL CHECK (energy >= 0 AND energy <= 100),
    last_action_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    energy_regen_rate INTEGER DEFAULT 12 NOT NULL, -- seconds per energy (5min = 300s / 25 = 12s per energy for smoother regen)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Anti-cheat fields
    suspicious_score INTEGER DEFAULT 0,
    last_behavior_check TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_banned BOOLEAN DEFAULT FALSE
);

-- Mining sessions for tracking individual mining actions
CREATE TABLE mining_sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_wallet VARCHAR(42) REFERENCES players(wallet_address) ON DELETE CASCADE,
    coins_earned INTEGER NOT NULL CHECK (coins_earned > 0),
    energy_used INTEGER NOT NULL CHECK (energy_used > 0),
    action_count INTEGER DEFAULT 1,
    -- Anti-cheat verification
    client_signature TEXT,
    server_verification_hash TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Action history for detailed tracking and anti-cheat analysis
CREATE TABLE action_history (
    action_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_wallet VARCHAR(42) REFERENCES players(wallet_address) ON DELETE CASCADE,
    action_type VARCHAR(20) NOT NULL, -- 'MINE', 'LOGIN', 'ENERGY_REGEN'
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Action-specific data
    coins_earned INTEGER DEFAULT 0,
    energy_delta INTEGER DEFAULT 0, -- positive for regen, negative for consumption
    -- Anti-cheat data
    client_proof TEXT,
    server_hash TEXT,
    ip_address INET,
    user_agent TEXT,
    response_time_ms INTEGER,
    validated BOOLEAN DEFAULT TRUE
);

-- Anti-cheat logs for security monitoring
CREATE TABLE anti_cheat_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_wallet VARCHAR(42) REFERENCES players(wallet_address) ON DELETE CASCADE,
    violation_type VARCHAR(50) NOT NULL, -- 'RATE_LIMIT', 'INVALID_SIGNATURE', 'SUSPICIOUS_PATTERN'
    severity INTEGER NOT NULL CHECK (severity BETWEEN 1 AND 5), -- 1=low, 5=critical
    evidence_data JSONB,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    action_taken VARCHAR(50) -- 'WARNING', 'TEMP_BAN', 'PERMANENT_BAN', 'NONE'
);

-- Performance Indexes
CREATE INDEX CONCURRENTLY idx_players_last_action_time ON players(last_action_time);
CREATE INDEX CONCURRENTLY idx_players_total_coins ON players(total_coins DESC);
CREATE INDEX CONCURRENTLY idx_players_suspicious_score ON players(suspicious_score DESC);

CREATE INDEX CONCURRENTLY idx_mining_sessions_player_wallet ON mining_sessions(player_wallet);
CREATE INDEX CONCURRENTLY idx_mining_sessions_created_at ON mining_sessions(created_at DESC);
CREATE INDEX CONCURRENTLY idx_mining_sessions_ip_address ON mining_sessions(ip_address);

CREATE INDEX CONCURRENTLY idx_action_history_player_wallet ON action_history(player_wallet);
CREATE INDEX CONCURRENTLY idx_action_history_timestamp ON action_history(timestamp DESC);
CREATE INDEX CONCURRENTLY idx_action_history_action_type ON action_history(action_type);
CREATE INDEX CONCURRENTLY idx_action_history_ip_address ON action_history(ip_address);

CREATE INDEX CONCURRENTLY idx_anti_cheat_logs_player_wallet ON anti_cheat_logs(player_wallet);
CREATE INDEX CONCURRENTLY idx_anti_cheat_logs_detected_at ON anti_cheat_logs(detected_at DESC);
CREATE INDEX CONCURRENTLY idx_anti_cheat_logs_violation_type ON anti_cheat_logs(violation_type);

-- Composite indexes for common queries
CREATE INDEX CONCURRENTLY idx_players_wallet_energy ON players(wallet_address, energy, last_action_time);
CREATE INDEX CONCURRENTLY idx_mining_sessions_player_time ON mining_sessions(player_wallet, created_at DESC);
CREATE INDEX CONCURRENTLY idx_action_history_player_type_time ON action_history(player_wallet, action_type, timestamp DESC);

-- Functions for energy regeneration
CREATE OR REPLACE FUNCTION calculate_current_energy(
    p_wallet VARCHAR(42)
) RETURNS INTEGER AS $$
DECLARE
    current_energy INTEGER;
    last_action TIMESTAMP WITH TIME ZONE;
    regen_rate INTEGER;
    energy_to_add INTEGER;
BEGIN
    SELECT energy, last_action_time, energy_regen_rate 
    INTO current_energy, last_action, regen_rate
    FROM players 
    WHERE wallet_address = p_wallet;
    
    IF current_energy IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Calculate energy to add based on time passed
    energy_to_add := FLOOR(EXTRACT(EPOCH FROM (NOW() - last_action)) / regen_rate);
    
    -- Cap at maximum energy (100)
    RETURN LEAST(current_energy + energy_to_add, 100);
END;
$$ LANGUAGE plpgsql;

-- Function to update player energy and last action time
CREATE OR REPLACE FUNCTION update_player_energy(
    p_wallet VARCHAR(42),
    p_energy_change INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
    current_energy INTEGER;
    new_energy INTEGER;
BEGIN
    -- Get current energy with regeneration
    current_energy := calculate_current_energy(p_wallet);
    
    IF current_energy IS NULL THEN
        RETURN FALSE;
    END IF;
    
    new_energy := current_energy + p_energy_change;
    
    -- Check bounds
    IF new_energy < 0 OR new_energy > 100 THEN
        RETURN FALSE;
    END IF;
    
    -- Update player
    UPDATE players 
    SET energy = new_energy,
        last_action_time = NOW(),
        updated_at = NOW()
    WHERE wallet_address = p_wallet;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for common queries
CREATE VIEW player_stats AS
SELECT 
    wallet_address,
    username,
    total_coins,
    calculate_current_energy(wallet_address) as current_energy,
    (SELECT COUNT(*) FROM mining_sessions ms WHERE ms.player_wallet = p.wallet_address) as total_sessions,
    (SELECT SUM(coins_earned) FROM mining_sessions ms WHERE ms.player_wallet = p.wallet_address AND ms.created_at > NOW() - INTERVAL '24 hours') as coins_today,
    created_at,
    updated_at
FROM players p;

-- Insert default admin player for testing (remove in production)
INSERT INTO players (wallet_address, username) 
VALUES ('0x0000000000000000000000000000000000000000', 'admin')
ON CONFLICT (wallet_address) DO NOTHING;