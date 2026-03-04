# Notion API Integration Setup Guide

## Step 1: Create Notion Integration (2 minutes)

1. Go to https://www.notion.so/my-integrations
2. Click **"+ New integration"**
3. Fill in the details:
   - **Name**: Daily Trend Reporter
   - **Associated workspace**: Select your workspace
   - **Type**: Internal integration
4. Click **"Submit"**
5. Copy the **"Internal Integration Token"** (starts with `secret_...`)
   - ⚠️ Keep this secret! Don't share it.

---

## Step 2: Create or Prepare Your Notion Database (2 minutes)

### Option A: Create a New Database

1. Open Notion
2. Click **"+ New page"**
3. Name it: **"Daily Trend Reports"**
4. Click **"Table"** to create a database
5. Add these properties (columns):
   - **Name** (Title) - already exists
   - **Date** (Date) - click "+", select "Date"
   - **Category** (Select) - optional: UX, AI, Both
   - **Impact** (Select) - optional: High, Medium, Low

### Option B: Use Existing Database

- Just note which database you want to use

---

## Step 3: Connect Integration to Database (1 minute)

1. Open your "Daily Trend Reports" database in Notion
2. Click the **"•••"** menu (top right)
3. Scroll down to **"Add connections"**
4. Find and select **"Daily Trend Reporter"**
5. Click **"Confirm"**

✅ Your integration now has access to this database!

---

## Step 4: Get Your Database ID (1 minute)

1. Open your database in Notion
2. Look at the URL in your browser:
   ```
   https://www.notion.so/workspace-name/DATABASE_ID?v=view-id
   ```
3. The **DATABASE_ID** is the 32-character code between your workspace name and `?v=`
   - Example: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
   - It's a mix of letters and numbers, exactly 32 characters

4. Copy this DATABASE_ID

---

## Step 5: Set Environment Variables (2 minutes)

Open Terminal and run these commands (replace with your actual values):

```bash
# Add to your shell configuration
echo 'export NOTION_API_KEY="secret_your_actual_key_here"' >> ~/.zshrc
echo 'export NOTION_DATABASE_ID="your_actual_database_id_here"' >> ~/.zshrc

# Reload configuration
source ~/.zshrc
```

**Verify it worked:**
```bash
echo $NOTION_API_KEY
echo $NOTION_DATABASE_ID
```

Both should print your values (not empty).

---

## Step 6: Test the Integration

```bash
cd ~/todo-app/scripts
./send-to-notion-api.sh
```

If successful, you'll see:
```
✅ Report created in Notion!
🔗 View at: https://notion.so/...
```

Check your Notion database - you should see a new entry!

---

## Step 7: Add to Daily Automation (Optional)

To automatically send reports to Notion every morning:

```bash
# Edit the daily report script
open ~/todo-app/scripts/daily-trend-report.sh
```

Add this line before the final `exit 0`:

```bash
# Send to Notion
/Users/hyojin.yang/todo-app/scripts/send-to-notion-api.sh >> "$LOG_FILE" 2>&1
```

---

## Troubleshooting

### "NOTION_API_KEY not set"
- Make sure you ran the `echo` commands above
- Run `source ~/.zshrc` to reload
- Try closing and reopening Terminal

### "Could not find database"
- Verify you connected the integration to your database (Step 3)
- Double-check your DATABASE_ID is exactly 32 characters

### "Unauthorized"
- Check your API key starts with `secret_`
- Verify you copied the entire key without spaces

### "Invalid request"
- Ensure your database has a "Name" property (Title type)
- Add a "Date" property (Date type) to the database

---

## What Gets Sent to Notion

Currently, the script creates a simple page with:
- Title: "Daily Trend Report - YYYY-MM-DD"
- Date: Today's date
- Link to the full report file

For full markdown content in Notion, we can enhance the script to convert all sections properly.

---

## Need Help?

Run the test script and share any error messages:
```bash
cd ~/todo-app/scripts
./send-to-notion-api.sh
```
