# Daily UX & AI Trend Reporter

Automated system for researching and reporting on daily UX and AI trends with actionable insights for your work.

## 📋 Overview

This system uses a specialized Claude Code agent to:
- ✅ Research the latest UX and AI trends every day
- ✅ Analyze emerging patterns and significant developments
- ✅ Extract key insights and practical implications
- ✅ Generate actionable recommendations for daily work
- ✅ Deliver structured morning briefings automatically

## 🚀 Quick Start

### Option 1: Automated Daily Reports (Recommended)

Set up automatic report generation every morning:

```bash
cd ~/todo-app/scripts
./setup-daily-trend-cron.sh
```

This will:
1. Configure a cron job to run daily at your preferred time (default: 8:00 AM)
2. Automatically generate reports in `~/todo-app/reports/daily-trends/`
3. Create a symlink to the latest report at `reports/daily-trends/latest.md`
4. Clean up reports older than 30 days

### Option 2: Manual Report Generation

Generate a report on-demand:

```bash
cd ~/todo-app/scripts
./daily-trend-report.sh
```

Or use Claude Code directly:

```bash
claude --agent daily-trend-researcher
```

Then prompt:
```
Generate today's comprehensive UX and AI trend report with actionable insights.
```

## 📁 File Structure

```
todo-app/
├── .claude/
│   └── agents/
│       └── daily-trend-researcher.md    # Agent configuration
├── scripts/
│   ├── daily-trend-report.sh            # Report generation script
│   └── setup-daily-trend-cron.sh        # Automation setup script
├── reports/
│   └── daily-trends/
│       ├── trend-report-YYYY-MM-DD.md   # Daily reports
│       ├── latest.md                    # Symlink to latest report
│       └── logs/
│           └── trend-report.log         # Execution logs
└── README-DAILY-TRENDS.md               # This file
```

## 📊 Report Structure

Each daily report includes:

### 📈 Core Sections
- **Executive Summary**: 2-3 sentence overview of the day's key trends
- **Top 3 Trends**: Detailed analysis with impact level and actionability
- **Additional Notable Developments**: Quick updates on other relevant topics
- **Action Items**: Prioritized by timeframe (today, this week, this month)

### 🛠️ Practical Sections
- **Tools & Resources**: New tools and resources worth exploring
- **Recommended Reading**: Curated articles with time estimates
- **Trend to Watch**: Early-stage developments to monitor
- **Learning Opportunity**: Daily skill-building exercise

### 📈 Meta Sections
- **Weekly Pattern**: Running analysis of recurring themes
- **Reflection Questions**: Discussion topics for teams

## 🎯 How to Use the Reports

### Morning Routine (5-10 minutes)
1. **Scan the Executive Summary** (30 seconds)
   - Get the high-level overview of today's key trends

2. **Review Top 3 Trends** (2-3 minutes)
   - Understand significant developments and their implications

3. **Check Action Items** (1-2 minutes)
   - Identify immediate actions for today
   - Note items for this week and month

4. **Explore Resources** (2-4 minutes)
   - Bookmark interesting tools and articles
   - Queue reading for commute/break time

### Weekly Review (15 minutes)
- Review the "Weekly Pattern" section from Friday's report
- Identify recurring themes worth deeper investigation
- Plan skill development based on emerging trends
- Share key insights with your team

### Monthly Planning (30 minutes)
- Aggregate strategic actions from all reports
- Identify trends that have grown in significance
- Plan major initiatives or process changes
- Review what you've learned and implemented

## ⚙️ Configuration

### Customize Report Timing

Edit the cron job:
```bash
crontab -e
```

Modify the schedule (format: `minute hour * * *`):
- `0 8 * * *` = 8:00 AM daily
- `30 7 * * *` = 7:30 AM daily
- `0 9 * * 1-5` = 9:00 AM weekdays only

### Customize Report Content

Edit the agent configuration:
```bash
open ~/.claude/agents/daily-trend-researcher.md
```

You can modify:
- Research sources and focus areas
- Report format and sections
- Action item categories
- Quality standards

### Enable Notifications

Uncomment the notification line in `scripts/daily-trend-report.sh`:

```bash
# Line 44-46
if command -v osascript &> /dev/null; then
    osascript -e "display notification \"Daily UX & AI trend report is ready!\" with title \"Trend Report Generated\" sound name \"Glass\""
fi
```

### Auto-Open Reports

Uncomment the auto-open line in `scripts/daily-trend-report.sh`:

```bash
# Line 50
open "$REPORT_FILE"
```

## 🔍 Troubleshooting

### Reports Not Generating

Check cron job status:
```bash
crontab -l
```

Check execution logs:
```bash
tail -f ~/todo-app/reports/daily-trends/logs/trend-report.log
```

### Claude Code CLI Not Found

Ensure Claude Code is installed and in your PATH:
```bash
which claude
```

If not found, reinstall or add to PATH in your `~/.zshrc` or `~/.bash_profile`:
```bash
export PATH="/path/to/claude:$PATH"
```

### Permission Errors

Make scripts executable:
```bash
chmod +x ~/todo-app/scripts/*.sh
```

### Cron Environment Issues

Cron jobs run with minimal environment. If issues occur, add full paths to the script:
```bash
PATH=/usr/local/bin:/usr/bin:/bin
HOME=/Users/yourusername
```

## 📚 Advanced Usage

### Integration with Notion/Obsidian

Add to the end of `daily-trend-report.sh`:

```bash
# Copy to Notion/Obsidian vault
cp "$REPORT_FILE" "$HOME/Documents/Obsidian/Daily Notes/Trends-$DATE.md"
```

### Slack/Email Notifications

Install `jq` and `curl`, then add:

```bash
# Send to Slack
curl -X POST -H 'Content-type: application/json' \
  --data "{\"text\":\"Daily UX & AI Trend Report is ready: file://$REPORT_FILE\"}" \
  YOUR_SLACK_WEBHOOK_URL
```

### Custom Filters by Role

Modify the agent prompt in `daily-trend-report.sh` to include your role:

```bash
cat > "$PROMPT_FILE" << 'EOF'
Generate today's UX and AI trend report.
My role: [Product Designer / UX Researcher / Frontend Developer / Product Manager]
Focus on trends and actions most relevant to my role.
EOF
```

### Weekly Summary Reports

Create `scripts/weekly-trend-summary.sh`:

```bash
#!/bin/bash
# Generate a weekly summary from daily reports
REPORT_DIR="$HOME/todo-app/reports/daily-trends"
WEEK_START=$(date -v-7d +%Y-%m-%d)
WEEK_END=$(date +%Y-%m-%d)

find "$REPORT_DIR" -name "trend-report-*.md" -newermt "$WEEK_START" | \
  xargs cat > "$REPORT_DIR/weekly-summary-$WEEK_END.md"
```

## 🎓 Learning Path

### Week 1: Familiarization
- Read daily reports
- Try at least one immediate action per day
- Note which insights are most valuable to you

### Week 2: Integration
- Implement 2-3 short-term actions from the week
- Share insights with your team
- Customize the agent based on your needs

### Week 3: Experimentation
- Explore new tools mentioned in reports
- Conduct learning exercises
- Start a trend journal to track predictions

### Week 4: Optimization
- Review which trends proved most impactful
- Adjust report configuration
- Develop your own trend analysis skills

## 🤝 Contributing

This is your personal trend research system. Customize it to fit your workflow:

1. **Feedback Loop**: Note which sections are most valuable
2. **Source Expansion**: Add new research sources to the agent
3. **Format Refinement**: Adjust report structure to your needs
4. **Action Tracking**: Build a system to track implemented actions

## 📞 Support

For issues with:
- **Agent behavior**: Modify `.claude/agents/daily-trend-researcher.md`
- **Script execution**: Check logs in `reports/daily-trends/logs/`
- **Claude Code**: Visit https://github.com/anthropics/claude-code

## 🎯 Goals

This system helps you:
- ✅ Stay current with rapid UX and AI evolution
- ✅ Make informed decisions based on latest trends
- ✅ Discover tools and techniques before they're mainstream
- ✅ Apply insights to improve your daily work
- ✅ Build a competitive advantage through continuous learning

---

**Start Date**: [Date you set this up]
**Reports Generated**: [Auto-tracked in logs]
**Status**: 🟢 Active / 🟡 Testing / 🔴 Inactive

---

*"The best way to predict the future is to invent it." - Alan Kay*
*"The best way to invent the future is to stay informed about the present." - This system*
