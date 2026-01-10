# AI Agent Framework - Production Setup Script (PowerShell)
# ==============================================================================
# This script automates the setup of the complete AI Agent Framework stack
# (Client + API) for production deployment on Windows.
#
# Features:
#   - Checks prerequisites (Docker, Git)
#   - Clones or updates both repositories
#   - Interactive configuration prompts
#   - Creates environment files
#   - Sets up Docker networking
#   - Builds and starts services
#   - Validates deployment
#
# Usage:
#   .\production-setup.ps1 [OPTIONS]
#
# Options:
#   -NonInteractive      Skip interactive prompts (use defaults/env vars)
#   -InstallDir PATH     Installation directory (default: .\ai-agent-stack)
#   -ApiPort PORT        API port (default: 8000)
#   -ClientPort PORT     Client port (default: 3000)
#   -SkipValidation      Skip post-setup validation
#   -Help                Show this help message
#
# Environment Variables (for non-interactive mode):
#   INSTALL_DIR          Installation directory
#   API_PORT             API port
#   CLIENT_PORT          Client port
#   SKIP_VALIDATION      Skip validation (true/false)
# ==============================================================================

param(
    [switch]$NonInteractive = $false,
    [string]$InstallDir = "",
    [int]$ApiPort = 0,
    [int]$ClientPort = 0,
    [switch]$SkipValidation = $false,
    [switch]$Help = $false
)

# ==============================================================================
# Configuration
# ==============================================================================

$ErrorActionPreference = "Stop"

# Set defaults from environment or parameters
if ([string]::IsNullOrEmpty($InstallDir)) {
    $InstallDir = if ($env:INSTALL_DIR) { $env:INSTALL_DIR } else { ".\ai-agent-stack" }
}
if ($ApiPort -eq 0) {
    $ApiPort = if ($env:API_PORT) { [int]$env:API_PORT } else { 8000 }
}
if ($ClientPort -eq 0) {
    $ClientPort = if ($env:CLIENT_PORT) { [int]$env:CLIENT_PORT } else { 3000 }
}
if (!$SkipValidation) {
    $SkipValidation = $env:SKIP_VALIDATION -eq "true"
}

$ApiRepo = "https://github.com/blecx/AI-Agent-Framework.git"
$ClientRepo = "https://github.com/blecx/AI-Agent-Framework-Client.git"

# ==============================================================================
# Helper Functions
# ==============================================================================

function Write-Banner {
    Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║                                                                ║" -ForegroundColor Cyan
    Write-Host "║           AI Agent Framework - Production Setup               ║" -ForegroundColor Cyan
    Write-Host "║                                                                ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Header {
    param([string]$Message)
    Write-Host "`n▶ $Message" -ForegroundColor Blue -NoNewline
    Write-Host " " -NoNewline
    Write-Host ([string]::new('─', 60)) -ForegroundColor Blue
    Write-Host ""
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ " -ForegroundColor Green -NoNewline
    Write-Host $Message
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "✗ Error: " -ForegroundColor Red -NoNewline
    Write-Host $Message
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "⚠ Warning: " -ForegroundColor Yellow -NoNewline
    Write-Host $Message
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ " -ForegroundColor Cyan -NoNewline
    Write-Host $Message
}

function Write-Step {
    param([string]$Message)
    Write-Host "➜ " -ForegroundColor Magenta -NoNewline
    Write-Host $Message
}

function Test-Command {
    param([string]$Command)
    
    try {
        $null = Get-Command $Command -ErrorAction Stop
        Write-Success "$Command is installed"
        return $true
    }
    catch {
        Write-Error-Custom "$Command is not installed"
        return $false
    }
}

function Show-Help {
    Write-Host "AI Agent Framework - Production Setup Script"
    Write-Host ""
    Write-Host "Usage: .\production-setup.ps1 [OPTIONS]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -NonInteractive      Skip interactive prompts (use defaults/env vars)"
    Write-Host "  -InstallDir PATH     Installation directory (default: .\ai-agent-stack)"
    Write-Host "  -ApiPort PORT        API port (default: 8000)"
    Write-Host "  -ClientPort PORT     Client port (default: 3000)"
    Write-Host "  -SkipValidation      Skip post-setup validation"
    Write-Host "  -Help                Show this help message"
    Write-Host ""
    Write-Host "Environment Variables (for non-interactive mode):"
    Write-Host "  INSTALL_DIR          Installation directory"
    Write-Host "  API_PORT             API port"
    Write-Host "  CLIENT_PORT          Client port"
    Write-Host "  SKIP_VALIDATION      Skip validation (true/false)"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  # Interactive mode (recommended)"
    Write-Host "  .\production-setup.ps1"
    Write-Host ""
    Write-Host "  # Non-interactive mode with custom settings"
    Write-Host "  .\production-setup.ps1 -NonInteractive -InstallDir C:\ai-agent -ApiPort 9000 -ClientPort 8080"
    Write-Host ""
    exit 0
}

# ==============================================================================
# Main Functions
# ==============================================================================

function Test-Prerequisites {
    Write-Header "Checking Prerequisites"
    
    $missingDeps = 0
    
    # Check Docker
    if (Test-Command "docker") {
        $dockerVersion = (docker --version).Split(" ")[2].TrimEnd(",")
        Write-Info "Docker version: $dockerVersion"
    }
    else {
        $missingDeps++
    }
    
    # Check Docker Compose
    try {
        docker compose version | Out-Null
        $composeVersion = (docker compose version --short)
        Write-Success "docker compose is available (v$composeVersion)"
    }
    catch {
        Write-Error-Custom "docker compose is not installed"
        $missingDeps++
    }
    
    # Check Git
    if (Test-Command "git") {
        $gitVersion = (git --version).Split(" ")[2]
        Write-Info "Git version: $gitVersion"
    }
    else {
        $missingDeps++
    }
    
    # Check curl (optional)
    if (Test-Command "curl") {
        Write-Success "curl is available (for validation)"
    }
    else {
        Write-Warning-Custom "curl not found (validation will be limited)"
    }
    
    if ($missingDeps -gt 0) {
        Write-Host ""
        Write-Error-Custom "Missing required dependencies. Please install them and try again."
        Write-Host ""
        Write-Host "Installation instructions:"
        Write-Host "  • Docker: https://docs.docker.com/get-docker/"
        Write-Host "  • Git: https://git-scm.com/downloads"
        exit 1
    }
    
    Write-Host ""
}

function Get-Configuration {
    Write-Header "Configuration"
    
    if (!$NonInteractive) {
        Write-Host "Let's configure your installation.`n" -ForegroundColor White
        
        $input = Read-Host "Installation directory [$InstallDir]"
        if (![string]::IsNullOrEmpty($input)) { $script:InstallDir = $input }
        
        $input = Read-Host "API port [$ApiPort]"
        if (![string]::IsNullOrEmpty($input)) { $script:ApiPort = [int]$input }
        
        $input = Read-Host "Client port [$ClientPort]"
        if (![string]::IsNullOrEmpty($input)) { $script:ClientPort = [int]$input }
    }
    
    # Expand path
    $script:InstallDir = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($InstallDir)
    
    Write-Host ""
    Write-Info "Configuration summary:"
    Write-Host "  • Installation directory: $InstallDir"
    Write-Host "  • API port: $ApiPort"
    Write-Host "  • Client port: $ClientPort"
    Write-Host ""
    
    if (!$NonInteractive) {
        $proceed = Read-Host "Proceed with installation? (y/n) [y]"
        if ($proceed -eq "n" -or $proceed -eq "N") {
            Write-Warning-Custom "Installation cancelled by user"
            exit 0
        }
    }
    
    Write-Host ""
}

function Initialize-Directories {
    Write-Header "Setting Up Directories"
    
    Write-Step "Creating installation directory: $InstallDir"
    New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
    Set-Location $InstallDir
    Write-Success "Directory created: $InstallDir"
    
    Write-Host ""
}

function Initialize-Repositories {
    Write-Header "Setting Up Repositories"
    
    # API Repository
    Write-Step "Setting up AI-Agent-Framework API..."
    if (Test-Path "AI-Agent-Framework\.git") {
        Write-Info "API repository already exists, updating..."
        Set-Location AI-Agent-Framework
        try {
            git pull origin main
        }
        catch {
            try { git pull origin master } catch { Write-Warning-Custom "Could not update API repo" }
        }
        Set-Location ..
        Write-Success "API repository updated"
    }
    else {
        Write-Info "Cloning API repository..."
        git clone $ApiRepo AI-Agent-Framework
        Write-Success "API repository cloned"
    }
    
    Write-Host ""
    
    # Client Repository
    Write-Step "Setting up AI-Agent-Framework-Client..."
    if (Test-Path "AI-Agent-Framework-Client\.git") {
        Write-Info "Client repository already exists, updating..."
        Set-Location AI-Agent-Framework-Client
        try {
            git pull origin main
        }
        catch {
            try { git pull origin master } catch { Write-Warning-Custom "Could not update Client repo" }
        }
        Set-Location ..
        Write-Success "Client repository updated"
    }
    else {
        Write-Info "Cloning Client repository..."
        git clone $ClientRepo AI-Agent-Framework-Client
        Write-Success "Client repository cloned"
    }
    
    Write-Host ""
}

function New-EnvironmentFiles {
    Write-Header "Creating Environment Configuration"
    
    # API .env file
    Write-Step "Creating API environment file..."
    @"
# AI Agent Framework API - Production Environment
PROJECT_DOCS_PATH=./projectDocs
LLM_CONFIG_PATH=./config/llm.json
PORT=$ApiPort
HOST=0.0.0.0
LOG_LEVEL=INFO
"@ | Out-File -FilePath "AI-Agent-Framework\.env" -Encoding utf8
    Write-Success "API .env created"
    
    # Create API directories
    New-Item -ItemType Directory -Force -Path "AI-Agent-Framework\projectDocs" | Out-Null
    New-Item -ItemType Directory -Force -Path "AI-Agent-Framework\config" | Out-Null
    
    # Create LLM config
    if (!(Test-Path "AI-Agent-Framework\config\llm.json")) {
        Write-Step "Creating LLM configuration..."
        @"
{
  "provider": "lm-studio",
  "api_url": "http://localhost:1234/v1",
  "model": "local-model",
  "temperature": 0.7,
  "max_tokens": 2000
}
"@ | Out-File -FilePath "AI-Agent-Framework\config\llm.json" -Encoding utf8
        Write-Success "LLM config created"
    }
    else {
        Write-Info "LLM config already exists, skipping"
    }
    
    # Client .env file
    Write-Step "Creating Client environment file..."
    @"
# AI Agent Framework Client - Production Environment
VITE_API_BASE_URL=http://ai-agent-api:$ApiPort/api
VITE_API_KEY=
VITE_HEALTH_CHECK_INTERVAL=30000
"@ | Out-File -FilePath "AI-Agent-Framework-Client\client\.env" -Encoding utf8
    Write-Success "Client .env created"
    
    # Root .env file
    Write-Step "Creating root environment file..."
    @"
# Production Environment Configuration
API_PORT=$ApiPort
CLIENT_PORT=$ClientPort
VITE_API_BASE_URL=http://ai-agent-api:$ApiPort/api
LOG_LEVEL=INFO
DOCKER_NETWORK=ai-agent-network
API_CONTAINER_NAME=ai-agent-api
CLIENT_CONTAINER_NAME=ai-agent-client
"@ | Out-File -FilePath ".env" -Encoding utf8
    Write-Success "Root .env created"
    
    Write-Host ""
}

function New-DockerCompose {
    Write-Header "Creating Docker Compose Configuration"
    
    Write-Step "Copying production docker-compose.yml..."
    
    if (Test-Path "AI-Agent-Framework-Client\docker-compose.production.yml") {
        Copy-Item "AI-Agent-Framework-Client\docker-compose.production.yml" "docker-compose.yml"
        Write-Success "Docker compose file created"
    }
    else {
        Write-Warning-Custom "docker-compose.production.yml not found, creating basic configuration..."
        # Create a basic docker-compose.yml
        @"
version: '3.8'

services:
  ai-agent-api:
    build:
      context: ./AI-Agent-Framework
      dockerfile: Dockerfile
    container_name: ai-agent-api
    environment:
      - PROJECT_DOCS_PATH=/app/projectDocs
      - LLM_CONFIG_PATH=/app/config/llm.json
      - PORT=8000
      - HOST=0.0.0.0
      - LOG_LEVEL=INFO
    volumes:
      - ./AI-Agent-Framework/projectDocs:/app/projectDocs
      - ./AI-Agent-Framework/config:/app/config
    ports:
      - "$ApiPort:8000"
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
      context: ./AI-Agent-Framework-Client
      dockerfile: Dockerfile
    container_name: ai-agent-client
    environment:
      - VITE_API_BASE_URL=http://ai-agent-api:8000/api
    ports:
      - "$ClientPort:80"
    depends_on:
      ai-agent-api:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - ai-agent-network

networks:
  ai-agent-network:
    driver: bridge
"@ | Out-File -FilePath "docker-compose.yml" -Encoding utf8
        Write-Success "Docker compose file created"
    }
    
    Write-Host ""
}

function Start-Services {
    Write-Header "Building and Starting Services"
    
    Write-Step "Building Docker images (this may take several minutes)..."
    Write-Host ""
    
    try {
        docker compose build
        Write-Success "Docker images built successfully"
    }
    catch {
        Write-Error-Custom "Failed to build Docker images"
        throw
    }
    
    Write-Host ""
    Write-Step "Starting services..."
    Write-Host ""
    
    try {
        docker compose up -d
        Write-Success "Services started successfully"
    }
    catch {
        Write-Error-Custom "Failed to start services"
        throw
    }
    
    Write-Host ""
    Write-Info "Waiting for services to become healthy (this may take up to 60 seconds)..."
    
    # Wait for services
    $maxWait = 60
    $waited = 0
    while ($waited -lt $maxWait) {
        try {
            $apiHealth = docker inspect --format='{{.State.Health.Status}}' ai-agent-api 2>$null
            if ($apiHealth -eq "healthy") {
                Write-Success "Services are healthy and ready"
                break
            }
        }
        catch { }
        
        Write-Host "`rℹ Waiting for services... $waited`s / $maxWait`s" -NoNewline
        Start-Sleep -Seconds 5
        $waited += 5
    }
    Write-Host ""
    
    Write-Host ""
}

function Test-Deployment {
    if ($SkipValidation) {
        Write-Info "Skipping validation (SkipValidation flag set)"
        return
    }
    
    Write-Header "Validating Deployment"
    
    Write-Info "Performing basic validation checks..."
    
    # Check API
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$ApiPort/health" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Success "API is responding"
        }
    }
    catch {
        Write-Warning-Custom "API is not responding yet"
    }
    
    # Check Client
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$ClientPort" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Success "Client is responding"
        }
    }
    catch {
        Write-Warning-Custom "Client is not responding yet"
    }
    
    Write-Host ""
}

function Show-Summary {
    Write-Header "Setup Complete!"
    
    Write-Host "✓ AI Agent Framework is now running!`n" -ForegroundColor Green
    
    Write-Host "Access your services:" -ForegroundColor White
    Write-Host "  • Client (Web UI):     http://localhost:$ClientPort" -ForegroundColor Cyan
    Write-Host "  • API:                 http://localhost:$ApiPort" -ForegroundColor Cyan
    Write-Host "  • API Documentation:   http://localhost:$ApiPort/docs" -ForegroundColor Cyan
    Write-Host "  • Health Check:        http://localhost:$ApiPort/health" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Useful commands:" -ForegroundColor White
    Write-Host "  • View logs:           docker compose logs -f" -ForegroundColor Cyan
    Write-Host "  • Stop services:       docker compose down" -ForegroundColor Cyan
    Write-Host "  • Restart services:    docker compose restart" -ForegroundColor Cyan
    Write-Host "  • View status:         docker compose ps" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Configuration files:" -ForegroundColor White
    Write-Host "  • Installation dir:    $InstallDir" -ForegroundColor Cyan
    Write-Host "  • API config:          $InstallDir\AI-Agent-Framework\.env" -ForegroundColor Cyan
    Write-Host "  • Client config:       $InstallDir\AI-Agent-Framework-Client\client\.env" -ForegroundColor Cyan
    Write-Host "  • Docker Compose:      $InstallDir\docker-compose.yml" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Next steps:" -ForegroundColor White
    Write-Host "  1. Open http://localhost:$ClientPort in your browser" -ForegroundColor Cyan
    Write-Host "  2. Configure your LLM provider in AI-Agent-Framework\config\llm.json" -ForegroundColor Cyan
    Write-Host "  3. Read the documentation in AI-Agent-Framework-Client\docs\" -ForegroundColor Cyan
    Write-Host ""
}

# ==============================================================================
# Main Execution
# ==============================================================================

if ($Help) {
    Show-Help
}

Write-Banner

try {
    Test-Prerequisites
    Get-Configuration
    Initialize-Directories
    Initialize-Repositories
    New-EnvironmentFiles
    New-DockerCompose
    Start-Services
    Test-Deployment
    Show-Summary
    
    Write-Host "Happy coding! 🚀`n" -ForegroundColor Green
}
catch {
    Write-Host "`nSetup failed! Check the errors above." -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

exit 0
