# Deployment Guide for AI-Agent-Framework-Client

This guide provides step-by-step instructions for deploying the AI-Agent-Framework-Client.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [Docker Deployment](#docker-deployment)
- [Environment Configuration](#environment-configuration)

## Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- Docker and Docker Compose (for containerized deployment)

## Local Development

### 1. Install Dependencies

The project uses npm to manage dependencies, which creates a `node_modules` directory (Node.js virtual environment):

```bash
cd client
npm install
```

This creates an isolated environment for all project dependencies in the `node_modules` directory, similar to Python's virtual environments.

### 2. Configure Environment

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` to set your API endpoint:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Production Deployment

### 1. Build the Application

```bash
cd client
npm run build
```

This creates an optimized production build in the `dist` directory.

### 2. Serve the Build

You can serve the `dist` directory using any static file server. Example with nginx:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/client/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Docker Deployment

### Using Docker Compose (Recommended)

1. **Configure Environment**

Create a `.env` file in the project root:

```bash
VITE_API_BASE_URL=http://your-api-server:8000/api
```

2. **Build and Run**

```bash
docker-compose up -d
```

The application will be available at `http://localhost:3000`

3. **View Logs**

```bash
docker-compose logs -f
```

4. **Stop the Application**

```bash
docker-compose down
```

### Using Docker Directly

1. **Build the Image**

```bash
docker build -t ai-agent-client .
```

2. **Run the Container**

```bash
docker run -d \
  -p 3000:80 \
  -e VITE_API_BASE_URL=http://your-api-server:8000/api \
  --name ai-agent-client \
  ai-agent-client
```

3. **View Logs**

```bash
docker logs -f ai-agent-client
```

4. **Stop and Remove**

```bash
docker stop ai-agent-client
docker rm ai-agent-client
```

## Environment Configuration

The application uses environment variables for configuration. These are set at build time for Vite.

### Available Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Base URL for the AI Agent Framework API | `http://localhost:8000/api` |

### Setting Environment Variables

#### Local Development
Create a `.env` file in the `client` directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

#### Docker Compose
Set environment variables in `docker-compose.yml`:

```yaml
environment:
  - VITE_API_BASE_URL=http://your-api-server:8000/api
```

#### Docker Run
Pass environment variables with the `-e` flag:

```bash
docker run -e VITE_API_BASE_URL=http://your-api-server:8000/api ...
```

## Node.js Virtual Environment

Unlike Python which uses separate virtual environments, Node.js uses the `node_modules` directory as an isolated dependency environment for each project. This directory:

- Contains all project dependencies
- Is specific to each project
- Should never be committed to version control (included in `.gitignore`)
- Is recreated using `npm install` or `npm ci`

### Managing Dependencies

**Install dependencies:**
```bash
npm install
```

**Install specific package:**
```bash
npm install package-name
```

**Remove package:**
```bash
npm uninstall package-name
```

**Update all dependencies:**
```bash
npm update
```

**Clean install (recommended for CI/CD):**
```bash
npm ci
```

## Troubleshooting

### Port Already in Use

If port 3000 (Docker) or 5173 (dev server) is in use:

**For Docker:**
Edit `docker-compose.yml` and change the port mapping:
```yaml
ports:
  - "8080:80"  # Change 3000 to 8080 or any available port
```

**For Dev Server:**
Vite will automatically try the next available port, or you can specify one:
```bash
npm run dev -- --port 8080
```

### API Connection Issues

If tests fail with connection errors:

1. Verify the API server is running
2. Check the `VITE_API_BASE_URL` is correct
3. For Docker deployments, ensure containers are on the same network
4. Check CORS settings on the API server

### Build Failures

If the build fails:

1. Clear node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

2. Clear Vite cache:
```bash
rm -rf node_modules/.vite
```

3. Rebuild:
```bash
npm run build
```

## Performance Optimization

### Production Build Optimizations

The production build includes:
- Code minification
- Tree shaking (removal of unused code)
- Asset optimization
- Chunking for better caching

### Nginx Caching

The provided `nginx.conf` includes caching headers for static assets:
- Static files cached for 1 year
- index.html never cached (always fresh)
- Gzip compression enabled

## Security Considerations

1. **Never commit `.env` files** with sensitive data
2. **Use environment-specific configurations** for different deployments
3. **Enable HTTPS** in production with proper SSL certificates
4. **Keep dependencies updated** to patch security vulnerabilities:
   ```bash
   npm audit
   npm audit fix
   ```

## Monitoring

### Docker Container Health

Check container status:
```bash
docker ps
docker stats ai-agent-client
```

### Application Logs

View application logs in browser console or server logs:
```bash
docker logs ai-agent-client
```

## Scaling

For high-traffic deployments:

1. **Use a load balancer** in front of multiple containers
2. **Configure Docker Compose** for multiple replicas
3. **Use orchestration tools** like Kubernetes for large-scale deployments

Example with Docker Compose scaling:
```bash
docker-compose up -d --scale client=3
```
