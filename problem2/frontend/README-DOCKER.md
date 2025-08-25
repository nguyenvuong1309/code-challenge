# 🐳 Currency Swap - Docker Setup

This guide shows how to run the Currency Swap application using Docker.

## 📋 Prerequisites

- Docker installed (version 20.10+)
- Docker Compose installed (version 2.0+)
- At least 2GB RAM available

## 🚀 Quick Start

### Method 1: Using Docker Scripts (Recommended)

```bash
# Make script executable (first time only)
chmod +x docker-scripts.sh

# Start development environment
./docker-scripts.sh dev

# Start development with automatic port detection (NEW!)
./docker-scripts.sh dev-auto

# Start production environment  
./docker-scripts.sh prod

# Start production with automatic port detection (NEW!)
./docker-scripts.sh prod-auto

# View logs
./docker-scripts.sh logs

# Check health
./docker-scripts.sh health

# Stop services
./docker-scripts.sh stop

# Clean up everything
./docker-scripts.sh clean
```

### Method 2: Using Docker Compose Directly

```bash
# Development mode (with hot reload)
docker-compose --profile dev up --build

# Production mode (optimized)
docker-compose --profile prod up --build

# Stop services
docker-compose down
```

### Method 3: Using Docker Commands

```bash
# Build production image
docker build -t currency-swap .

# Run development server
docker build --target development -t currency-swap:dev .
docker run -p 5173:5173 -v $(pwd):/app currency-swap:dev

# Run production server
docker run -p 3000:80 currency-swap
```

## 🌐 Access URLs

| Environment | URL | Port |
|-------------|-----|------|
| **Development** | http://localhost:5173 | 5173 |
| **Production** | http://localhost:3000 | 3000 |
| **Health Check** | http://localhost:3000/health | 3000 |

## 🏗️ Docker Architecture

### Multi-stage Build Process:

1. **Base Stage**: Install production dependencies
2. **Development Stage**: Install all dependencies + dev tools
3. **Build Stage**: Create optimized production build
4. **Production Stage**: Serve with Nginx

### Container Features:

- ✅ **Multi-stage builds** for optimized images
- ✅ **Hot reload** in development
- ✅ **Nginx optimization** in production
- ✅ **Security headers** configured
- ✅ **Gzip compression** enabled
- ✅ **Health checks** implemented
- ✅ **SPA routing** support
- ✅ **CORS** handling for APIs

## 📊 Container Sizes

| Stage | Size | Description |
|-------|------|-------------|
| Development | ~400MB | Full dev environment |
| Production | ~50MB | Optimized Nginx + assets |

## 🔧 Configuration

### Environment Variables

```bash
# Development
NODE_ENV=development
VITE_API_URL=https://interview.switcheo.com

# Production  
NODE_ENV=production
```

### Docker Compose Profiles

- `dev`: Development environment with hot reload
- `prod`: Production environment with Nginx

## 🛠️ Customization

### Custom Nginx Config

Edit `nginx.conf` to customize:
- Caching policies
- Security headers
- API proxy settings
- Compression settings

### Docker Environment

Edit `docker-compose.yml` to modify:
- Port mappings
- Environment variables
- Volume mounts
- Health check settings

## 🔍 Troubleshooting

### Common Issues:

**Port already in use:**
```bash
# Use automatic port detection (RECOMMENDED)
./docker-scripts.sh dev-auto
./docker-scripts.sh prod-auto

# Or manually find and kill process
lsof -ti:5173 | xargs kill -9
lsof -ti:3000 | xargs kill -9

# Check port availability
./docker-scripts.sh status
```

**Permission issues:**
```bash
# Fix permissions
sudo chown -R $USER:$USER .
```

**Build fails:**
```bash
# Clean Docker cache
docker system prune -a
docker-compose down -v --remove-orphans
```

**API connection issues:**
```bash
# Check if API is accessible
curl https://interview.switcheo.com/prices.json
```

### Debug Commands:

```bash
# View container logs
docker-compose logs -f

# Execute shell in container
docker-compose exec currency-swap-dev sh

# Check container status
docker-compose ps

# View resource usage
docker stats
```

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `./docker-scripts.sh dev` | Start development server |
| `./docker-scripts.sh dev-auto` | Start dev with auto port detection |
| `./docker-scripts.sh prod` | Start production server |
| `./docker-scripts.sh prod-auto` | Start prod with auto port detection |
| `./docker-scripts.sh status` | Check port availability |
| `./docker-scripts.sh build` | Build production image |
| `./docker-scripts.sh stop` | Stop all containers |
| `./docker-scripts.sh clean` | Remove containers & images |
| `./docker-scripts.sh logs` | Show real-time logs |
| `./docker-scripts.sh health` | Check app health |
| `./docker-scripts.sh help` | Show help information |

## 🔐 Security Features

- Non-root user in containers
- Security headers in Nginx
- CORS handling
- No sensitive data in images
- Health checks enabled
- Resource limits configured

## 📈 Performance Optimizations

- Multi-stage builds reduce image size
- Nginx gzip compression
- Static asset caching
- Optimized layer caching
- .dockerignore excludes unnecessary files

Ready to containerize your Currency Swap app! 🚀