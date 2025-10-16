#!/bin/bash

# Deployment Script for Guess Who's Lying
echo "🚀 Starting deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies
print_status "Installing dependencies..."
npm install

# Generate Prisma client
print_status "Generating Prisma client..."
npx prisma generate

# Build the project (skip linting for now)
print_status "Building project..."
SKIP_LINT=true npm run build

if [ $? -eq 0 ]; then
    print_status "Build successful!"
else
    print_error "Build failed!"
    exit 1
fi

# Check if build artifacts exist
if [ -d ".next" ]; then
    print_status "Build artifacts created successfully"
else
    print_error "Build artifacts not found"
    exit 1
fi

# Display deployment information
echo ""
echo "🎯 Deployment Ready!"
echo "==================="
echo ""
echo "📁 Build artifacts: .next/"
echo "📦 Static files: .next/static/"
echo "🔧 Environment: Check your environment variables"
echo ""
echo "🌐 Next steps:"
echo "1. Set up your hosting platform (Vercel, Netlify, etc.)"
echo "2. Configure environment variables"
echo "3. Set up database"
echo "4. Deploy!"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"

print_status "Deployment preparation complete!"
