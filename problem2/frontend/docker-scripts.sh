#!/bin/bash

# Docker scripts for Currency Swap App

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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

# Help function
show_help() {
    echo "Currency Swap Docker Management Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  dev          Start development environment (port 5173)"
    echo "  dev-auto     Start development with auto port detection"
    echo "  prod         Start production environment (port 3000)"
    echo "  prod-auto    Start production with auto port detection"
    echo "  build        Build production image"
    echo "  stop         Stop all running containers"
    echo "  clean        Clean up containers and images"
    echo "  logs         Show application logs"
    echo "  health       Check application health"
    echo "  status       Show port availability status"
    echo "  help         Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev       # Start development server on port 5173"
    echo "  $0 dev-auto  # Start dev server on first available port"
    echo "  $0 prod      # Start production server on port 3000"
    echo "  $0 prod-auto # Start prod server on first available port"
    echo "  $0 status    # Check port availability"
    echo "  $0 logs      # Show real-time logs"
}

# Development environment
start_dev() {
    print_status "Starting development environment..."
    docker-compose --profile dev up --build -d
    print_status "Development server running at http://localhost:5173"
    print_status "Use '$0 logs' to view real-time logs"
}

# Development environment with auto port detection
start_dev_auto() {
    print_status "Starting development with automatic port detection..."
    print_status "Using docker-port-manager.sh for smart port handling..."
    ./docker-port-manager.sh dev-auto
}

# Production environment
start_prod() {
    print_status "Building production image..."
    docker-compose --profile prod build
    
    print_status "Starting production environment..."
    docker-compose --profile prod up -d
    
    print_status "Production server running at http://localhost:3000"
    print_status "Health check: http://localhost:3000/health"
}

# Production environment with auto port detection
start_prod_auto() {
    print_status "Starting production with automatic port detection..."
    print_status "Using docker-port-manager.sh for smart port handling..."
    ./docker-port-manager.sh prod-auto
}

# Build production image only
build_prod() {
    print_status "Building production Docker image..."
    docker build --target production -t currency-swap:latest .
    print_status "Production image built successfully!"
}

# Stop all services
stop_services() {
    print_status "Stopping all services..."
    docker-compose --profile dev --profile prod down
    print_status "All services stopped"
}

# Clean up
clean_up() {
    print_warning "This will remove all containers, images, and volumes related to this project"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Cleaning up..."
        docker-compose --profile dev --profile prod down -v --remove-orphans
        docker image rm currency-swap:latest 2>/dev/null || true
        docker image prune -f
        print_status "Cleanup completed"
    else
        print_status "Cleanup cancelled"
    fi
}

# Show logs
show_logs() {
    print_status "Showing application logs (Ctrl+C to exit)..."
    docker-compose --profile dev --profile prod logs -f
}

# Health check
health_check() {
    print_status "Checking application health..."
    
    # Check if containers are running
    if docker-compose --profile prod ps | grep -q "Up"; then
        print_status "Production container is running"
        
        # Check health endpoint
        if curl -f http://localhost:3000/health >/dev/null 2>&1; then
            print_status "Health check passed ✓"
        else
            print_error "Health check failed ✗"
            exit 1
        fi
    elif docker-compose --profile dev ps | grep -q "Up"; then
        print_status "Development container is running"
        
        if curl -f http://localhost:5173 >/dev/null 2>&1; then
            print_status "Development server is healthy ✓"
        else
            print_error "Development server is not responding ✗"
            exit 1
        fi
    else
        print_error "No containers are running"
        exit 1
    fi
}

# Check port status
check_port_status() {
    print_status "Checking port availability..."
    ./docker-port-manager.sh status
}

# Main script logic
case "${1:-help}" in
    dev)
        start_dev
        ;;
    dev-auto)
        start_dev_auto
        ;;
    prod)
        start_prod
        ;;
    prod-auto)
        start_prod_auto
        ;;
    build)
        build_prod
        ;;
    stop)
        stop_services
        ;;
    clean)
        clean_up
        ;;
    logs)
        show_logs
        ;;
    health)
        health_check
        ;;
    status)
        check_port_status
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