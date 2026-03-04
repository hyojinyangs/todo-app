#!/bin/bash

# Send Daily Trend Report to Notion via Email
# Usage: ./send-to-notion-email.sh <notion-email-address>

NOTION_EMAIL="$1"
REPORT_FILE="/Users/hyojin.yang/todo-app/reports/daily-trends/latest.md"
DATE=$(date +%Y-%m-%d)

if [ -z "$NOTION_EMAIL" ]; then
    echo "❌ Error: Notion email address required"
    echo "Usage: ./send-to-notion-email.sh your-page@notion.so"
    echo ""
    echo "To get your Notion email:"
    echo "1. Open the Notion page where you want reports"
    echo "2. Click '...' menu → 'Email to this page'"
    echo "3. Copy the email address shown"
    exit 1
fi

if [ ! -f "$REPORT_FILE" ]; then
    echo "❌ Error: Report file not found at $REPORT_FILE"
    exit 1
fi

# Send via mail command (macOS)
if command -v mail &> /dev/null; then
    cat "$REPORT_FILE" | mail -s "Daily Trend Report - $DATE" "$NOTION_EMAIL"
    echo "✅ Report sent to Notion via email: $NOTION_EMAIL"
else
    echo "⚠️  mail command not available. Trying alternative method..."

    # Alternative: Use osascript to send via Mail app
    osascript <<EOF
tell application "Mail"
    set theMessage to make new outgoing message with properties {subject:"Daily Trend Report - $DATE", content:"$(cat "$REPORT_FILE")", visible:false}
    tell theMessage
        make new to recipient with properties {address:"$NOTION_EMAIL"}
        send
    end tell
end tell
EOF
    echo "✅ Report sent to Notion via Mail app"
fi
