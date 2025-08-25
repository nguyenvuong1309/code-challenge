# 🔄 Docker Auto-Port Detection

This project now includes intelligent port conflict detection and automatic port retry functionality.

## 🚀 Quick Start with Auto-Port Detection

### Method 1: Using Enhanced Docker Scripts (Recommended)

```bash
# Start development with automatic port detection
./docker-scripts.sh dev-auto

# Start production with automatic port detection  
./docker-scripts.sh prod-auto

# Check port availability status
./docker-scripts.sh status
```

### Method 2: Using Port Manager Directly

```bash
# Make script executable (first time only)
chmod +x docker-port-manager.sh

# Start development with smart port handling
./docker-port-manager.sh dev-auto

# Start production with smart port handling
./docker-port-manager.sh prod-auto

# Check port status
./docker-port-manager.sh status
```

## 🔍 How Auto-Port Detection Works

### Port Ranges
- **Development**: 5173, 5174, 5175, 5176, 5177, 5178, 5179
- **Production**: 3000, 3001, 3002, 3003, 3004, 3005, 3006

### Smart Port Selection Process
1. **Check Availability**: Scans through port range to find first available port
2. **Conflict Resolution**: If default port is occupied, tries alternatives
3. **Process Management**: Can kill existing processes on ports if needed
4. **Dynamic Configuration**: Generates custom docker-compose files with selected ports
5. **State Tracking**: Saves port information for proper cleanup

### Port Conflict Resolution
```bash
# If port 5173 is busy, automatically tries:
Port 5173: ❌ In use (PID: 1234, Process: node)
Port 5174: ✅ Available - SELECTED
```

## 📋 Available Commands

### Enhanced Docker Scripts
```bash
./docker-scripts.sh dev        # Standard dev (port 5173)
./docker-scripts.sh dev-auto   # Auto port detection dev
./docker-scripts.sh prod       # Standard prod (port 3000)  
./docker-scripts.sh prod-auto  # Auto port detection prod
./docker-scripts.sh status     # Show port availability
./docker-scripts.sh stop       # Stop services intelligently
```

### Port Manager Commands
```bash
./docker-port-manager.sh dev-auto      # Start dev with auto port
./docker-port-manager.sh prod-auto     # Start prod with auto port
./docker-port-manager.sh status        # Detailed port status
./docker-port-manager.sh stop          # Intelligent stop
./docker-port-manager.sh force-clean   # Force cleanup all containers
```

## 🎯 Usage Examples

### Scenario 1: Port 5173 is Already in Use
```bash
$ ./docker-scripts.sh dev-auto

[INFO] Starting development with automatic port detection...
[WARNING] Port 5173 is in use (PID: 1234, Process: node)
[INFO] Using port 5174 for development server
[INFO] Development server running at http://localhost:5174
[INFO] Container name: currency-swap-dev-5174
```

### Scenario 2: Multiple Port Conflicts
```bash
$ ./docker-port-manager.sh status

[INFO] Checking port availability...

Development Ports:
  Port 5173: In use (PID: 1234, Process: node)
  Port 5174: In use (PID: 5678, Process: npm)
  Port 5175: Available
  Port 5176: Available

Production Ports:
  Port 3000: In use (PID: 9012, Process: nginx)
  Port 3001: Available
```

### Scenario 3: Automatic Process Termination
```bash
$ ./docker-port-manager.sh dev-auto

[INFO] Starting development environment with port auto-detection...
[WARNING] No available ports found in range: 5173 5174 5175 5176 5177 5178 5179
[WARNING] Trying to free up the default port 5173...
[WARNING] Killing process 1234 on port 5173
[INFO] Successfully freed up port 5173
[INFO] Using port 5173 for development server
```

## 🔧 Technical Implementation

### Dynamic Docker Compose Generation
The port manager creates dynamic `docker-compose.dynamic.yml` files with custom ports:

```yaml
services:
  currency-swap-dev:
    ports:
      - "5174:5173"  # External:Internal
    container_name: currency-swap-dev-5174
```

### State Management  
Port information is saved in `.docker-ports` file:
```bash
DEV_PORT=5174
COMPOSE_FILE=docker-compose.dynamic.yml
```

### Intelligent Cleanup
- Tracks which containers are running on which ports
- Uses saved state for proper cleanup
- Removes dynamic configuration files
- Handles container naming with port suffixes

## 🛡️ Safety Features

### Port Conflict Detection
- Uses `netcat` to check port availability
- Uses `lsof` to identify processes using ports
- Non-destructive by default

### Process Management
- Only kills processes when explicitly needed
- Shows process details before termination
- Confirms actions with user when appropriate

### Container Isolation
- Unique container names include port numbers
- Separate networks for different port configurations
- No conflicts between multiple instances

## 🐛 Troubleshooting

### Dependencies Check
The script automatically verifies required tools:
- `docker` - Container runtime
- `docker-compose` - Container orchestration  
- `nc` (netcat) - Port availability checking
- `lsof` - Process identification

### Common Issues

**Script not executable:**
```bash
chmod +x docker-port-manager.sh
chmod +x docker-scripts.sh
```

**Missing dependencies:**
```bash
# Ubuntu/Debian
sudo apt-get install netcat-openbsd lsof

# macOS
brew install netcat lsof
```

**Port still showing as busy:**
```bash
# Force cleanup all containers
./docker-port-manager.sh force-clean

# Manual process termination
lsof -ti:5173 | xargs kill -9
```

## 🎉 Benefits

✅ **Zero Manual Configuration** - Automatically handles port conflicts  
✅ **Intelligent Process Management** - Can terminate conflicting processes safely  
✅ **State Persistence** - Remembers configurations for proper cleanup  
✅ **Multiple Instance Support** - Run multiple environments simultaneously  
✅ **Detailed Logging** - Clear status messages and error reporting  
✅ **Graceful Degradation** - Falls back to manual intervention when needed  

Your Currency Swap app now handles Docker port conflicts automatically! 🚀