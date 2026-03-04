#!/usr/bin/env node

// Complete Notion API Helper - Sends FULL Report (No Limits)
// Usage: node notion-helper-complete.cjs <report-file>

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

// Clean text for Notion - remove emojis and special chars
function cleanText(text) {
    if (!text) return '';

    let cleaned = text
        .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Remove emojis
        .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Remove misc symbols
        .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Remove dingbats
        .replace(/[✅❌🔥💡🎯📊🛠️📚🔮📈🎓💭🚀⚡️📋📍🔧🔍🔄🔑🖼️⚠️📤📁🆘📝📖🎉]/g, '') // Common emojis
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Control chars
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

        if (!line.trim() && blocks.length === 0) continue;

        if (line.startsWith('```')) {
            inCodeBlock = !inCodeBlock;
            if (currentParagraph) {
                blocks.push(createParagraph(currentParagraph));
                currentParagraph = '';
            }
            continue;
        }

        if (inCodeBlock) continue;

        if (line.startsWith('# ') && !line.includes('##')) {
            if (currentParagraph) {
                blocks.push(createParagraph(currentParagraph));
                currentParagraph = '';
            }
            blocks.push(createHeading1(line.substring(2)));
        }
        else if (line.startsWith('## ') && !line.includes('###')) {
            if (currentParagraph) {
                blocks.push(createParagraph(currentParagraph));
                currentParagraph = '';
            }
            blocks.push(createHeading2(line.substring(3)));
        }
        else if (line.startsWith('### ')) {
            if (currentParagraph) {
                blocks.push(createParagraph(currentParagraph));
                currentParagraph = '';
            }
            blocks.push(createHeading3(line.substring(4)));
        }
        else if (line.match(/^[\-\*]\s+/)) {
            if (currentParagraph) {
                blocks.push(createParagraph(currentParagraph));
                currentParagraph = '';
            }
            blocks.push(createBulletItem(line.replace(/^[\-\*]\s+/, '')));
        }
        else if (line.match(/^\d+\.\s+/)) {
            if (currentParagraph) {
                blocks.push(createParagraph(currentParagraph));
                currentParagraph = '';
            }
            blocks.push(createNumberedItem(line.replace(/^\d+\.\s+/, '')));
        }
        else if (line.trim() === '---' || line.trim() === '___') {
            if (currentParagraph) {
                blocks.push(createParagraph(currentParagraph));
                currentParagraph = '';
            }
            blocks.push(createDivider());
        }
        else if (!line.trim()) {
            if (currentParagraph) {
                blocks.push(createParagraph(currentParagraph));
                currentParagraph = '';
            }
        }
        else {
            currentParagraph += (currentParagraph ? ' ' : '') + line;
        }
    }

    if (currentParagraph) {
        blocks.push(createParagraph(currentParagraph));
    }

    return blocks.filter(b => b !== null);
}

function createHeading1(text) {
    const cleaned = cleanText(text);
    if (!cleaned || cleaned === '[removed]') return null;
    return {
        object: 'block',
        type: 'heading_1',
        heading_1: { rich_text: [{ type: 'text', text: { content: cleaned } }] }
    };
}

function createHeading2(text) {
    const cleaned = cleanText(text);
    if (!cleaned || cleaned === '[removed]') return null;
    return {
        object: 'block',
        type: 'heading_2',
        heading_2: { rich_text: [{ type: 'text', text: { content: cleaned } }] }
    };
}

function createHeading3(text) {
    const cleaned = cleanText(text);
    if (!cleaned || cleaned === '[removed]') return null;
    return {
        object: 'block',
        type: 'heading_3',
        heading_3: { rich_text: [{ type: 'text', text: { content: cleaned } }] }
    };
}

function createParagraph(text) {
    const cleaned = cleanText(text);
    if (!cleaned || cleaned === '[removed]') return null;
    return {
        object: 'block',
        type: 'paragraph',
        paragraph: { rich_text: [{ type: 'text', text: { content: cleaned } }] }
    };
}

function createBulletItem(text) {
    const cleaned = cleanText(text);
    if (!cleaned || cleaned === '[removed]') return null;
    return {
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: { rich_text: [{ type: 'text', text: { content: cleaned } }] }
    };
}

function createNumberedItem(text) {
    const cleaned = cleanText(text);
    if (!cleaned || cleaned === '[removed]') return null;
    return {
        object: 'block',
        type: 'numbered_list_item',
        numbered_list_item: { rich_text: [{ type: 'text', text: { content: cleaned } }] }
    };
}

function createDivider() {
    return { object: 'block', type: 'divider', divider: {} };
}

// Make HTTPS request (promisified)
function makeRequest(options, data) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => { responseData += chunk; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(responseData));
                } catch (error) {
                    reject(new Error(`Parse error: ${error.message}`));
                }
            });
        });
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

// Create page with initial blocks
async function createPage(blocks) {
    const data = JSON.stringify({
        parent: { database_id: NOTION_DATABASE_ID },
        properties: {
            Name: { title: [{ text: { content: `Daily Trend Report - ${date}` } }] },
            Date: { date: { start: date } }
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

    return makeRequest(options, data);
}

// Append blocks to existing page
async function appendBlocks(pageId, blocks) {
    const data = JSON.stringify({ children: blocks });

    const options = {
        hostname: 'api.notion.com',
        path: `/v1/blocks/${pageId}/children`,
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${NOTION_API_KEY}`,
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28',
            'Content-Length': Buffer.byteLength(data)
        }
    };

    return makeRequest(options, data);
}

// Main execution
async function main() {
    try {
        console.log('📤 Converting report to Notion format...');
        const allBlocks = markdownToNotionBlocks(reportContent);
        console.log(`✅ Created ${allBlocks.length} blocks total`);

        // Create page with first 100 blocks
        console.log('📤 Creating page with initial blocks...');
        const initialBlocks = allBlocks.slice(0, 100);
        const response = await createPage(initialBlocks);

        if (response.object !== 'page') {
            console.error('❌ Error creating page:', JSON.stringify(response, null, 2));
            process.exit(1);
        }

        const pageId = response.id;
        console.log(`✅ Page created! (${initialBlocks.length} blocks)`);

        // Append remaining blocks in batches of 100
        let remaining = allBlocks.slice(100);
        let batchNumber = 2;

        while (remaining.length > 0) {
            const batch = remaining.slice(0, 100);
            remaining = remaining.slice(100);

            console.log(`📤 Appending batch ${batchNumber} (${batch.length} blocks)...`);
            await appendBlocks(pageId, batch);
            console.log(`✅ Batch ${batchNumber} appended`);
            batchNumber++;

            // Small delay to avoid rate limits
            if (remaining.length > 0) {
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        }

        console.log('');
        console.log('✅ Complete report created in Notion!');
        console.log('🔗 View at:', response.url);
        console.log(`📊 Total blocks sent: ${allBlocks.length}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

main();
