#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Config
DOWNLOADS=~/Downloads
PROJECT="/home/jbejarano/Projects/web-test/client/public/guides"
ASSETS_DIR="$PROJECT/media/images"

# Ensure assets dir exists
mkdir -p "$ASSETS_DIR"

echo -e "${YELLOW}🔍 Looking for guide ZIP files in Downloads...${NC}"

# Find the most recent zip file starting with 'guide-' in Downloads
LATEST=$(ls -t $DOWNLOADS/guide-*.zip 2>/dev/null | head -n 1)

if [ -z "$LATEST" ]; then
  echo -e "${RED}❌ No 'guide-*.zip' files found in Downloads${NC}"
  echo "Export a guide from Google Docs first!"
  exit 1
fi

echo -e "${GREEN}📦 Found archive: $(basename "$LATEST")${NC}"

# Create temp dir
TEMP_DIR=$(mktemp -d)
unzip -q "$LATEST" -d "$TEMP_DIR"

# Detect slug from the Spanish md file (assumed to be the one without -en or -pt suffix)
# Or easier: prompt assumed structure is flat in zip
# es/slug.md
# en/slug.md
# pt/slug.md
# images/

# Let's inspect what we have
# Validating structure
MD_FILE=$(find "$TEMP_DIR" -name "*.md" | grep -v -- "-en.md" | grep -v -- "-pt.md" | head -n 1)

if [ -z "$MD_FILE" ]; then
    echo -e "${RED}❌ Structure invalid: No base .md file found in zip${NC}"
    rm -rf "$TEMP_DIR"
    exit 1
fi

BASENAME=$(basename "$MD_FILE")
SLUG="${BASENAME%.md}"

echo -e "${GREEN}📄 Processing guide: $SLUG${NC}"

# Move Markdown files
mkdir -p "$PROJECT/es" "$PROJECT/en" "$PROJECT/pt"

if [ -f "$TEMP_DIR/$SLUG.md" ]; then
    mv "$TEMP_DIR/$SLUG.md" "$PROJECT/es/$SLUG.md"
    echo -e "${GREEN}✓${NC} Moved: es/$SLUG.md"
fi

if [ -f "$TEMP_DIR/$SLUG-en.md" ]; then
    mv "$TEMP_DIR/$SLUG-en.md" "$PROJECT/en/$SLUG.md"
    echo -e "${GREEN}✓${NC} Moved: en/$SLUG.md"
fi

if [ -f "$TEMP_DIR/$SLUG-pt.md" ]; then
    mv "$TEMP_DIR/$SLUG-pt.md" "$PROJECT/pt/$SLUG.md"
    echo -e "${GREEN}✓${NC} Moved: pt/$SLUG.md"
fi

# Move Images
# Check if images directory exists in temp
if [ -d "$TEMP_DIR/images" ]; then
    COUNT=$(ls -1 "$TEMP_DIR/images" | wc -l)
    if [ "$COUNT" -gt 0 ]; then
        mv "$TEMP_DIR/images/"* "$ASSETS_DIR/"
        echo -e "${GREEN}✓${NC} Moved $COUNT images to media/images/"
    fi
else
    echo -e "${YELLOW}ℹ️ No images found in this guide${NC}"
fi

# Cleanup
rm -rf "$TEMP_DIR"

echo ""
echo -e "${GREEN}✅ Successfully imported guide!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  cd /home/jbejarano/Projects/web-test"
echo "  git add client/public/guides/"
echo "  git commit -m \"Add $SLUG guide with images\""
echo "  git push"
