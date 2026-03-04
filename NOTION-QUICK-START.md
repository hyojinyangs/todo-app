# Notion Integration - Quick Start Guide

## 🚀 Run This Command

```bash
cd ~/todo-app/scripts
./setup-notion-integration.sh
```

---

## 📝 What You'll Need Ready

### Step 1: Notion Integration URL
**Open in browser:** https://www.notion.so/my-integrations

**Actions:**
1. Click **"+ New integration"**
2. Name: `Daily Trend Reporter`
3. Associated workspace: *(select yours)*
4. Click **"Submit"**
5. **Copy the API key** (starts with `secret_...`)

💡 Keep this tab open - you'll paste the key into Terminal

---

### Step 2: Create Database

**In Notion:**
1. Click **"+ New page"**
2. Name: `Daily Trend Reports`
3. Click **"Table"** to create database
4. Done! (That's it)

---

### Step 3: Connect Integration

**In your new database:**
1. Click **"•••"** (top right corner)
2. Scroll down to **"Add connections"**
3. Find and click **"Daily Trend Reporter"**
4. Click **"Confirm"**

✅ Integration now has access!

---

### Step 4: Get Database ID

**Look at your browser URL:**
```
https://www.notion.so/workspace-name/DATABASE_ID?v=view-id
                                    ↑ Copy this part ↑
```

The **DATABASE_ID** is the 32-character code between workspace name and `?v=`

**Example URL:**
```
https://www.notion.so/myworkspace/a1b2c3d4e5f6789012345678901234ab?v=xyz
```
**Database ID:** `a1b2c3d4e5f6789012345678901234ab`

💡 It's exactly 32 characters (letters and numbers)

---

## ⚡️ Quick Checklist

During setup, the wizard will ask you to:

- [ ] **Paste API Key** (starts with `secret_`)
- [ ] **Press ENTER** after creating database
- [ ] **Press ENTER** after connecting integration
- [ ] **Paste Database ID** (32 characters)
- [ ] **Confirm** automatic addition to daily reports

---

## ✅ Success Looks Like

When setup completes successfully, you'll see:

```
✅ Report created in Notion!
🔗 View at: https://notion.so/...

🎉 SUCCESS! Notion integration is working!

✅ Your daily trend reports will now be sent to Notion automatically
```

Then check your Notion database - you should see today's report!

---

## 🆘 Common Issues

### "Invalid API key format"
- Make sure you copied the **entire** key including `secret_`
- Don't include any spaces before or after

### "Invalid Database ID"
- Must be **exactly 32 characters**
- Only letters and numbers (no dashes or other characters)
- From the URL, not the page name

### "Could not find database"
- Did you complete **Step 3** (Add connections)?
- Make sure you clicked "Confirm" after selecting the integration

---

## 🎯 After Setup

Your reports will automatically go to Notion every morning at 8:00 AM!

**Manual send anytime:**
```bash
cd ~/todo-app/scripts
./send-to-notion-api.sh
```

**Check automation:**
```bash
crontab -l | grep daily-trend
```

---

**Ready? Run the setup wizard now! 🚀**

```bash
cd ~/todo-app/scripts
./setup-notion-integration.sh
```
