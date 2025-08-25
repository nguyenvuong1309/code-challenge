#!/bin/bash

# Docker Port Manager for Currency Swap App
# Automatically detects port conflicts and retries with different ports

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default ports
DEFAULT_DEV_PORT=5173
DEFAULT_PROD_PORT=3000

# Port ranges to try
DEV_PORT_RANGE=(5173 5174 5175 5176 5177 5178 5179)
PROD_PORT_RANGE=(3000 3001 3002 3003 3004 3005 3006)

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_debug() {
    echo -e "${BLUE}[DEBUG]${NC} $1"
}

# Check if a port is available
is_port_available() {
    local port=$1
    ! nc -z localhost $port 2>/dev/null
}

# Find the first available port from a range
find_available_port() {
    local port_array=("$@")
    
    for port in "${port_array[@]}"; do
        if is_port_available $port; then
            echo $port
            return 0
        fi
    done
    
    return 1
}

# Kill process using a specific port
kill_process_on_port() {
    local port=$1
    local pid=$(lsof -ti:$port 2>/dev/null || echo "")
    
    if [ ! -z "$pid" ]; then
        print_warning "Killing process $pid on port $port"
        kill -9 $pid 2>/dev/null || true
        sleep 2
    fi
}

# Generate dynamic docker-compose file with custom ports
generate_docker_compose() {
    local dev_port=$1
    local prod_port=$2
    local compose_file="docker-compose.dynamic.yml"
    
    cat > $compose_file << EOF
version: '3.8'

services:
  # Development service
  currency-swap-dev:
    build:
      context: .
      target: development
    ports:
      - "${dev_port}:5173"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - VITE_API_URL=https://interview.switcheo.com
      - VITE_PORT=${dev_port}
    profiles:
      - dev
    restart: unless-stopped
    container_name: currency-swap-dev-${dev_port}

  # Production service  
  currency-swap-prod:
    build:
      context: .
      target: production
    ports:
      - "${prod_port}:80"
    environment:
      - NODE_ENV=production
    profiles:
      - prod
    restart: unless-stopped
    container_name: currency-swap-prod-${prod_port}
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

networks:
  default:
    name: currency-swap-network-${dev_port}-${prod_port}
EOF

    echo $compose_file
}

# Start development with port auto-detection
start_dev_with_port_detection() {
    print_status "Starting development environment with port auto-detection..."
    
    # Try to find available port
    local available_port=$(find_available_port "${DEV_PORT_RANGE[@]}")
    
    if [ -z "$available_port" ]; then
        print_error "No available ports found in range: ${DEV_PORT_RANGE[*]}"
        print_warning "Trying to free up the default port $DEFAULT_DEV_PORT..."
        
        kill_process_on_port $DEFAULT_DEV_PORT
        
        if is_port_available $DEFAULT_DEV_PORT; then
            available_port=$DEFAULT_DEV_PORT
            print_status "Successfully freed up port $DEFAULT_DEV_PORT"
        else
            print_error "Could not free up any ports. Please manually stop services on these ports."
            return 1
        fi
    fi
    
    print_status "Using port $available_port for development server"
    
    # Generate dynamic compose file
    local compose_file=$(generate_docker_compose $available_port $DEFAULT_PROD_PORT)
    
    # Start the service
    docker-compose -f $compose_file --profile dev up --build -d
    
    print_status "Development server running at http://localhost:$available_port"
    print_status "Container name: currency-swap-dev-$available_port"
    
    # Save port info for later reference
    echo "DEV_PORT=$available_port" > .docker-ports
    echo "COMPOSE_FILE=$compose_file" >> .docker-ports
}

# Start production with port auto-detection
start_prod_with_port_detection() {
    print_status "Starting production environment with port auto-detection..."
    
    # Try to find available port
    local available_port=$(find_available_port "${PROD_PORT_RANGE[@]}")
    
    if [ -z "$available_port" ]; then
        print_error "No available ports found in range: ${PROD_PORT_RANGE[*]}"
        print_warning "Trying to free up the default port $DEFAULT_PROD_PORT..."
        
        kill_process_on_port $DEFAULT_PROD_PORT
        
        if is_port_available $DEFAULT_PROD_PORT; then
            available_port=$DEFAULT_PROD_PORT
            print_status "Successfully freed up port $DEFAULT_PROD_PORT"
        else
            print_error "Could not free up any ports. Please manually stop services on these ports."
            return 1
        fi
    fi
    
    print_status "Using port $available_port for production server"
    
    # Generate dynamic compose file
    local compose_file=$(generate_docker_compose $DEFAULT_DEV_PORT $available_port)
    
    # Build and start the service
    docker-compose -f $compose_file --profile prod build
    docker-compose -f $compose_file --profile prod up -d
    
    print_status "Production server running at http://localhost:$available_port"
    print_status "Health check: http://localhost:$available_port/health"
    print_status "Container name: currency-swap-prod-$available_port"
    
    # Save port info for later reference
    echo "PROD_PORT=$available_port" > .docker-ports
    echo "COMPOSE_FILE=$compose_file" >> .docker-ports
}

# Stop services using saved port info
stop_services_smart() {
    if [ -f ".docker-ports" ]; then
        source .docker-ports
        print_status "Stopping services using saved configuration..."
        docker-compose -f "$COMPOSE_FILE" --profile dev --profile prod down
    else
        print_status "No saved port configuration found, using default compose file..."
        docker-compose --profile dev --profile prod down
    fi
    
    # Clean up dynamic files
    rm -f docker-compose.dynamic.yml .docker-ports
    print_status "All services stopped"
}

# Show current port usage
show_port_status() {
    print_status "Checking port availability..."
    
    echo -e "\n${BLUE}Development Ports:${NC}"
    for port in "${DEV_PORT_RANGE[@]}"; do
        if is_port_available $port; then
            echo -e "  Port $port: ${GREEN}Available${NC}"
        else
            local pid=$(lsof -ti:$port 2>/dev/null || echo "")
            local process=$(ps -p $pid -o comm= 2>/dev/null || echo "Unknown")
            echo -e "  Port $port: ${RED}In use${NC} (PID: $pid, Process: $process)"
        fi
    done
    
    echo -e "\n${BLUE}Production Ports:${NC}"
    for port in "${PROD_PORT_RANGE[@]}"; do
        if is_port_available $port; then
            echo -e "  Port $port: ${GREEN}Available${NC}"
        else
            local pid=$(lsof -ti:$port 2>/dev/null || echo "")
            local process=$(ps -p $pid -o comm= 2>/dev/null || echo "Unknown")
            echo -e "  Port $port: ${RED}In use${NC} (PID: $pid, Process: $process)"
        fi
    done
    
    if [ -f ".docker-ports" ]; then
        echo -e "\n${BLUE}Currently Running:${NC}"
        source .docker-ports
        [ ! -z "$DEV_PORT" ] && echo -e "  Development: http://localhost:$DEV_PORT"
        [ ! -z "$PROD_PORT" ] && echo -e "  Production: http://localhost:$PROD_PORT"
    fi
}

# Force kill all currency-swap containers
force_cleanup() {
    print_warning "Force cleaning up all currency-swap containers..."
    
    # Stop and remove all containers with currency-swap in the name
    docker ps -a --filter "name=currency-swap" --format "{{.Names}}" | xargs -r docker rm -f
    
    # Remove dynamic compose files
    rm -f docker-compose.dynamic.yml .docker-ports
    
    print_status "Force cleanup completed"
}

# Show help
show_help() {
    echo "Currency Swap Docker Port Manager"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  dev-auto     Start development with automatic port detection"
    echo "  prod-auto    Start production with automatic port detection"
    echo "  stop         Stop services intelligently"
    echo "  status       Show port availability status"
    echo "  force-clean  Force cleanup all containers"
    echo "  help         Show this help message"
    echo ""
    echo "Port Ranges:"
    echo "  Development: ${DEV_PORT_RANGE[*]}"
    echo "  Production:  ${PROD_PORT_RANGE[*]}"
    echo ""
    echo "Examples:"
    echo "  $0 dev-auto    # Start dev server on first available port"
    echo "  $0 prod-auto   # Start prod server on first available port"
    echo "  $0 status      # Check which ports are available"
}

# Check dependencies
check_dependencies() {
    local missing_deps=()
    
    if ! command -v docker &> /dev/null; then
        missing_deps+=(docker)
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        missing_deps+=(docker-compose)
    fi
    
    if ! command -v nc &> /dev/null; then
        missing_deps+=(netcat)
    fi
    
    if ! command -v lsof &> /dev/null; then
        missing_deps+=(lsof)
    fi
    
    if [ ${#missing_deps[@]} -gt 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        print_status "Please install missing dependencies and try again"
        return 1
    fi
}

# Main script logic
main() {
    # Check dependencies first
    if ! check_dependencies; then
        exit 1
    fi
    
    case "${1:-help}" in
        dev-auto)
            start_dev_with_port_detection
            ;;
        prod-auto)
            start_prod_with_port_detection
            ;;
        stop)
            stop_services_smart
            ;;
        status)
            show_port_status
            ;;
        force-clean)
            force_cleanup
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

main "$@"