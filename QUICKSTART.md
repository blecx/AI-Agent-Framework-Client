# Quick Start - Full Stack Setup

Get the AI-Agent-Framework full stack (Client + API) running in under 5 minutes!

## Prerequisites

Before you begin, ensure you have:

- ✅ **Docker 28+** and Docker Compose installed
- ✅ **Git** installed
- ✅ **2GB RAM** minimum available
- ✅ **Ports 3000 and 8000** available
- ✅ **Internet connection** for downloading images and dependencies

### Check Prerequisites

```bash
# Check Docker
docker --version
docker compose version

# Check Git
git --version

# Check available ports
# Linux/Mac
lsof -i :3000 || echo "Port 3000 is available"
lsof -i :8000 || echo "Port 8000 is available"

# Windows PowerShell
# netstat -ano | findstr :3000
# netstat -ano | findstr :8000
```

## Option 1: Automated Setup (Recommended)

### Linux / macOS

Use the automated production setup script:

```bash
# Download the setup script
curl -fsSL https://raw.githubusercontent.com/blecx/AI-Agent-Framework-Client/main/production-setup.sh -o production-setup.sh

# Make it executable
chmod +x production-setup.sh

# Run the setup
./production-setup.sh
```

The script will guide you through:
1. Checking dependencies
2. Cloning repositories
3. Configuring environment
4. Starting services
5. Validating deployment

### Windows PowerShell

```powershell
# Download the setup script
iwr -useb https://raw.githubusercontent.com/blecx/AI-Agent-Framework-Client/main/production-setup.ps1 -outfile production-setup.ps1

# Set execution policy (if needed)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Run the setup
.\production-setup.ps1
```

### What the Script Does

The automated script will:
- ✅ Verify Docker and Git are installed
- ✅ Clone both AI-Agent-Framework repositories
- ✅ Create necessary configuration files
- ✅ Set up Docker networking
- ✅ Build and start containers
- ✅ Run health checks
- ✅ Display access URLs

**Estimated Time:** 3-5 minutes (depending on network speed)

## Option 2: Manual Setup with Docker Compose

### Step 1: Clone the Client Repository

```bash
# Clone this repository
git clone https://github.com/blecx/AI-Agent-Framework-Client.git
cd AI-Agent-Framework-Client
```

### Step 2: Use Production Docker Compose

```bash
# Start services with production compose file
docker compose -f docker-compose.production.yml up -d

# View logs (optional)
docker compose -f docker-compose.production.yml logs -f
```

This will:
- Pull/build the API image
- Build the client image
- Set up networking
- Start both services

**Estimated Time:** 3-5 minutes (first run)

### Step 3: Validate Setup

```bash
# Run validation script
./scripts/validate-setup.sh

# Or manually check
curl http://localhost:8000/health
curl http://localhost:3000
```

## Option 3: Quick Development Setup

For development with hot reload:

### Step 1: Start the API

```bash
# Clone API repository
git clone https://github.com/blecx/AI-Agent-Framework.git
cd AI-Agent-Framework

# Start with Docker
docker compose up -d

# Or with Python (if you have Python 3.9+)
# python3 -m venv venv
# source venv/bin/activate
# pip install -r requirements.txt
# uvicorn main:app --reload
```

### Step 2: Start the Client

```bash
# In a new terminal
cd AI-Agent-Framework-Client/client

# Install dependencies
npm install

# Start dev server
npm run dev
```

**Access:**
- Client: http://localhost:5173 (with hot reload)
- API: http://localhost:8000

**Estimated Time:** 5-10 minutes

## Accessing the Application

Once setup is complete, access the application:

### Web UI (Client)

**URL:** http://localhost:3000 (Docker) or http://localhost:5173 (dev)

**Features:**
- 📊 Dashboard with project overview
- 🧪 API Tester for endpoint testing
- 📝 Document proposal interface
- ⚡ Command execution panel

### API Documentation

**URL:** http://localhost:8000/docs

**Features:**
- Interactive API documentation (Swagger UI)
- Try endpoints directly from browser
- View request/response schemas
- Test authentication

### Health Check

**URL:** http://localhost:8000/health

**Expected Response:**
```json
{"status": "healthy"}
```

## Verification Steps

After setup, verify everything is working:

### 1. Check Containers are Running

```bash
docker ps

# Expected output: Two containers running
# - ai-agent-client
# - ai-agent-api
```

### 2. Test API Health

```bash
curl http://localhost:8000/health

# Expected: {"status":"healthy"}
```

### 3. Test Client

```bash
# Check client responds
curl -I http://localhost:3000

# Expected: HTTP/1.1 200 OK
```

### 4. Test Integration

1. Open http://localhost:3000 in browser
2. Navigate to "API Tester"
3. Click "Test Health Check"
4. Verify success message appears

## Common First-Run Issues

### Issue: Port Already in Use

**Error:** `Bind for 0.0.0.0:3000 failed: port is already allocated`

**Solution:**
```bash
# Find what's using the port
lsof -i :3000  # or :8000

# Kill the process or change port in docker-compose.production.yml
```

### Issue: Docker Not Running

**Error:** `Cannot connect to the Docker daemon`

**Solution:**
```bash
# Start Docker
# macOS: Start Docker Desktop app
# Linux: sudo systemctl start docker
# Windows: Start Docker Desktop
```

### Issue: Permission Denied

**Error:** `Permission denied` when running scripts

**Solution:**
```bash
# Make script executable
chmod +x production-setup.sh

# Or run with bash
bash production-setup.sh
```

### Issue: Containers Keep Restarting

**Check logs:**
```bash
docker compose logs ai-agent-api
docker compose logs ai-agent-client
```

**Common causes:**
- Missing environment variables
- Incorrect configuration
- Insufficient resources

**Solution:**
```bash
# Stop and rebuild
docker compose down
docker compose build --no-cache
docker compose up -d
```

## Next Steps

Now that you have the application running:

### 1. Explore the UI

- Navigate through the application
- Try the API Tester
- Create a test project (if applicable)
- Execute sample commands

### 2. Read the Documentation

- **Development Guide:** [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)
- **Testing Guide:** [docs/TESTING.md](docs/TESTING.md)
- **Production Guide:** [docs/PRODUCTION.md](docs/PRODUCTION.md)

### 3. Configure for Your Needs

**API Configuration:**
Edit `.env` in AI-Agent-Framework directory:
```bash
PROJECT_DOCS_PATH=./projectDocs
LLM_CONFIG_PATH=./config/llm.json
# Add your LLM provider settings
```

**Client Configuration:**
Edit `.env` in `client/` directory:
```bash
VITE_API_BASE_URL=http://localhost:8000/api
# Add API key if needed
```

**Rebuild after changes:**
```bash
docker compose down
docker compose build
docker compose up -d
```

### 4. Integrate with Your LLM

Configure the LLM provider in `AI-Agent-Framework/config/llm.json`:

```json
{
  "provider": "lm-studio",
  "api_url": "http://localhost:1234/v1",
  "model": "your-model-name",
  "temperature": 0.7,
  "max_tokens": 2000
}
```

Supported providers:
- LM Studio (local)
- OpenAI
- Anthropic
- Azure OpenAI
- Custom endpoints

## Stopping the Services

### Docker Compose

```bash
# Stop services
docker compose down

# Stop and remove volumes
docker compose down -v
```

### Development Servers

```bash
# Client: Press Ctrl+C in terminal running npm run dev

# API: Press Ctrl+C in terminal running uvicorn
# Or: docker compose down
```

## Updating

### Pull Latest Changes

```bash
# Update client
cd AI-Agent-Framework-Client
git pull
docker compose down
docker compose build
docker compose up -d

# Update API
cd AI-Agent-Framework
git pull
docker compose down
docker compose build
docker compose up -d
```

## Getting Help

### Documentation

- 📖 [Main README](README.md)
- 🛠️ [Development Guide](docs/DEVELOPMENT.md)
- 🧪 [Testing Guide](docs/TESTING.md)
- 🚀 [Production Guide](docs/PRODUCTION.md)

### Resources

- **API Docs:** http://localhost:8000/docs (when running)
- **GitHub Issues:** [Report issues here](https://github.com/blecx/AI-Agent-Framework-Client/issues)
- **API Repository:** https://github.com/blecx/AI-Agent-Framework

### Troubleshooting

If you encounter issues:

1. **Check logs:**
   ```bash
   docker compose logs -f
   ```

2. **Verify health:**
   ```bash
   ./scripts/validate-setup.sh
   ```

3. **Restart services:**
   ```bash
   docker compose restart
   ```

4. **Clean restart:**
   ```bash
   docker compose down
   docker compose build --no-cache
   docker compose up -d
   ```

## Success! 🎉

If you've reached this point and can access:
- ✅ Client at http://localhost:3000
- ✅ API at http://localhost:8000/health
- ✅ API Docs at http://localhost:8000/docs

**Congratulations!** Your AI-Agent-Framework full stack is running!

Start exploring the features, test the API endpoints, and integrate it with your AI agents.

Happy coding! 🚀
