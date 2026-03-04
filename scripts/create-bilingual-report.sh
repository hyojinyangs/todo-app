#!/bin/bash

# Create Bilingual Report - Combines English and Korean reports
# Usage: ./create-bilingual-report.sh <english-file> <korean-file> <output-file>

ENGLISH_FILE="$1"
KOREAN_FILE="$2"
OUTPUT_FILE="$3"

# Validate inputs
if [ ! -f "$ENGLISH_FILE" ]; then
    echo "❌ Error: English file not found: $ENGLISH_FILE"
    exit 1
fi

if [ ! -f "$KOREAN_FILE" ]; then
    echo "❌ Error: Korean file not found: $KOREAN_FILE"
    exit 1
fi

if [ -z "$OUTPUT_FILE" ]; then
    echo "❌ Error: Output file path required"
    exit 1
fi

# Create bilingual report
{
    echo "# 🇺🇸 English Version"
    echo ""
    cat "$ENGLISH_FILE"
    echo ""
    echo "---"
    echo "---"
    echo "---"
    echo ""
    echo "# 🇰🇷 한국어 버전"
    echo ""
    cat "$KOREAN_FILE"
} > "$OUTPUT_FILE"

if [ -f "$OUTPUT_FILE" ] && [ -s "$OUTPUT_FILE" ]; then
    echo "✅ Bilingual report created: $OUTPUT_FILE"
    exit 0
else
    echo "❌ Failed to create bilingual report"
    exit 1
fi
