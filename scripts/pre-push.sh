#!/bin/bash

# Pre-push checks for GratitudeBee
# This script runs all necessary checks before pushing code

echo "🐝 Running pre-push checks for GratitudeBee..."
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track if any check fails
FAILED=0

# 1. ESLint Check
echo "1️⃣  Running ESLint..."
if npm run lint; then
    echo -e "${GREEN}✅ ESLint passed${NC}"
else
    echo -e "${RED}❌ ESLint failed${NC}"
    FAILED=1
fi
echo ""

# 2. TypeScript Check
echo "2️⃣  Running TypeScript check..."
if npm run typecheck; then
    echo -e "${GREEN}✅ TypeScript passed${NC}"
else
    echo -e "${RED}❌ TypeScript failed${NC}"
    FAILED=1
fi
echo ""

# 3. Expo Doctor Check
echo "3️⃣  Running Expo Doctor..."
if npx expo-doctor; then
    echo -e "${GREEN}✅ Expo Doctor passed${NC}"
else
    echo -e "${YELLOW}⚠️  Expo Doctor found issues (review above)${NC}"
    # Don't fail on expo doctor warnings
fi
echo ""

# 4. Check for console.log statements (optional but useful)
echo "4️⃣  Checking for console.log statements..."
CONSOLE_COUNT=$(grep -r "console\.log" --include="*.ts" --include="*.tsx" --exclude-dir="node_modules" --exclude-dir=".expo" . | grep -v "__DEV__" | wc -l)
if [ $CONSOLE_COUNT -eq 0 ]; then
    echo -e "${GREEN}✅ No console.log statements found${NC}"
else
    echo -e "${YELLOW}⚠️  Found $CONSOLE_COUNT console.log statements not wrapped in __DEV__${NC}"
    echo "   Consider wrapping them with: if (__DEV__) { console.log(...) }"
fi

echo ""
echo "========================================"

# Final result
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Safe to push.${NC}"
    echo ""
    echo -e "${BLUE}💡 Tips:${NC}"
    echo "   • Run 'npx expo start -c' to test app startup before pushing major changes"
    echo "   • Test on both iOS and Android simulators"
    echo "   • Remember: NO AI references in commit messages!"
    echo ""
    echo -e "${GREEN}Ready to run: git push origin $(git branch --show-current)${NC}"
else
    echo -e "${RED}❌ Some checks failed. Please fix before pushing.${NC}"
    echo ""
    echo -e "${YELLOW}Remember the golden rules:${NC}"
    echo "   • Zero ESLint warnings, zero errors"
    echo "   • Full TypeScript compliance"
    echo "   • No shortcuts - fix errors properly"
    exit 1
fi