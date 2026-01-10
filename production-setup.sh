#!/bin/bash

# ==============================================================================
# AI Agent Framework - Production Setup Script
# ==============================================================================
# This script automates the setup of the complete AI Agent Framework stack
# (Client + API) for production deployment.
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
#   ./production-setup.sh [OPTIONS]
#
# Options:
#   --non-interactive    Skip interactive prompts (use defaults/env vars)
#   --install-dir PATH   Installation directory (default: ./ai-agent-stack)
#   --api-port PORT      API port (default: 8000)
#   --client-port PORT   Client port (default: 3000)
#   --skip-validation    Skip post-setup validation
#   --help               Show this help message
#
# Environment Variables (for non-interactive mode):
#   INSTALL_DIR          Installation directory
#   API_PORT             API port
#   CLIENT_PORT          Client port
#   SKIP_VALIDATION      Skip validation (true/false)
# ==============================================================================

set -e  # Exit on error

# ==============================================================================
# Colors and Formatting
# ==============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# ==============================================================================
# Default Configuration
# ==============================================================================

INTERACTIVE=true
INSTALL_DIR="${INSTALL_DIR:-./ai-agent-stack}"
API_PORT="${API_PORT:-8000}"
CLIENT_PORT="${CLIENT_PORT:-3000}"
SKIP_VALIDATION="${SKIP_VALIDATION:-false}"

API_REPO="https://github.com/blecx/AI-Agent-Framework.git"
CLIENT_REPO="https://github.com/blecx/AI-Agent-Framework-Client.git"

# ==============================================================================
# Helper Functions
# ==============================================================================

print_banner() {
    echo -e "${CYAN}"
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║                                                                ║"
    echo "║           AI Agent Framework - Production Setup               ║"
    echo "║                                                                ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}\n"
}

print_header() {
    echo -e "\n${BLUE}${BOLD}▶ $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗ Error:${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠ Warning:${NC} $1"
}

print_info() {
    echo -e "${CYAN}ℹ${NC} $1"
}

print_step() {
    echo -e "${MAGENTA}➜${NC} $1"
}

prompt_user() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"
    
    if [ "$INTERACTIVE" = true ]; then
        echo -ne "${WHITE}${prompt}${NC}"
        if [ -n "$default" ]; then
            echo -ne " ${CYAN}[${default}]${NC}: "
        else
            echo -ne ": "
        fi
        read -r input
        if [ -z "$input" ] && [ -n "$default" ]; then
            eval "$var_name='$default'"
        else
            eval "$var_name='$input'"
        fi
    else
        eval "$var_name='$default'"
        print_info "Using $var_name: $default"
    fi
}

check_command() {
    if command -v "$1" &> /dev/null; then
        print_success "$1 is installed"
        return 0
    else
        print_error "$1 is not installed"
        return 1
    fi
}

check_prerequisites() {
    print_header "Checking Prerequisites"
    
    local missing_deps=0
    
    # Check Docker
    if check_command "docker"; then
        docker_version=$(docker --version | cut -d ' ' -f 3 | cut -d ',' -f 1)
        print_info "Docker version: $docker_version"
    else
        missing_deps=1
    fi
    
    # Check Docker Compose
    if docker compose version &> /dev/null; then
        compose_version=$(docker compose version --short 2>/dev/null || echo "unknown")
        print_success "docker compose is available (v$compose_version)"
    elif command -v docker-compose &> /dev/null; then
        compose_version=$(docker-compose --version | cut -d ' ' -f 3 | cut -d ',' -f 1)
        print_success "docker-compose is available (v$compose_version)"
    else
        print_error "docker compose is not installed"
        missing_deps=1
    fi
    
    # Check Git
    if check_command "git"; then
        git_version=$(git --version | cut -d ' ' -f 3)
        print_info "Git version: $git_version"
    else
        missing_deps=1
    fi
    
    # Check curl (optional)
    if command -v curl &> /dev/null; then
        print_success "curl is available (for validation)"
    else
        print_warning "curl not found (validation will be limited)"
    fi
    
    if [ $missing_deps -eq 1 ]; then
        echo ""
        print_error "Missing required dependencies. Please install them and try again."
        echo ""
        echo "Installation instructions:"
        echo "  • Docker: https://docs.docker.com/get-docker/"
        echo "  • Git: https://git-scm.com/downloads"
        exit 1
    fi
    
    echo ""
}

gather_configuration() {
    print_header "Configuration"
    
    if [ "$INTERACTIVE" = true ]; then
        echo -e "${WHITE}Let's configure your installation.${NC}\n"
    fi
    
    prompt_user "Installation directory" "$INSTALL_DIR" "INSTALL_DIR"
    prompt_user "API port" "$API_PORT" "API_PORT"
    prompt_user "Client port" "$CLIENT_PORT" "CLIENT_PORT"
    
    # Expand tilde and relative paths
    INSTALL_DIR="${INSTALL_DIR/#\~/$HOME}"
    INSTALL_DIR=$(realpath -m "$INSTALL_DIR" 2>/dev/null || echo "$INSTALL_DIR")
    
    echo ""
    print_info "Configuration summary:"
    echo "  • Installation directory: $INSTALL_DIR"
    echo "  • API port: $API_PORT"
    echo "  • Client port: $CLIENT_PORT"
    echo ""
    
    if [ "$INTERACTIVE" = true ]; then
        echo -ne "${WHITE}Proceed with installation? (y/n)${NC} ${CYAN}[y]${NC}: "
        read -r proceed
        if [ "$proceed" != "y" ] && [ "$proceed" != "Y" ] && [ -n "$proceed" ]; then
            print_warning "Installation cancelled by user"
            exit 0
        fi
    fi
    
    echo ""
}

setup_directories() {
    print_header "Setting Up Directories"
    
    print_step "Creating installation directory: $INSTALL_DIR"
    mkdir -p "$INSTALL_DIR"
    cd "$INSTALL_DIR"
    print_success "Directory created: $INSTALL_DIR"
    
    echo ""
}

clone_or_update_repos() {
    print_header "Setting Up Repositories"
    
    # API Repository
    print_step "Setting up AI-Agent-Framework API..."
    if [ -d "AI-Agent-Framework/.git" ]; then
        print_info "API repository already exists, updating..."
        cd AI-Agent-Framework
        git pull origin main || git pull origin master || print_warning "Could not update API repo"
        cd ..
        print_success "API repository updated"
    else
        print_info "Cloning API repository..."
        git clone "$API_REPO" AI-Agent-Framework
        print_success "API repository cloned"
    fi
    
    echo ""
    
    # Client Repository
    print_step "Setting up AI-Agent-Framework-Client..."
    if [ -d "AI-Agent-Framework-Client/.git" ]; then
        print_info "Client repository already exists, updating..."
        cd AI-Agent-Framework-Client
        git pull origin main || git pull origin master || print_warning "Could not update Client repo"
        cd ..
        print_success "Client repository updated"
    else
        print_info "Cloning Client repository..."
        git clone "$CLIENT_REPO" AI-Agent-Framework-Client
        print_success "Client repository cloned"
    fi
    
    echo ""
}

create_environment_files() {
    print_header "Creating Environment Configuration"
    
    # API .env file
    print_step "Creating API environment file..."
    cat > AI-Agent-Framework/.env << EOF
# AI Agent Framework API - Production Environment
PROJECT_DOCS_PATH=./projectDocs
LLM_CONFIG_PATH=./config/llm.json
PORT=${API_PORT}
HOST=0.0.0.0
LOG_LEVEL=INFO
EOF
    print_success "API .env created"
    
    # Create API directories
    mkdir -p AI-Agent-Framework/projectDocs
    mkdir -p AI-Agent-Framework/config
    
    # Create LLM config
    if [ ! -f "AI-Agent-Framework/config/llm.json" ]; then
        print_step "Creating LLM configuration..."
        cat > AI-Agent-Framework/config/llm.json << EOF
{
  "provider": "lm-studio",
  "api_url": "http://localhost:1234/v1",
  "model": "local-model",
  "temperature": 0.7,
  "max_tokens": 2000
}
EOF
        print_success "LLM config created"
    else
        print_info "LLM config already exists, skipping"
    fi
    
    # Client .env file
    print_step "Creating Client environment file..."
    cat > AI-Agent-Framework-Client/client/.env << EOF
# AI Agent Framework Client - Production Environment
VITE_API_BASE_URL=http://ai-agent-api:${API_PORT}/api
VITE_API_KEY=
VITE_HEALTH_CHECK_INTERVAL=30000
EOF
    print_success "Client .env created"
    
    # Root .env file for docker-compose
    print_step "Creating root environment file..."
    cat > .env << EOF
# Production Environment Configuration
API_PORT=${API_PORT}
CLIENT_PORT=${CLIENT_PORT}
VITE_API_BASE_URL=http://ai-agent-api:${API_PORT}/api
LOG_LEVEL=INFO
DOCKER_NETWORK=ai-agent-network
API_CONTAINER_NAME=ai-agent-api
CLIENT_CONTAINER_NAME=ai-agent-client
EOF
    print_success "Root .env created"
    
    echo ""
}

create_docker_compose() {
    print_header "Creating Docker Compose Configuration"
    
    print_step "Copying production docker-compose.yml..."
    
    if [ -f "AI-Agent-Framework-Client/docker-compose.production.yml" ]; then
        cp AI-Agent-Framework-Client/docker-compose.production.yml docker-compose.yml
        print_success "Docker compose file created"
    else
        print_warning "docker-compose.production.yml not found in client repo"
        print_info "Creating basic docker-compose.yml..."
        
        cat > docker-compose.yml << 'EOF'
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
      - "${API_PORT:-8000}:8000"
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
      - "${CLIENT_PORT:-3000}:80"
    depends_on:
      ai-agent-api:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:80/"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped
    networks:
      - ai-agent-network

networks:
  ai-agent-network:
    driver: bridge
EOF
        print_success "Docker compose file created"
    fi
    
    echo ""
}

build_and_start_services() {
    print_header "Building and Starting Services"
    
    print_step "Building Docker images (this may take several minutes)..."
    echo ""
    
    if docker compose build; then
        print_success "Docker images built successfully"
    else
        print_error "Failed to build Docker images"
        return 1
    fi
    
    echo ""
    print_step "Starting services..."
    echo ""
    
    if docker compose up -d; then
        print_success "Services started successfully"
    else
        print_error "Failed to start services"
        return 1
    fi
    
    echo ""
    print_info "Waiting for services to become healthy (this may take up to 60 seconds)..."
    
    # Wait for services to be healthy
    local max_wait=60
    local waited=0
    while [ $waited -lt $max_wait ]; do
        api_health=$(docker inspect --format='{{.State.Health.Status}}' ai-agent-api 2>/dev/null || echo "starting")
        
        if [ "$api_health" = "healthy" ]; then
            print_success "Services are healthy and ready"
            break
        fi
        
        echo -ne "\r${CYAN}ℹ${NC} Waiting for services... ${waited}s / ${max_wait}s"
        sleep 5
        waited=$((waited + 5))
    done
    echo ""
    
    echo ""
}

validate_deployment() {
    if [ "$SKIP_VALIDATION" = "true" ]; then
        print_info "Skipping validation (--skip-validation flag set)"
        return 0
    fi
    
    print_header "Validating Deployment"
    
    if [ -f "AI-Agent-Framework-Client/scripts/validate-setup.sh" ]; then
        print_step "Running validation script..."
        echo ""
        
        cd AI-Agent-Framework-Client
        export API_URL="http://localhost:${API_PORT}"
        export CLIENT_URL="http://localhost:${CLIENT_PORT}"
        
        if bash scripts/validate-setup.sh; then
            cd ..
            return 0
        else
            cd ..
            print_warning "Some validation checks failed, but services may still be working"
            return 0
        fi
    else
        print_info "Validation script not found, performing basic checks..."
        
        if command -v curl &> /dev/null; then
            # Check API
            if curl -s -f "http://localhost:${API_PORT}/health" &> /dev/null; then
                print_success "API is responding"
            else
                print_warning "API is not responding yet"
            fi
            
            # Check Client
            if curl -s -f "http://localhost:${CLIENT_PORT}" &> /dev/null; then
                print_success "Client is responding"
            else
                print_warning "Client is not responding yet"
            fi
        else
            print_info "curl not available for validation"
        fi
    fi
    
    echo ""
}

print_summary() {
    print_header "Setup Complete!"
    
    echo -e "${GREEN}${BOLD}✓ AI Agent Framework is now running!${NC}\n"
    
    echo -e "${WHITE}Access your services:${NC}"
    echo -e "  ${CYAN}• Client (Web UI):${NC}     http://localhost:${CLIENT_PORT}"
    echo -e "  ${CYAN}• API:${NC}                 http://localhost:${API_PORT}"
    echo -e "  ${CYAN}• API Documentation:${NC}   http://localhost:${API_PORT}/docs"
    echo -e "  ${CYAN}• Health Check:${NC}        http://localhost:${API_PORT}/health"
    echo ""
    
    echo -e "${WHITE}Useful commands:${NC}"
    echo -e "  ${CYAN}• View logs:${NC}           docker compose logs -f"
    echo -e "  ${CYAN}• Stop services:${NC}       docker compose down"
    echo -e "  ${CYAN}• Restart services:${NC}    docker compose restart"
    echo -e "  ${CYAN}• View status:${NC}         docker compose ps"
    echo ""
    
    echo -e "${WHITE}Configuration files:${NC}"
    echo -e "  ${CYAN}• Installation dir:${NC}    $INSTALL_DIR"
    echo -e "  ${CYAN}• API config:${NC}          $INSTALL_DIR/AI-Agent-Framework/.env"
    echo -e "  ${CYAN}• Client config:${NC}       $INSTALL_DIR/AI-Agent-Framework-Client/client/.env"
    echo -e "  ${CYAN}• Docker Compose:${NC}      $INSTALL_DIR/docker-compose.yml"
    echo ""
    
    echo -e "${WHITE}Next steps:${NC}"
    echo -e "  1. Open ${CYAN}http://localhost:${CLIENT_PORT}${NC} in your browser"
    echo -e "  2. Configure your LLM provider in ${CYAN}AI-Agent-Framework/config/llm.json${NC}"
    echo -e "  3. Read the documentation in ${CYAN}AI-Agent-Framework-Client/docs/${NC}"
    echo ""
    
    echo -e "${WHITE}Documentation:${NC}"
    echo -e "  ${CYAN}• Quick Start:${NC}         AI-Agent-Framework-Client/QUICKSTART.md"
    echo -e "  ${CYAN}• Development:${NC}         AI-Agent-Framework-Client/docs/DEVELOPMENT.md"
    echo -e "  ${CYAN}• Testing:${NC}             AI-Agent-Framework-Client/docs/TESTING.md"
    echo -e "  ${CYAN}• Production:${NC}          AI-Agent-Framework-Client/docs/PRODUCTION.md"
    echo ""
}

show_help() {
    echo "AI Agent Framework - Production Setup Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --non-interactive      Skip interactive prompts (use defaults/env vars)"
    echo "  --install-dir PATH     Installation directory (default: ./ai-agent-stack)"
    echo "  --api-port PORT        API port (default: 8000)"
    echo "  --client-port PORT     Client port (default: 3000)"
    echo "  --skip-validation      Skip post-setup validation"
    echo "  --help                 Show this help message"
    echo ""
    echo "Environment Variables (for non-interactive mode):"
    echo "  INSTALL_DIR            Installation directory"
    echo "  API_PORT               API port"
    echo "  CLIENT_PORT            Client port"
    echo "  SKIP_VALIDATION        Skip validation (true/false)"
    echo ""
    echo "Examples:"
    echo "  # Interactive mode (recommended)"
    echo "  $0"
    echo ""
    echo "  # Non-interactive mode with custom settings"
    echo "  $0 --non-interactive --install-dir /opt/ai-agent --api-port 9000 --client-port 8080"
    echo ""
    echo "  # Using environment variables"
    echo "  INSTALL_DIR=/opt/ai-agent API_PORT=9000 $0 --non-interactive"
    echo ""
}

# ==============================================================================
# Parse Arguments
# ==============================================================================

while [[ $# -gt 0 ]]; do
    case $1 in
        --non-interactive)
            INTERACTIVE=false
            shift
            ;;
        --install-dir)
            INSTALL_DIR="$2"
            shift 2
            ;;
        --api-port)
            API_PORT="$2"
            shift 2
            ;;
        --client-port)
            CLIENT_PORT="$2"
            shift 2
            ;;
        --skip-validation)
            SKIP_VALIDATION=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# ==============================================================================
# Main Execution
# ==============================================================================

print_banner

# Trap errors
trap 'echo -e "\n${RED}Setup failed!${NC} Check the errors above."; exit 1' ERR

# Run setup steps
check_prerequisites
gather_configuration
setup_directories
clone_or_update_repos
create_environment_files
create_docker_compose
build_and_start_services
validate_deployment
print_summary

echo -e "${GREEN}${BOLD}Happy coding! 🚀${NC}\n"

exit 0
