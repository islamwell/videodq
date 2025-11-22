#!/bin/bash
# Validation script to check the entire VideoDQ application

echo "╔════════════════════════════════════════════════════════╗"
echo "║                                                        ║"
echo "║   VideoDQ - Application Validation Script             ║"
echo "║                                                        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

ERRORS=0

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Backend Validation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd backend

# Check backend syntax
echo -n "  Checking backend syntax... "
if node -c src/index.js 2>/dev/null; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check all route files
echo -n "  Checking route files... "
ROUTE_ERRORS=0
for file in src/routes/*.js; do
    if ! node -c "$file" 2>/dev/null; then
        ROUTE_ERRORS=$((ROUTE_ERRORS + 1))
    fi
done
if [ $ROUTE_ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ ($ROUTE_ERRORS errors)${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check all model files
echo -n "  Checking model files... "
MODEL_ERRORS=0
for file in src/models/*.js; do
    if ! node -c "$file" 2>/dev/null; then
        MODEL_ERRORS=$((MODEL_ERRORS + 1))
    fi
done
if [ $MODEL_ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ ($MODEL_ERRORS errors)${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check middleware files
echo -n "  Checking middleware files... "
MIDDLEWARE_ERRORS=0
for file in src/middleware/*.js; do
    if ! node -c "$file" 2>/dev/null; then
        MIDDLEWARE_ERRORS=$((MIDDLEWARE_ERRORS + 1))
    fi
done
if [ $MIDDLEWARE_ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ ($MIDDLEWARE_ERRORS errors)${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check dependencies
echo -n "  Checking backend dependencies... "
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠ (run npm install)${NC}"
fi

# Check .env.example exists
echo -n "  Checking .env.example... "
if [ -f ".env.example" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    ERRORS=$((ERRORS + 1))
fi

cd ..

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. Frontend Validation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if Next.js build exists
echo -n "  Checking Next.js build... "
if [ -d ".next" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠ (run npm run build)${NC}"
fi

# Check TypeScript configuration
echo -n "  Checking TypeScript config... "
if [ -f "tsconfig.json" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check frontend dependencies
echo -n "  Checking frontend dependencies... "
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠ (run npm install)${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. PWA Assets Validation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check manifest
echo -n "  Checking manifest.json... "
if [ -f "public/manifest.json" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check service worker
echo -n "  Checking service worker... "
if [ -f "public/sw.js" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check offline page
echo -n "  Checking offline page... "
if [ -f "public/offline.html" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check PWA icons
echo -n "  Checking PWA icons... "
ICON_COUNT=0
[ -f "public/icons/icon-192.png" ] && ICON_COUNT=$((ICON_COUNT + 1))
[ -f "public/icons/icon-512.png" ] && ICON_COUNT=$((ICON_COUNT + 1))
[ -f "public/icons/favicon-16x16.png" ] && ICON_COUNT=$((ICON_COUNT + 1))
[ -f "public/icons/favicon-32x32.png" ] && ICON_COUNT=$((ICON_COUNT + 1))
[ -f "public/icons/apple-touch-icon.png" ] && ICON_COUNT=$((ICON_COUNT + 1))

if [ $ICON_COUNT -eq 5 ]; then
    echo -e "${GREEN}✓ (5/5)${NC}"
else
    echo -e "${YELLOW}⚠ ($ICON_COUNT/5)${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. Mobile App Validation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd mobile

# Check mobile dependencies
echo -n "  Checking mobile dependencies... "
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠ (run npm install)${NC}"
fi

# Check app.json
echo -n "  Checking app.json... "
if [ -f "app.json" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check package.json
echo -n "  Checking package.json... "
if [ -f "package.json" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    ERRORS=$((ERRORS + 1))
fi

cd ..

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5. Documentation & CI/CD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check documentation files
echo -n "  Checking README.md... "
if [ -f "README.md" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo -n "  Checking FEATURES.md... "
if [ -f "FEATURES.md" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check CI/CD workflows
echo -n "  Checking GitHub Actions... "
WORKFLOW_COUNT=0
[ -f ".github/workflows/backend-ci.yml" ] && WORKFLOW_COUNT=$((WORKFLOW_COUNT + 1))
[ -f ".github/workflows/frontend-ci.yml" ] && WORKFLOW_COUNT=$((WORKFLOW_COUNT + 1))

if [ $WORKFLOW_COUNT -eq 2 ]; then
    echo -e "${GREEN}✓ (2/2)${NC}"
else
    echo -e "${YELLOW}⚠ ($WORKFLOW_COUNT/2)${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo "The application is ready to run."
    echo ""
    echo "To start the application:"
    echo "  1. Backend:  cd backend && npm run dev"
    echo "  2. Frontend: npm run dev"
    echo "  3. Mobile:   cd mobile && npm start"
    exit 0
else
    echo -e "${RED}✗ $ERRORS error(s) found${NC}"
    echo ""
    echo "Please fix the errors above before running the application."
    exit 1
fi
