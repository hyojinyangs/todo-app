#!/bin/bash

# Setup script for daily trend report automation
# This script configures a cron job to run the daily trend report every morning

echo "🔧 Setting up daily trend report automation..."
echo ""

# Configuration
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPORT_SCRIPT="$SCRIPT_DIR/daily-trend-report.sh"

# Make the report script executable
chmod +x "$REPORT_SCRIPT"
echo "✅ Made report script executable"

# Ask user for preferred time
echo ""
echo "When would you like to receive your daily trend report?"
read -p "Enter hour (0-23, default is 8 for 8 AM): " HOUR
HOUR=${HOUR:-8}

read -p "Enter minute (0-59, default is 0): " MINUTE
MINUTE=${MINUTE:-0}

# Validate inputs
if ! [[ "$HOUR" =~ ^[0-9]+$ ]] || [ "$HOUR" -lt 0 ] || [ "$HOUR" -gt 23 ]; then
    echo "❌ Invalid hour. Using default (8 AM)"
    HOUR=8
fi

if ! [[ "$MINUTE" =~ ^[0-9]+$ ]] || [ "$MINUTE" -lt 0 ] || [ "$MINUTE" -gt 59 ]; then
    echo "❌ Invalid minute. Using default (0)"
    MINUTE=0
fi

# Create cron job entry
CRON_ENTRY="$MINUTE $HOUR * * * $REPORT_SCRIPT"

# Check if cron job already exists
EXISTING_CRON=$(crontab -l 2>/dev/null | grep -F "$REPORT_SCRIPT")

if [ -n "$EXISTING_CRON" ]; then
    echo ""
    echo "⚠️  A cron job for this script already exists:"
    echo "$EXISTING_CRON"
    echo ""
    read -p "Do you want to replace it? (y/N): " REPLACE
    if [[ ! "$REPLACE" =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
    # Remove existing entry
    (crontab -l 2>/dev/null | grep -v -F "$REPORT_SCRIPT") | crontab -
    echo "✅ Removed existing cron job"
fi

# Add new cron job
(crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -

echo ""
echo "✅ Daily trend report automation configured!"
echo ""
echo "📅 Schedule: Every day at $(printf "%02d:%02d" $HOUR $MINUTE)"
echo "📄 Reports will be saved to: $HOME/todo-app/reports/daily-trends/"
echo "🔗 Latest report link: $HOME/todo-app/reports/daily-trends/latest.md"
echo ""
echo "To view your cron jobs: crontab -l"
echo "To edit your cron jobs: crontab -e"
echo "To remove this automation: crontab -l | grep -v 'daily-trend-report.sh' | crontab -"
echo ""
echo "🎉 Setup complete! Your first report will be generated at $(printf "%02d:%02d" $HOUR $MINUTE)."
echo ""

# Optional: Run once now for testing
read -p "Would you like to generate a test report now? (y/N): " TEST_RUN
if [[ "$TEST_RUN" =~ ^[Yy]$ ]]; then
    echo ""
    echo "Generating test report..."
    "$REPORT_SCRIPT"
    echo ""
    echo "Test report generated! Check: $HOME/todo-app/reports/daily-trends/latest.md"
fi

exit 0
