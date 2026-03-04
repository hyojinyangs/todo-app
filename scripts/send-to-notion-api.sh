#!/bin/bash

# Send Daily Trend Report to Notion via API
# Requires: NOTION_API_KEY and NOTION_DATABASE_ID environment variables

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPORT_FILE="/Users/hyojin.yang/todo-app/reports/daily-trends/latest.md"

# Check for required environment variables
if [ -z "$NOTION_API_KEY" ] || [ -z "$NOTION_DATABASE_ID" ]; then
    echo "❌ Error: Notion integration not configured"
    echo ""
    echo "Run the setup wizard to configure:"
    echo "  cd ~/todo-app/scripts"
    echo "  ./setup-notion-integration.sh"
    exit 1
fi

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js not installed"
    echo "Install with: brew install node"
    exit 1
fi

if [ ! -f "$REPORT_FILE" ]; then
    echo "❌ Error: Report file not found at $REPORT_FILE"
    exit 1
fi

if [ ! -f "$SCRIPT_DIR/notion-helper-complete.cjs" ]; then
    echo "❌ Error: notion-helper-complete.cjs not found"
    exit 1
fi

# Use Node.js helper to send complete report to Notion (no truncation)
node "$SCRIPT_DIR/notion-helper-complete.cjs" "$REPORT_FILE"
