# Production Deployment Guide

This guide provides comprehensive instructions for deploying the AI-Agent-Framework full stack (Client + API) to production.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start with Automated Scripts](#quick-start-with-automated-scripts)
- [Manual Production Setup](#manual-production-setup)
- [Docker Production Deployment](#docker-production-deployment)
- [Environment Configuration](#environment-configuration)
- [Security Best Practices](#security-best-practices)
- [Monitoring and Logging](#monitoring-and-logging)
- [Backup and Recovery](#backup-and-recovery)
- [Scaling Considerations](#scaling-considerations)
- [Troubleshooting](#troubleshooting)

## Overview

Production deployment involves running both services (Client + API) in a secure, reliable, and performant manner. This guide covers:

- Automated setup with provided scripts
- Manual setup for custom deployments
- Docker-based deployment (recommended)
- Security hardening
- Monitoring and maintenance

### Architecture in Production

```
                    Internet
                       │
                       ▼
               ┌───────────────┐
               │  Load Balancer │  (Optional)
               │   / Reverse    │
               │     Proxy      │
               └───────┬────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
┌───────────────┐           ┌────────────────┐
│   AI-Agent-   │           │   AI-Agent-    │
│   Framework   │   HTTP    │   Framework    │
│    Client     ├──────────►│      API       │
│  (React/Nginx)│           │   (FastAPI)    │
│   Port 3000   │           │   Port 8000    │
└───────────────┘           └────────┬───────┘
                                     │
                                     ▼
                            ┌────────────────┐
                            │   LLM Service   │
                            │  (LM Studio,    │
                            │   OpenAI, etc)  │
                            └─────────────────┘
```

## Prerequisites

### System Requirements

- **Operating System**: Linux (Ubuntu 20.04+), macOS, or Windows Server
- **RAM**: 4GB minimum, 8GB recommended
- **CPU**: 2 cores minimum, 4 cores recommended
- **Disk Space**: 10GB minimum (for Docker images, logs, data)
- **Network**: Stable internet connection
- **Open Ports**: 3000 (client), 8000 (API), or custom ports

### Required Software

- **Docker 28+**
  - Check: `docker --version`
  - Install: https://docs.docker.com/get-docker/
- **Docker Compose**
  - Check: `docker compose version`
  - Usually included with Docker Desktop
- **Git** (for cloning repositories)
  - Check: `git --version`
  - Install: https://git-scm.com/

### Optional but Recommended

- **Nginx** or **Apache** as reverse proxy (for SSL termination)
- **Certbot** for Let's Encrypt SSL certificates
- **Monitoring tools**: Prometheus, Grafana, or similar
- **Log aggregation**: ELK stack, Loki, or similar

## Quick Start with Automated Scripts

The easiest way to deploy to production is using the provided setup scripts.

### Linux/macOS: Using production-setup.sh

```bash
# Download and run the setup script
curl -fsSL https://raw.githubusercontent.com/blecx/AI-Agent-Framework-Client/main/production-setup.sh -o production-setup.sh

# Make it executable
chmod +x production-setup.sh

# Run the script
./production-setup.sh
```

The script will:
1. Check for required dependencies (Docker, Git)
2. Clone both repositories (or update if they exist)
3. Prompt for configuration (ports, API URL, etc.)
4. Create environment files
5. Start services with Docker Compose
6. Validate health checks
7. Display access URLs

### Windows: Using production-setup.ps1

```powershell
# Download and run the setup script
iwr -useb https://raw.githubusercontent.com/blecx/AI-Agent-Framework-Client/main/production-setup.ps1 -outfile production-setup.ps1

# Run the script (may need to adjust execution policy)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\production-setup.ps1
```

### Script Options

The setup script supports interactive and non-interactive modes:

**Interactive Mode** (default):
```bash
./production-setup.sh
# Follow prompts for configuration
```

**Non-Interactive Mode** (with environment variables):
```bash
export API_PORT=8000
export CLIENT_PORT=3000
export INSTALL_DIR=/opt/ai-agent
./production-setup.sh --non-interactive
```

## Manual Production Setup

For custom deployments or when scripts cannot be used.

### Step 1: Clone Repositories

```bash
# Create installation directory
mkdir -p /opt/ai-agent
cd /opt/ai-agent

# Clone API repository
git clone https://github.com/blecx/AI-Agent-Framework.git api

# Clone Client repository
git clone https://github.com/blecx/AI-Agent-Framework-Client.git client
```

### Step 2: Configure API

```bash
cd /opt/ai-agent/api

# Create .env file
cat > .env << EOF
PROJECT_DOCS_PATH=./projectDocs
LLM_CONFIG_PATH=./config/llm.json
PORT=8000
HOST=0.0.0.0
LOG_LEVEL=INFO
EOF

# Create required directories
mkdir -p projectDocs config

# Create LLM config (adjust for your LLM provider)
cat > config/llm.json << EOF
{
  "provider": "lm-studio",
  "api_url": "http://localhost:1234/v1",
  "model": "local-model",
  "temperature": 0.7,
  "max_tokens": 2000
}
EOF
```

### Step 3: Configure Client

```bash
cd /opt/ai-agent/client

# Create .env file
cat > .env << EOF
VITE_API_BASE_URL=http://localhost:8000/api
VITE_API_KEY=
VITE_HEALTH_CHECK_INTERVAL=30000
EOF
```

### Step 4: Create Production Docker Compose

Create `/opt/ai-agent/docker-compose.production.yml`:

```yaml
version: '3.8'

services:
  ai-agent-api:
    build:
      context: ./api
      dockerfile: Dockerfile
    container_name: ai-agent-api
    environment:
      - PROJECT_DOCS_PATH=/app/projectDocs
      - LLM_CONFIG_PATH=/app/config/llm.json
      - PORT=8000
      - HOST=0.0.0.0
      - LOG_LEVEL=INFO
    volumes:
      - ./api/projectDocs:/app/projectDocs
      - ./api/config:/app/config
    ports:
      - "8000:8000"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    restart: unless-stopped
    networks:
      - ai-agent-network

  ai-agent-client:
    build:
      context: ./client
      dockerfile: Dockerfile
    container_name: ai-agent-client
    environment:
      - VITE_API_BASE_URL=http://ai-agent-api:8000/api
    ports:
      - "3000:80"
    depends_on:
      ai-agent-api:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:80"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped
    networks:
      - ai-agent-network

networks:
  ai-agent-network:
    driver: bridge

volumes:
  projectDocs:
    driver: local
  api-config:
    driver: local
```

### Step 5: Start Services

```bash
cd /opt/ai-agent

# Build and start services
docker compose -f docker-compose.production.yml up -d

# View logs
docker compose -f docker-compose.production.yml logs -f

# Check status
docker compose -f docker-compose.production.yml ps
```

### Step 6: Validate Deployment

```bash
# Validate with the validation script
./client/scripts/validate-setup.sh

# Or manually test
curl http://localhost:8000/health
curl http://localhost:3000
```

## Docker Production Deployment

### Using Pre-built Images

If Docker images are published to a registry:

```yaml
version: '3.8'

services:
  ai-agent-api:
    image: ghcr.io/blecx/ai-agent-framework:latest
    # ... rest of config

  ai-agent-client:
    image: ghcr.io/blecx/ai-agent-framework-client:latest
    # ... rest of config
```

### Building from Source

```bash
# Build images
docker compose -f docker-compose.production.yml build

# Start services
docker compose -f docker-compose.production.yml up -d
```

### Container Management

```bash
# View logs
docker compose logs -f

# Restart services
docker compose restart

# Stop services
docker compose down

# Update and restart
git pull
docker compose down
docker compose build
docker compose up -d
```

## Environment Configuration

### Production Environment Variables

#### API Environment Variables

```bash
# .env for API
PROJECT_DOCS_PATH=/app/projectDocs
LLM_CONFIG_PATH=/app/config/llm.json
PORT=8000
HOST=0.0.0.0
LOG_LEVEL=INFO

# Optional: Security
API_KEY=your-secure-api-key-here
ALLOWED_ORIGINS=https://yourdomain.com

# Optional: Database (if using)
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
```

#### Client Environment Variables

```bash
# .env for Client (build time)
VITE_API_BASE_URL=http://ai-agent-api:8000/api

# For external access (not Docker internal)
# VITE_API_BASE_URL=https://api.yourdomain.com/api
```

### Setting Environment Variables

#### Docker Compose

Edit `docker-compose.production.yml`:

```yaml
services:
  ai-agent-api:
    environment:
      - PROJECT_DOCS_PATH=/app/projectDocs
      - LOG_LEVEL=INFO
      - API_KEY=${API_KEY}  # From .env file
```

#### Using .env File

Create `.env` in the same directory as `docker-compose.production.yml`:

```bash
API_KEY=your-secret-key
LOG_LEVEL=INFO
VITE_API_BASE_URL=http://ai-agent-api:8000/api
```

Docker Compose automatically loads this file.

## Security Best Practices

### 1. Use HTTPS in Production

Set up a reverse proxy with SSL/TLS:

**Using Nginx:**

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Client
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # API
    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}
```

**Get SSL Certificate with Let's Encrypt:**

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### 2. Configure Firewall

```bash
# Ubuntu/Debian with ufw
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Only allow necessary ports
# Block direct access to 3000 and 8000 from outside
```

### 3. Use Environment Variables for Secrets

**Never commit secrets to Git:**

```bash
# Good: Use environment variables
API_KEY=${API_KEY}

# Bad: Hardcode secrets
API_KEY=my-secret-key-123
```

### 4. Enable API Authentication

If the API supports authentication:

```bash
# API .env
API_KEY=your-very-secure-random-key-here

# Client .env
VITE_API_KEY=your-very-secure-random-key-here
```

### 5. Configure CORS Properly

In API configuration:

```python
# Only allow specific origins
ALLOWED_ORIGINS = [
    "https://yourdomain.com",
    "https://www.yourdomain.com"
]
```

### 6. Keep Dependencies Updated

```bash
# Regularly update Docker images
docker compose pull
docker compose up -d

# Update npm packages (client)
cd client && npm update

# Update Python packages (API)
cd api && pip install --upgrade -r requirements.txt
```

### 7. Set Resource Limits

In `docker-compose.production.yml`:

```yaml
services:
  ai-agent-api:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### 8. Use Docker Secrets (Swarm Mode)

For Docker Swarm deployments:

```yaml
services:
  ai-agent-api:
    secrets:
      - api_key

secrets:
  api_key:
    external: true
```

## Monitoring and Logging

### Health Checks

Both services include health checks:

```bash
# Check API health
curl http://localhost:8000/health

# Check client (returns HTML)
curl http://localhost:3000
```

### Docker Health Status

```bash
# View health status
docker compose ps

# Expected output shows "healthy" status
```

### Viewing Logs

```bash
# All logs
docker compose logs -f

# Specific service
docker compose logs -f ai-agent-api
docker compose logs -f ai-agent-client

# Last N lines
docker compose logs --tail=100 ai-agent-api
```

### Log Rotation

Configure Docker log rotation in `/etc/docker/daemon.json`:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

Restart Docker:
```bash
sudo systemctl restart docker
```

### Monitoring Tools

#### Basic Monitoring with Docker Stats

```bash
# Real-time resource usage
docker stats

# Specific containers
docker stats ai-agent-api ai-agent-client
```

#### Advanced Monitoring (Optional)

**Prometheus + Grafana:**
- Collect metrics from containers
- Visualize with dashboards
- Set up alerts

**ELK Stack (Elasticsearch, Logstash, Kibana):**
- Aggregate logs from all containers
- Search and analyze logs
- Create visualizations

## Backup and Recovery

### Backup Strategy

#### 1. Backup Docker Volumes

```bash
# List volumes
docker volume ls

# Backup volume
docker run --rm -v projectDocs:/data -v $(pwd):/backup \
  alpine tar czf /backup/projectDocs-backup-$(date +%Y%m%d).tar.gz /data
```

#### 2. Backup Configuration Files

```bash
# Backup directory
BACKUP_DIR=/opt/backups/ai-agent-$(date +%Y%m%d)
mkdir -p $BACKUP_DIR

# Copy configs
cp -r /opt/ai-agent/api/.env $BACKUP_DIR/
cp -r /opt/ai-agent/api/config $BACKUP_DIR/
cp -r /opt/ai-agent/docker-compose.production.yml $BACKUP_DIR/
```

#### 3. Automated Backups

Create a backup script `/opt/ai-agent/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR=/opt/backups/ai-agent-$(date +%Y%m%d-%H%M%S)
mkdir -p $BACKUP_DIR

# Backup configs
cp -r /opt/ai-agent/api/.env $BACKUP_DIR/
cp -r /opt/ai-agent/api/config $BACKUP_DIR/

# Backup volumes
docker run --rm -v projectDocs:/data -v $BACKUP_DIR:/backup \
  alpine tar czf /backup/projectDocs.tar.gz /data

echo "Backup completed: $BACKUP_DIR"
```

Schedule with cron:
```bash
# Run daily at 2 AM
0 2 * * * /opt/ai-agent/backup.sh
```

### Recovery

#### Restore from Backup

```bash
# Stop services
docker compose down

# Restore volume
docker run --rm -v projectDocs:/data -v $(pwd):/backup \
  alpine tar xzf /backup/projectDocs-backup-20260110.tar.gz -C /data

# Restore configs
cp backup/.env /opt/ai-agent/api/.env
cp -r backup/config /opt/ai-agent/api/

# Start services
docker compose up -d
```

## Scaling Considerations

### Horizontal Scaling

#### Load Balancing Multiple Client Instances

Use Docker Compose scaling:

```bash
# Scale client to 3 instances
docker compose up -d --scale ai-agent-client=3
```

Add a load balancer (Nginx):

```nginx
upstream client_backend {
    server localhost:3001;
    server localhost:3002;
    server localhost:3003;
}

server {
    listen 80;
    location / {
        proxy_pass http://client_backend;
    }
}
```

#### API Scaling

For stateless API:

```bash
# Scale API to 3 instances
docker compose up -d --scale ai-agent-api=3
```

Add load balancer for API as well.

### Vertical Scaling

Increase resources for containers:

```yaml
services:
  ai-agent-api:
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: 4G
```

### Database Considerations

If using a database:
- Use a managed database service (AWS RDS, etc.)
- Set up replication for high availability
- Implement connection pooling

### CDN for Static Assets

Serve client static files via CDN:
- Upload `dist/` folder to CDN
- Update paths in HTML to use CDN URLs
- Reduces load on client server

## Troubleshooting

### Issue: Container fails to start

**Check logs:**
```bash
docker compose logs ai-agent-api
docker compose logs ai-agent-client
```

**Common causes:**
- Port already in use
- Missing environment variables
- Insufficient resources

**Solutions:**
```bash
# Check ports
sudo lsof -i :8000
sudo lsof -i :3000

# Verify environment variables
docker compose config

# Check resources
docker stats
```

### Issue: API not accessible from client

**Check network:**
```bash
# Verify containers are on same network
docker network inspect ai-agent-network

# Test connectivity from client container
docker exec ai-agent-client wget -O- http://ai-agent-api:8000/health
```

**Solution:**
- Ensure both containers are on `ai-agent-network`
- Use service name (`ai-agent-api`) not `localhost`

### Issue: Health checks failing

**View health check logs:**
```bash
docker inspect ai-agent-api | grep -A 20 "Health"
```

**Common causes:**
- Service not ready (increase `start_period`)
- Wrong health check command
- Service actually unhealthy

**Solution:**
```yaml
healthcheck:
  start_period: 60s  # Increase if service needs more time
  interval: 30s
  timeout: 10s
  retries: 3
```

### Issue: Out of disk space

**Check disk usage:**
```bash
df -h
docker system df
```

**Clean up:**
```bash
# Remove unused containers, images, volumes
docker system prune -a --volumes

# Remove old logs
docker compose logs --no-log-prefix > /dev/null
```

### Issue: SSL certificate renewal fails

**Manual renewal:**
```bash
sudo certbot renew --force-renewal
sudo systemctl reload nginx
```

**Check certbot logs:**
```bash
sudo cat /var/log/letsencrypt/letsencrypt.log
```

## Next Steps

After deployment:

1. **Monitor**: Set up monitoring and alerts
2. **Backup**: Schedule automated backups
3. **Update**: Keep software updated
4. **Optimize**: Fine-tune performance based on usage
5. **Scale**: Add more resources as needed

## Additional Resources

- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development setup
- [TESTING.md](./TESTING.md) - Testing guide
- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)

## Support

For issues not covered in this guide:

1. Check GitHub issues: https://github.com/blecx/AI-Agent-Framework-Client/issues
2. Review API documentation: http://localhost:8000/docs
3. Open a new issue with deployment details
