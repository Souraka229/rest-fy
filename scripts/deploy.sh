#!/bin/bash

# Script de déploiement Restafy
set -e

echo "🚀 Starting Restafy deployment..."

# Check environment variables
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ NEXT_PUBLIC_SUPABASE_URL is not set"
    exit 1
fi

# Build the application
echo "📦 Building application..."
npm run build

# Setup database
echo "🗃️ Setting up database..."
npm run db:push

# Seed sample data
echo "🌱 Seeding sample data..."
npm run db:seed

# Deploy with Docker
echo "🐳 Deploying with Docker..."
docker-compose down
docker-compose up -d --build

echo "✅ Deployment completed successfully!"
echo "🌐 Application is running at: https://restafy.com"
echo "📊 Supabase Studio: https://your-project-ref.supabase.co"
