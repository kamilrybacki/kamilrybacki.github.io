#!/bin/bash

# Deployment verification script
# Run this locally to test the build before pushing

echo "🔧 Starting local build test..."

# Clean previous build
echo "🧹 Cleaning previous build..."
npm run clean

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the site
echo "🏗️  Building site with Eleventy..."
npm run build

# Check if build was successful
if [ -d "_site" ]; then
    echo "✅ Build successful! Site generated in _site directory"
    echo "📁 Generated files:"
    ls -la _site/
    echo ""
    echo "🚀 Ready to deploy! Push to main branch to trigger GitHub Pages deployment."
else
    echo "❌ Build failed! Check the error messages above."
    exit 1
fi