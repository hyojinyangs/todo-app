#!/usr/bin/env node

// Notion API Helper - Converts Markdown to Notion Blocks
// Usage: node notion-helper.js <report-file>

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

// Sanitize text for Notion API - remove problematic characters
function sanitizeText(text) {
    if (!text) return '';

    // Remove emojis and other Unicode symbols that might cause issues
    // Keep only basic printable characters, spaces, and common punctuation
    let cleaned = text
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
        .replace(/[\uD800-\uDFFF]/g, '') // Remove surrogate pairs (emojis)
        .substring(0, 2000); // Notion limit per text block

    return cleaned || '[content removed]';
}

// Simple markdown to Notion blocks converter
function markdownToNotionBlocks(markdown) {
    const lines = markdown.split('\n');
    const blocks = [];
    let currentParagraph = '';

    for (const line of lines) {
        // Heading 1
        if (line.startsWith('# ')) {
            if (currentParagraph) {
                blocks.push(createParagraph(currentParagraph));
                currentParagraph = '';
            }
            blocks.push(createHeading1(line.substring(2)));
        }
        // Heading 2
        else if (line.startsWith('## ')) {
            if (currentParagraph) {
                blocks.push(createParagraph(currentParagraph));
                currentParagraph = '';
            }
            blocks.push(createHeading2(line.substring(3)));
        }
        // Heading 3
        else if (line.startsWith('### ')) {
            if (currentParagraph) {
                blocks.push(createParagraph(currentParagraph));
                currentParagraph = '';
            }
            blocks.push(createHeading3(line.substring(4)));
        }
        // Bullet point
        else if (line.startsWith('- ') || line.startsWith('* ')) {
            if (currentParagraph) {
                blocks.push(createParagraph(currentParagraph));
                currentParagraph = '';
            }
            blocks.push(createBulletItem(line.substring(2)));
        }
        // Numbered list
        else if (/^\d+\.\s/.test(line)) {
            if (currentParagraph) {
                blocks.push(createParagraph(currentParagraph));
                currentParagraph = '';
            }
            blocks.push(createNumberedItem(line.replace(/^\d+\.\s/, '')));
        }
        // Divider
        else if (line.trim() === '---') {
            if (currentParagraph) {
                blocks.push(createParagraph(currentParagraph));
                currentParagraph = '';
            }
            blocks.push(createDivider());
        }
        // Empty line
        else if (line.trim() === '') {
            if (currentParagraph) {
                blocks.push(createParagraph(currentParagraph));
                currentParagraph = '';
            }
        }
        // Regular text
        else {
            currentParagraph += (currentParagraph ? ' ' : '') + line;
        }
    }

    if (currentParagraph) {
        blocks.push(createParagraph(currentParagraph));
    }

    // Notion API limits: max 100 blocks per request
    return blocks.slice(0, 100);
}

function createHeading1(text) {
    return {
        object: 'block',
        type: 'heading_1',
        heading_1: {
            rich_text: [{ type: 'text', text: { content: sanitizeText(text) } }]
        }
    };
}

function createHeading2(text) {
    return {
        object: 'block',
        type: 'heading_2',
        heading_2: {
            rich_text: [{ type: 'text', text: { content: sanitizeText(text) } }]
        }
    };
}

function createHeading3(text) {
    return {
        object: 'block',
        type: 'heading_3',
        heading_3: {
            rich_text: [{ type: 'text', text: { content: sanitizeText(text) } }]
        }
    };
}

function createParagraph(text) {
    // Handle bold, italic, links in markdown (simplified)
    return {
        object: 'block',
        type: 'paragraph',
        paragraph: {
            rich_text: [{ type: 'text', text: { content: sanitizeText(text) } }]
        }
    };
}

function createBulletItem(text) {
    return {
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
            rich_text: [{ type: 'text', text: { content: sanitizeText(text) } }]
        }
    };
}

function createNumberedItem(text) {
    return {
        object: 'block',
        type: 'numbered_list_item',
        numbered_list_item: {
            rich_text: [{ type: 'text', text: { content: sanitizeText(text) } }]
        }
    };
}

function createDivider() {
    return {
        object: 'block',
        type: 'divider',
        divider: {}
    };
}

// Create page in Notion
const blocks = markdownToNotionBlocks(reportContent);

const data = JSON.stringify({
    parent: { database_id: NOTION_DATABASE_ID },
    properties: {
        Name: {
            title: [{ text: { content: `Daily Trend Report - ${date}` } }]
        },
        Date: {
            date: { start: date }
        }
    },
    children: blocks
});

const options = {
    hostname: 'api.notion.com',
    path: '/v1/pages',
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
        'Content-Length': data.length
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
                console.error('❌ Error creating page:', response);
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
