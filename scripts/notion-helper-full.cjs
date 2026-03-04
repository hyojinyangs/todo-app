#!/usr/bin/env node

// Full Notion API Helper - Sends Complete Report
// Usage: node notion-helper-full.cjs <report-file>

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

// Clean text for Notion - remove emojis and special chars that cause issues
function cleanText(text) {
    if (!text) return '';

    // Remove emoji and special Unicode characters
    let cleaned = text
        .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Remove emojis
        .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Remove misc symbols
        .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Remove dingbats
        .replace(/[✅❌🔥💡🎯📊🛠️📚🔮📈🎓💭🚀⚡️]/g, '') // Remove common emojis
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control chars
        .trim();

    return cleaned.substring(0, 2000) || '[removed]';
}

// Convert markdown to Notion blocks
function markdownToNotionBlocks(markdown) {
    const lines = markdown.split('\n');
    const blocks = [];
    let currentParagraph = '';
    let inCodeBlock = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Skip empty lines at start
        if (!line.trim() && blocks.length === 0) continue;

        // Code block
        if (line.startsWith('```')) {
            inCodeBlock = !inCodeBlock;
            if (currentParagraph) {
                blocks.push(createParagraph(currentParagraph));
                currentParagraph = '';
            }
            continue;
        }

        if (inCodeBlock) continue; // Skip code block content

        // Heading 1
        if (line.startsWith('# ') && !line.includes('##')) {
            if (currentParagraph) {
                blocks.push(createParagraph(currentParagraph));
                currentParagraph = '';
            }
            blocks.push(createHeading1(line.substring(2)));
        }
        // Heading 2
        else if (line.startsWith('## ') && !line.includes('###')) {
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
        // Bullet points
        else if (line.match(/^[\-\*]\s+/)) {
            if (currentParagraph) {
                blocks.push(createParagraph(currentParagraph));
                currentParagraph = '';
            }
            blocks.push(createBulletItem(line.replace(/^[\-\*]\s+/, '')));
        }
        // Numbered list
        else if (line.match(/^\d+\.\s+/)) {
            if (currentParagraph) {
                blocks.push(createParagraph(currentParagraph));
                currentParagraph = '';
            }
            blocks.push(createNumberedItem(line.replace(/^\d+\.\s+/, '')));
        }
        // Divider
        else if (line.trim() === '---' || line.trim() === '___') {
            if (currentParagraph) {
                blocks.push(createParagraph(currentParagraph));
                currentParagraph = '';
            }
            blocks.push(createDivider());
        }
        // Empty line - end paragraph
        else if (!line.trim()) {
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

    // Add final paragraph
    if (currentParagraph) {
        blocks.push(createParagraph(currentParagraph));
    }

    // Notion limit: 100 blocks per request
    if (blocks.length > 100) {
        console.log(`⚠️  Report has ${blocks.length} blocks, truncating to 100`);
        blocks.push(createParagraph('... (Report truncated. See full report in file)'));
    }

    return blocks.slice(0, 100);
}

function createHeading1(text) {
    const cleaned = cleanText(text);
    if (!cleaned || cleaned === '[removed]') return null;
    return {
        object: 'block',
        type: 'heading_1',
        heading_1: {
            rich_text: [{ type: 'text', text: { content: cleaned } }]
        }
    };
}

function createHeading2(text) {
    const cleaned = cleanText(text);
    if (!cleaned || cleaned === '[removed]') return null;
    return {
        object: 'block',
        type: 'heading_2',
        heading_2: {
            rich_text: [{ type: 'text', text: { content: cleaned } }]
        }
    };
}

function createHeading3(text) {
    const cleaned = cleanText(text);
    if (!cleaned || cleaned === '[removed]') return null;
    return {
        object: 'block',
        type: 'heading_3',
        heading_3: {
            rich_text: [{ type: 'text', text: { content: cleaned } }]
        }
    };
}

function createParagraph(text) {
    const cleaned = cleanText(text);
    if (!cleaned || cleaned === '[removed]') return null;
    return {
        object: 'block',
        type: 'paragraph',
        paragraph: {
            rich_text: [{ type: 'text', text: { content: cleaned } }]
        }
    };
}

function createBulletItem(text) {
    const cleaned = cleanText(text);
    if (!cleaned || cleaned === '[removed]') return null;
    return {
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
            rich_text: [{ type: 'text', text: { content: cleaned } }]
        }
    };
}

function createNumberedItem(text) {
    const cleaned = cleanText(text);
    if (!cleaned || cleaned === '[removed]') return null;
    return {
        object: 'block',
        type: 'numbered_list_item',
        numbered_list_item: {
            rich_text: [{ type: 'text', text: { content: cleaned } }]
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

console.log('📤 Converting report to Notion format...');
const blocks = markdownToNotionBlocks(reportContent).filter(b => b !== null);
console.log(`✅ Created ${blocks.length} blocks`);

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
        'Content-Length': Buffer.byteLength(data)
    }
};

console.log('📤 Sending full report to Notion...');

const req = https.request(options, (res) => {
    let responseData = '';

    res.on('data', (chunk) => {
        responseData += chunk;
    });

    res.on('end', () => {
        try {
            const response = JSON.parse(responseData);
            if (response.object === 'page') {
                console.log('✅ Full report created in Notion!');
                console.log('🔗 View at:', response.url);
                console.log(`📊 Sent ${blocks.length} content blocks`);
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
