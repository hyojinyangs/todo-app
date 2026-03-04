#!/bin/bash

# Translate Daily Trend Report to Korean
# Usage: ./translate-to-korean.sh <english-report-file>

ENGLISH_REPORT="$1"

if [ ! -f "$ENGLISH_REPORT" ]; then
    echo "❌ Error: Report file not found: $ENGLISH_REPORT"
    exit 1
fi

# Get base filename
BASE_NAME=$(basename "$ENGLISH_REPORT" .md)
DIR_NAME=$(dirname "$ENGLISH_REPORT")
KOREAN_REPORT="$DIR_NAME/${BASE_NAME}-ko.md"

echo "📝 Translating report to Korean..."
echo "   English: $ENGLISH_REPORT"
echo "   Korean:  $KOREAN_REPORT"

# Check if Claude CLI is available
if ! command -v claude &> /dev/null; then
    echo "❌ Error: Claude CLI not found"
    exit 1
fi

# Translation function with retry logic
translate_with_retry() {
    local max_attempts=3
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        echo "🔄 Translation attempt $attempt of $max_attempts..."

        # Direct piping (no temp files)
        claude <<PROMPT > "$KOREAN_REPORT"
Translate the following UX & AI trend report from English to Korean.

IMPORTANT INSTRUCTIONS:
- Maintain all markdown formatting (headers, bullets, links, etc.)
- Keep all URLs and links in English
- Translate technical terms appropriately for Korean UX/AI professionals
- Keep product names, company names, and brands in English
- Maintain the same structure and sections
- Use professional Korean suitable for business/technical context
- Preserve all section headers and subsection organization

Please provide ONLY the translated Korean text, maintaining exact markdown structure.

REPORT TO TRANSLATE:
$(cat "$ENGLISH_REPORT")
PROMPT

        # Verify translation succeeded
        if [ -f "$KOREAN_REPORT" ] && [ -s "$KOREAN_REPORT" ]; then
            # Check if file contains Korean characters
            if grep -q '[가-힣]' "$KOREAN_REPORT"; then
                echo "✅ Korean translation created successfully"
                return 0
            else
                echo "⚠️  Output doesn't contain Korean characters, retrying..."
            fi
        else
            echo "⚠️  Translation failed, retrying..."
        fi

        attempt=$((attempt + 1))

        # Exponential backoff
        if [ $attempt -le $max_attempts ]; then
            sleep $((2 ** (attempt - 1)))
        fi
    done

    echo "❌ Translation failed after $max_attempts attempts"
    return 1
}

# Perform translation
if translate_with_retry; then
    # Quality check: Compare line counts (rough validation)
    EN_LINES=$(wc -l < "$ENGLISH_REPORT")
    KO_LINES=$(wc -l < "$KOREAN_REPORT")

    # Korean version should be similar length (within 50%)
    MIN_LINES=$((EN_LINES / 2))
    MAX_LINES=$((EN_LINES * 2))

    if [ "$KO_LINES" -lt "$MIN_LINES" ] || [ "$KO_LINES" -gt "$MAX_LINES" ]; then
        echo "⚠️  Warning: Korean report length ($KO_LINES lines) differs significantly from English ($EN_LINES lines)"
    fi

    echo "📊 English: $EN_LINES lines | Korean: $KO_LINES lines"
    exit 0
else
    exit 1
fi
