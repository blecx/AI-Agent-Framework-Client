#!/bin/bash

# ==============================================================================
# AI Agent Framework - Setup Validation Script
# ==============================================================================
# This script validates that both the Client and API services are running
# correctly and can communicate with each other.
#
# Usage:
#   ./scripts/validate-setup.sh
#
# Exit codes:
#   0 - All checks passed
#   1 - One or more checks failed
# ==============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_URL="${API_URL:-http://localhost:8000}"
CLIENT_URL="${CLIENT_URL:-http://localhost:3000}"
TIMEOUT=5

# Track overall status
OVERALL_STATUS=0

# ==============================================================================
# Helper Functions
# ==============================================================================

print_header() {
    echo -e "\n${BLUE}================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
    OVERALL_STATUS=1
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
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

check_url() {
    local url=$1
    local name=$2
    local expected_status=${3:-200}
    
    if command -v curl &> /dev/null; then
        response=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" "$url" 2>/dev/null)
        if [ "$response" -eq "$expected_status" ]; then
            print_success "$name is accessible (HTTP $response)"
            return 0
        else
            print_error "$name returned HTTP $response (expected $expected_status)"
            return 1
        fi
    else
        print_warning "curl not available, skipping URL check for $name"
        return 0
    fi
}

check_json_response() {
    local url=$1
    local name=$2
    local expected_key=$3
    
    if command -v curl &> /dev/null; then
        response=$(curl -s --max-time "$TIMEOUT" "$url" 2>/dev/null)
        if echo "$response" | grep -q "$expected_key"; then
            print_success "$name returned valid JSON with '$expected_key'"
            print_info "Response: $response"
            return 0
        else
            print_error "$name did not return expected JSON"
            print_info "Response: $response"
            return 1
        fi
    else
        print_warning "curl not available, skipping JSON check for $name"
        return 0
    fi
}

check_docker_container() {
    local container_name=$1
    
    if command -v docker &> /dev/null; then
        if docker ps --format '{{.Names}}' | grep -q "^${container_name}$"; then
            status=$(docker inspect --format='{{.State.Status}}' "$container_name" 2>/dev/null)
            health=$(docker inspect --format='{{.State.Health.Status}}' "$container_name" 2>/dev/null)
            
            if [ "$status" = "running" ]; then
                if [ "$health" = "healthy" ] || [ "$health" = "" ]; then
                    print_success "Container $container_name is running and healthy"
                    return 0
                else
                    print_warning "Container $container_name is running but health status: $health"
                    return 0
                fi
            else
                print_error "Container $container_name is not running (status: $status)"
                return 1
            fi
        else
            print_error "Container $container_name not found"
            return 1
        fi
    else
        print_warning "Docker not available, skipping container check"
        return 0
    fi
}

# ==============================================================================
# Main Validation
# ==============================================================================

print_header "AI Agent Framework - Setup Validation"

echo -e "${BLUE}Validating installation and configuration...${NC}\n"

# Check prerequisites
print_header "1. Prerequisites Check"

check_command "docker"
check_command "curl"
check_command "git"

# Check Docker Compose
if docker compose version &> /dev/null; then
    print_success "docker compose is available"
elif command -v docker-compose &> /dev/null; then
    print_success "docker-compose is available"
else
    print_warning "docker compose not found (optional)"
fi

# Check Docker containers
print_header "2. Docker Containers Check"

if command -v docker &> /dev/null; then
    check_docker_container "ai-agent-api"
    check_docker_container "ai-agent-client"
    
    # Check network
    if docker network ls | grep -q "ai-agent-network"; then
        print_success "Docker network ai-agent-network exists"
    else
        print_warning "Docker network ai-agent-network not found"
    fi
else
    print_info "Skipping Docker container checks (Docker not available)"
fi

# Check API service
print_header "3. API Service Check"

print_info "Testing API at $API_URL"

# Health check
check_url "$API_URL/health" "API Health Endpoint"
check_json_response "$API_URL/health" "API Health Response" "status"

# Info endpoint
check_url "$API_URL/info" "API Info Endpoint"

# Agents endpoint
check_url "$API_URL/api/agents" "API Agents Endpoint"

# Check API docs (Swagger)
check_url "$API_URL/docs" "API Documentation" 200

# Check Client service
print_header "4. Client Service Check"

print_info "Testing Client at $CLIENT_URL"

check_url "$CLIENT_URL" "Client Homepage"

# Check if client can reach API (if both are accessible)
print_header "5. Integration Check"

if curl -s --max-time "$TIMEOUT" "$CLIENT_URL" &> /dev/null && curl -s --max-time "$TIMEOUT" "$API_URL/health" &> /dev/null; then
    print_success "Both Client and API are accessible"
    print_info "Integration should work correctly"
else
    print_warning "Could not verify integration (one or both services not accessible)"
fi

# Check environment configuration
print_header "6. Configuration Check"

# Check if .env files exist
if [ -f "client/.env" ]; then
    print_success "Client .env file exists"
    if grep -q "VITE_API_BASE_URL" client/.env; then
        api_url=$(grep "VITE_API_BASE_URL" client/.env | cut -d '=' -f 2-)
        print_info "Client API URL: $api_url"
    fi
else
    print_warning "Client .env file not found (will use defaults)"
fi

if [ -f ".env" ]; then
    print_success "Root .env file exists"
else
    print_warning "Root .env file not found (optional)"
fi

# Check ports
print_header "7. Port Availability Check"

if command -v lsof &> /dev/null; then
    if lsof -i :3000 &> /dev/null; then
        print_success "Port 3000 is in use (Client)"
    else
        print_warning "Port 3000 is not in use (Client may not be running)"
    fi
    
    if lsof -i :8000 &> /dev/null; then
        print_success "Port 8000 is in use (API)"
    else
        print_warning "Port 8000 is not in use (API may not be running)"
    fi
elif command -v netstat &> /dev/null; then
    if netstat -tuln | grep -q ":3000 "; then
        print_success "Port 3000 is in use (Client)"
    else
        print_warning "Port 3000 is not in use (Client may not be running)"
    fi
    
    if netstat -tuln | grep -q ":8000 "; then
        print_success "Port 8000 is in use (API)"
    else
        print_warning "Port 8000 is not in use (API may not be running)"
    fi
else
    print_info "Cannot check port status (lsof and netstat not available)"
fi

# ==============================================================================
# Summary
# ==============================================================================

print_header "Validation Summary"

if [ $OVERALL_STATUS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}\n"
    echo -e "Your AI Agent Framework installation is working correctly.\n"
    echo -e "Access the services at:"
    echo -e "  • Client: ${BLUE}$CLIENT_URL${NC}"
    echo -e "  • API: ${BLUE}$API_URL${NC}"
    echo -e "  • API Docs: ${BLUE}$API_URL/docs${NC}"
    echo -e ""
else
    echo -e "${RED}✗ Some checks failed${NC}\n"
    echo -e "Please review the errors above and take corrective action.\n"
    echo -e "Common issues:"
    echo -e "  • Services not running: Run 'docker compose up -d'"
    echo -e "  • Port conflicts: Check if ports 3000 and 8000 are available"
    echo -e "  • Network issues: Verify Docker network configuration"
    echo -e ""
    echo -e "For help, see:"
    echo -e "  • Development Guide: docs/DEVELOPMENT.md"
    echo -e "  • Troubleshooting: docs/PRODUCTION.md#troubleshooting"
    echo -e ""
fi

exit $OVERALL_STATUS
