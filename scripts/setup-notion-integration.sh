#!/bin/bash

# Interactive Notion API Setup Wizard
# This script guides you through setting up Notion integration

echo "🎯 Notion API Integration Setup Wizard"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "⚠️  Node.js is required but not installed."
    echo "Install it with: brew install node"
    echo ""
    read -p "Would you like me to install Node.js via Homebrew? (y/N): " INSTALL_NODE
    if [[ "$INSTALL_NODE" =~ ^[Yy]$ ]]; then
        brew install node
    else
        echo "Please install Node.js and run this script again."
        exit 1
    fi
fi

echo "✅ Node.js is installed ($(node --version))"
echo ""

# Step 1: Create Integration
echo "📋 Step 1: Create Notion Integration"
echo "─────────────────────────────────────"
echo ""
echo "1. Open this URL in your browser:"
echo "   👉 https://www.notion.so/my-integrations"
echo ""
echo "2. Click '+ New integration'"
echo "3. Name it: Daily Trend Reporter"
echo "4. Select your workspace"
echo "5. Click 'Submit'"
echo "6. Copy the 'Internal Integration Token' (starts with secret_)"
echo ""
read -p "Press ENTER when you've copied the API key..."
echo ""

read -sp "Paste your Notion API Key (starts with secret_): " NOTION_API_KEY
echo ""

# Validate API key format
if [[ ! "$NOTION_API_KEY" =~ ^secret_ ]]; then
    echo "❌ Invalid API key format. It should start with 'secret_'"
    exit 1
fi

echo "✅ API Key received"
echo ""

# Step 2: Create Database
echo "📋 Step 2: Create or Prepare Database"
echo "──────────────────────────────────────"
echo ""
echo "Do you already have a Notion database for trend reports?"
echo ""
read -p "Use existing database? (y/N): " USE_EXISTING

if [[ ! "$USE_EXISTING" =~ ^[Yy]$ ]]; then
    echo ""
    echo "Creating a new database in Notion:"
    echo "1. Open Notion"
    echo "2. Click '+ New page'"
    echo "3. Name it: 'Daily Trend Reports'"
    echo "4. Click 'Table' to create a database"
    echo "5. Optional: Add a 'Date' property (Type: Date)"
    echo ""
    read -p "Press ENTER when you've created the database..."
fi

echo ""

# Step 3: Connect Integration
echo "📋 Step 3: Connect Integration to Database"
echo "───────────────────────────────────────────"
echo ""
echo "1. Open your database in Notion"
echo "2. Click the '•••' menu (top right)"
echo "3. Scroll to 'Add connections'"
echo "4. Select 'Daily Trend Reporter'"
echo "5. Click 'Confirm'"
echo ""
read -p "Press ENTER when you've connected the integration..."
echo ""

# Step 4: Get Database ID
echo "📋 Step 4: Get Database ID"
echo "──────────────────────────"
echo ""
echo "1. Open your database in Notion"
echo "2. Look at the URL in your browser:"
echo "   https://www.notion.so/workspace/DATABASE_ID?v=..."
echo ""
echo "3. Copy the 32-character DATABASE_ID"
echo "   (between workspace name and ?v=)"
echo ""
read -p "Paste your Database ID (32 characters): " NOTION_DATABASE_ID
echo ""

# Validate database ID format (32 characters, alphanumeric)
if [[ ! "$NOTION_DATABASE_ID" =~ ^[a-zA-Z0-9]{32}$ ]]; then
    echo "❌ Invalid Database ID format. It should be exactly 32 alphanumeric characters"
    echo "Your input: $NOTION_DATABASE_ID (${#NOTION_DATABASE_ID} characters)"
    exit 1
fi

echo "✅ Database ID received"
echo ""

# Save to environment
echo "📋 Step 5: Saving Configuration"
echo "────────────────────────────────"
echo ""

# Determine which shell config file to use
if [ -f ~/.zshrc ]; then
    SHELL_CONFIG=~/.zshrc
elif [ -f ~/.bash_profile ]; then
    SHELL_CONFIG=~/.bash_profile
else
    SHELL_CONFIG=~/.bashrc
fi

echo "Adding environment variables to $SHELL_CONFIG"

# Backup existing config
cp "$SHELL_CONFIG" "${SHELL_CONFIG}.backup-$(date +%Y%m%d-%H%M%S)"

# Check if already exists
if grep -q "NOTION_API_KEY" "$SHELL_CONFIG"; then
    echo "⚠️  NOTION_API_KEY already exists in $SHELL_CONFIG"
    read -p "Replace it? (y/N): " REPLACE
    if [[ "$REPLACE" =~ ^[Yy]$ ]]; then
        # Remove old entries
        sed -i '' '/NOTION_API_KEY/d' "$SHELL_CONFIG"
        sed -i '' '/NOTION_DATABASE_ID/d' "$SHELL_CONFIG"
    else
        echo "Keeping existing configuration"
        exit 0
    fi
fi

# Add new entries
echo "" >> "$SHELL_CONFIG"
echo "# Notion API Integration for Daily Trend Reports" >> "$SHELL_CONFIG"
echo "export NOTION_API_KEY=\"$NOTION_API_KEY\"" >> "$SHELL_CONFIG"
echo "export NOTION_DATABASE_ID=\"$NOTION_DATABASE_ID\"" >> "$SHELL_CONFIG"

# Load in current session
export NOTION_API_KEY="$NOTION_API_KEY"
export NOTION_DATABASE_ID="$NOTION_DATABASE_ID"

echo "✅ Configuration saved to $SHELL_CONFIG"
echo ""

# Test the integration
echo "📋 Step 6: Testing Integration"
echo "───────────────────────────────"
echo ""
echo "Testing connection to Notion..."

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

if [ -f "$SCRIPT_DIR/notion-helper.cjs" ]; then
    REPORT_FILE="/Users/hyojin.yang/todo-app/reports/daily-trends/latest.md"

    if [ -f "$REPORT_FILE" ]; then
        node "$SCRIPT_DIR/notion-helper.cjs" "$REPORT_FILE"

        if [ $? -eq 0 ]; then
            echo ""
            echo "🎉 SUCCESS! Notion integration is working!"
            echo ""
            echo "✅ Your daily trend reports will now be sent to Notion automatically"
            echo ""

            # Add to automation
            read -p "Add to daily automation? (Y/n): " ADD_AUTO
            if [[ ! "$ADD_AUTO" =~ ^[Nn]$ ]]; then
                DAILY_SCRIPT="$SCRIPT_DIR/daily-trend-report.sh"

                if ! grep -q "notion-helper.cjs" "$DAILY_SCRIPT"; then
                    # Add before the final exit
                    sed -i '' "/^exit 0$/i\\
# Send to Notion\\
if [ -f \"\$SCRIPT_DIR/notion-helper.cjs\" ]; then\\
    node \"\$SCRIPT_DIR/notion-helper.cjs\" \"\$REPORT_FILE\" >> \"\$LOG_FILE\" 2>&1\\
fi\\
" "$DAILY_SCRIPT"
                    echo "✅ Added to daily automation script"
                else
                    echo "ℹ️  Already added to automation script"
                fi
            fi

            echo ""
            echo "📚 What's Next:"
            echo "• Check your Notion database for the test report"
            echo "• Tomorrow at 8:00 AM, a new report will be created automatically"
            echo "• To send manually: cd ~/todo-app/scripts && ./send-to-notion-api.sh"
            echo ""
        else
            echo ""
            echo "❌ Test failed. Please check the error messages above."
            echo ""
            echo "Common issues:"
            echo "• Make sure you connected the integration to your database (Step 3)"
            echo "• Verify your database has a 'Name' property (Title type)"
            echo "• Check that your Database ID is correct (32 characters)"
            exit 1
        fi
    else
        echo "⚠️  No report file found. Generate one first:"
        echo "   cd ~/todo-app/scripts && ./daily-trend-report.sh"
    fi
else
    echo "❌ notion-helper.cjs not found"
    exit 1
fi

echo "Setup complete! 🚀"
