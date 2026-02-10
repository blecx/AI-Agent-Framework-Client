#!/bin/bash
# Create GitHub issues from JSON definition file
# Usage: ./create_github_issues.sh <OWNER/REPO> <issues.json>

set -euo pipefail

REPO="${1:-}"
ISSUES_FILE="${2:-}"

if [[ -z "$REPO" ]] || [[ -z "$ISSUES_FILE" ]]; then
  echo "Usage: $0 <OWNER/REPO> <issues.json>"
  echo "Example: $0 blecx/AI-Agent-Framework-Client tools/issues/issues-client.json"
  exit 1
fi

if [[ ! -f "$ISSUES_FILE" ]]; then
  echo "Error: Issues file not found: $ISSUES_FILE"
  exit 1
fi

# Check if gh CLI is authenticated
if ! gh auth status >/dev/null 2>&1; then
  echo "Error: GitHub CLI not authenticated. Run 'gh auth login' first."
  exit 1
fi

echo "Creating issues for repository: $REPO"
echo "From file: $ISSUES_FILE"
echo ""

# Read and parse JSON, create each issue
jq -c '.issues[]' "$ISSUES_FILE" | while read -r issue; do
  TITLE=$(echo "$issue" | jq -r '.title')
  BODY=$(echo "$issue" | jq -r '.body')
  LABELS=$(echo "$issue" | jq -r '.labels | join(",")')
  ASSIGNEES=$(echo "$issue" | jq -r '.assignees // [] | join(",")')
  MILESTONE=$(echo "$issue" | jq -r '.milestone // empty')
  
  echo "Creating issue: $TITLE"
  
  # Build gh issue create command array
  CMD_ARGS=("gh" "issue" "create" "--repo" "$REPO" "--title" "$TITLE" "--body" "$BODY")
  
  if [[ -n "$LABELS" ]] && [[ "$LABELS" != "null" ]]; then
    CMD_ARGS+=("--label" "$LABELS")
  fi
  
  if [[ -n "$ASSIGNEES" ]] && [[ "$ASSIGNEES" != "null" ]] && [[ "$ASSIGNEES" != "" ]]; then
    CMD_ARGS+=("--assignee" "$ASSIGNEES")
  fi
  
  if [[ -n "$MILESTONE" ]] && [[ "$MILESTONE" != "null" ]]; then
    CMD_ARGS+=("--milestone" "$MILESTONE")
  fi
  
  # Execute command
  ISSUE_URL=$("${CMD_ARGS[@]}")
  echo "  ✓ Created: $ISSUE_URL"
  echo ""
  
  # Rate limit protection
  sleep 1
done

echo "✓ All issues created successfully!"
