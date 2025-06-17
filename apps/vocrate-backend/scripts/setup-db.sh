#!/bin/bash

# Setup script for Vocrate database

echo "🚀 Setting up Vocrate database..."

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
    exit 1
fi

# Create database if it doesn't exist
echo "📦 Creating database..."
createdb vocrate_db 2>/dev/null || echo "Database already exists"

# Generate Prisma client
echo "🔧 Generating Prisma client..."
pnpm db:generate

# Push database schema
echo "📊 Pushing database schema..."
pnpm db:push

echo "✅ Database setup complete!"
echo "🎯 You can now start the development server with: pnpm dev"
