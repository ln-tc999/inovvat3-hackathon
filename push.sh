#!/bin/bash

# Auto Git Push - Per File Handler
# Usage: ./push.sh "commit message"


COMMIT_MSG="${1:-'auto update: $(date +%Y-%m-%d %H:%M:%S)'}"
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")

echo "🚀 Auto Git Push Script"
echo "=========================================="
echo "📍 Branch: $BRANCH"
echo "📝 Commit Message: $COMMIT_MSG"
echo "=========================================="

# Check if in git repo
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not a git repository!"
    exit 1
fi

# Fetch current status
echo "🔍 Checking repository status..."
git status --short

# Get list of deleted files
DELETED_FILES=$(git status --short | grep '^ D' | sed 's/^ D //')

# Get list of modified files
MODIFIED_FILES=$(git status --short | grep '^ M' | sed 's/^ M //')

# Get list of new files (untracked)
NEW_FILES=$(git status --short | grep '^??' | sed 's/^?? //')

echo ""
echo "=========================================="

# Counter for operations
COUNT=0

if [ -n "$DELETED_FILES" ]; then
    echo "🗑️  Processing DELETED files..."
    echo "$DELETED_FILES" | while read -r file; do
        if [ -n "$file" ]; then
            echo "   → Removing: $file"
            git rm "$file" 2>/dev/null
            git commit -m "🗑️ delete: $file - $COMMIT_MSG"
            ((COUNT++))
        fi
    done
fi


if [ -n "$MODIFIED_FILES" ]; then
    echo "✏️  Processing MODIFIED files..."
    echo "$MODIFIED_FILES" | while read -r file; do
        if [ -n "$file" ]; then
            echo "   → Staging: $file"
            git add "$file"
            git commit -m "✏️ update: $file - $COMMIT_MSG"
            ((COUNT++))
        fi
    done
fi


if [ -n "$NEW_FILES" ]; then
    echo "📄 Processing NEW files..."
    echo "$NEW_FILES" | while read -r file; do
        if [ -n "$file" ]; then
            echo "   → Adding: $file"
            git add "$file"
            git commit -m "📄 add: $file - $COMMIT_MSG"
            ((COUNT++))
        fi
    done
fi


if [ $COUNT -gt 0 ]; then
    echo ""
    echo "📤 Pushing $COUNT commits to origin/$BRANCH..."
    git push origin "$BRANCH"
    
    if [ $? -eq 0 ]; then
        echo "=========================================="
        echo "✅ SUCCESS! All changes pushed."
        echo "📊 Total commits: $COUNT"
        echo "=========================================="
    else
        echo "=========================================="
        echo "❌ ERROR: Push failed!"
        echo "=========================================="
        exit 1
    fi
else
    echo ""
    echo "=========================================="
    echo "ℹ️  No changes to commit. Working tree clean."
    echo "=========================================="
fi