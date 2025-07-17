#!/bin/bash

# Roblox Profit Lens Deployment Script
# This script prepares and deploys the application to production

set -e

echo "🚀 Starting Roblox Profit Lens deployment..."

# Check if required environment variables are set
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "❌ Error: Required environment variables not set"
    echo "Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run linting
echo "🔍 Running linter..."
npm run lint

# Build the application
echo "🏗️ Building application..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

echo "✅ Build completed successfully!"
echo "📁 Built files are in the 'dist' directory"
echo "🌐 Ready for deployment to your hosting platform"

# Optional: Deploy to Vercel if vercel CLI is available
if command -v vercel &> /dev/null; then
    read -p "Deploy to Vercel? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🚀 Deploying to Vercel..."
        vercel --prod
    fi
fi

echo "🎉 Deployment process completed!"