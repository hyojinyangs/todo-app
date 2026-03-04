#!/bin/bash

# Daily UX & AI Trend Report Generator
# This script automatically generates a daily trend report using the daily-trend-researcher agent

# Configuration
REPORT_DIR="$HOME/todo-app/reports/daily-trends"
DATE=$(date +%Y-%m-%d)
REPORT_FILE="$REPORT_DIR/trend-report-$DATE.md"
LOG_FILE="$REPORT_DIR/logs/trend-report.log"

# Create directories if they don't exist
mkdir -p "$REPORT_DIR"
mkdir -p "$REPORT_DIR/logs"

# Log function
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "Starting daily trend report generation..."

# Check if Claude Code CLI is available
if ! command -v claude &> /dev/null; then
    log "ERROR: Claude Code CLI not found. Please install it first."
    exit 1
fi

# Generate the report using the daily-trend-researcher agent
log "Generating trend report for $DATE..."

# Create a temporary prompt file
PROMPT_FILE=$(mktemp)
cat > "$PROMPT_FILE" << 'EOF'
Generate today's comprehensive UX and AI trend report. Research the latest developments from the past 24-48 hours across:

1. UX Trends (design systems, interaction patterns, accessibility, research methods)
2. AI Trends (LLMs, generative AI, AI tools, AI ethics)
3. AI + UX Intersection (AI-enhanced UX, human-AI interaction)

Analyze the trends, extract key insights, and provide actionable recommendations organized by:
- Immediate actions (today)
- Short-term actions (this week)
- Strategic actions (this month)

Follow the structured report format defined in the agent instructions.
EOF

# Run the agent and save output
claude --agent daily-trend-researcher < "$PROMPT_FILE" > "$REPORT_FILE" 2>&1

# Check if report was generated successfully
if [ -f "$REPORT_FILE" ] && [ -s "$REPORT_FILE" ]; then
    log "✅ Report generated successfully: $REPORT_FILE"

    # Create a symlink to the latest report
    ln -sf "$REPORT_FILE" "$REPORT_DIR/latest.md"
    log "✅ Symlink created: $REPORT_DIR/latest.md"

    # Optional: Send notification (macOS)
    if command -v osascript &> /dev/null; then
        osascript -e "display notification \"Daily UX & AI trend report is ready!\" with title \"Trend Report Generated\" sound name \"Glass\""
    fi

    # Optional: Open the report automatically
    # Uncomment the next line if you want the report to open automatically
    # open "$REPORT_FILE"

else
    log "❌ ERROR: Report generation failed or file is empty"
    exit 1
fi

log "Daily trend report generation complete."

# Send to Notion
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
if [ -f "$SCRIPT_DIR/notion-helper-complete.cjs" ] && [ -n "$NOTION_API_KEY" ] && [ -n "$NOTION_DATABASE_ID" ]; then
    log "Sending complete report to Notion..."
    node "$SCRIPT_DIR/notion-helper-complete.cjs" "$REPORT_FILE" >> "$LOG_FILE" 2>&1
    if [ $? -eq 0 ]; then
        log "✅ Complete report sent to Notion successfully"
    else
        log "⚠️ Failed to send report to Notion (check logs)"
    fi
else
    log "ℹ️ Notion integration not configured, skipping"
fi

# Cleanup old reports (keep last 30 days)
log "Cleaning up old reports (keeping last 30 days)..."
find "$REPORT_DIR" -name "trend-report-*.md" -type f -mtime +30 -delete
find "$REPORT_DIR/logs" -name "*.log" -type f -mtime +30 -delete

log "Cleanup complete."
exit 0
