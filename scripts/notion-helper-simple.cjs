#!/usr/bin/env node

// Simplified Notion API Helper - Creates a page with link to report
// Usage: node notion-helper-simple.cjs <report-file>

const fs = require('fs');
const https = require('https');

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
    console.error('❌ Error: NOTION_API_KEY or NOTION_DATABASE_ID not set');
    process.exit(1);
}

const reportFile = process.argv[2];
if (!reportFile || !fs.existsSync(reportFile)) {
    console.error('❌ Error: Report file not found');
    process.exit(1);
}

const reportContent = fs.readFileSync(reportFile, 'utf8');
const date = new Date().toISOString().split('T')[0];

// Extract key sections from report
function extractSummary(content) {
    const lines = content.split('\n');
    let summary = '';
    let inSummary = false;

    for (const line of lines) {
        if (line.includes('Executive Summary')) {
            inSummary = true;
            continue;
        }
        if (inSummary && line.startsWith('##')) {
            break;
        }
        if (inSummary && line.trim()) {
            summary += line.replace(/[*_#]/g, '') + ' ';
        }
    }

    return summary.trim().substring(0, 2000) || 'Daily UX and AI trend report';
}

function extractTopTrends(content) {
    const lines = content.split('\n');
    const trends = [];
    let currentTrend = '';

    for (const line of lines) {
        if (line.startsWith('### ') && !line.includes('Trend to Watch')) {
            if (currentTrend) trends.push(currentTrend);
            currentTrend = line.replace('### ', '').replace(/[*_#]/g, '').trim();
        }
        if (trends.length >= 3) break;
    }
    if (currentTrend && trends.length < 3) trends.push(currentTrend);

    return trends.filter(t => t.length > 0);
}

const summary = extractSummary(reportContent);
const trends = extractTopTrends(reportContent);

// Create simple page with summary and trends
const data = JSON.stringify({
    parent: { database_id: NOTION_DATABASE_ID },
    properties: {
        Name: {
            title: [{
                text: { content: `Daily Trend Report - ${date}` }
            }]
        },
        Date: {
            date: { start: date }
        }
    },
    children: [
        {
            object: 'block',
            type: 'paragraph',
            paragraph: {
                rich_text: [{
                    type: 'text',
                    text: { content: summary }
                }]
            }
        },
        {
            object: 'block',
            type: 'heading_2',
            heading_2: {
                rich_text: [{
                    type: 'text',
                    text: { content: 'Top Trends' }
                }]
            }
        },
        ...trends.slice(0, 3).map(trend => ({
            object: 'block',
            type: 'bulleted_list_item',
            bulleted_list_item: {
                rich_text: [{
                    type: 'text',
                    text: { content: trend.substring(0, 2000) }
                }]
            }
        })),
        {
            object: 'block',
            type: 'divider',
            divider: {}
        },
        {
            object: 'block',
            type: 'paragraph',
            paragraph: {
                rich_text: [{
                    type: 'text',
                    text: { content: `Full report: ${reportFile}` },
                    annotations: { code: true }
                }]
            }
        }
    ]
});

const options = {
    hostname: 'api.notion.com',
    path: '/v1/pages',
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
        'Content-Length': Buffer.byteLength(data)
    }
};

console.log('📤 Sending report to Notion...');

const req = https.request(options, (res) => {
    let responseData = '';

    res.on('data', (chunk) => {
        responseData += chunk;
    });

    res.on('end', () => {
        try {
            const response = JSON.parse(responseData);
            if (response.object === 'page') {
                console.log('✅ Report created in Notion!');
                console.log('🔗 View at:', response.url);
            } else {
                console.error('❌ Error creating page:', JSON.stringify(response, null, 2));
                process.exit(1);
            }
        } catch (error) {
            console.error('❌ Error parsing response:', error.message);
            console.error('Response:', responseData);
            process.exit(1);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Request error:', error.message);
    process.exit(1);
});

req.write(data);
req.end();
