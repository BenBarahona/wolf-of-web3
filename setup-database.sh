#!/bin/bash

# Wolf of Web3 - Database Setup Script
# This script sets up the PostgreSQL database using Docker

set -e

echo "🐺 Wolf of Web3 - Database Setup"
echo "================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first:"
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first:"
    echo "   https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Start Docker Compose
echo "🚀 Starting PostgreSQL, Redis, and pgAdmin..."
docker-compose up -d

echo ""
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Check if containers are running
if docker-compose ps | grep -q "wolf-of-web3-db.*Up"; then
    echo "✅ PostgreSQL is running"
else
    echo "❌ PostgreSQL failed to start. Check logs with: docker-compose logs postgres"
    exit 1
fi

echo ""
echo "📦 Installing PostgreSQL driver..."
cd backend
yarn add pg
cd ..

echo ""
echo "✅ Database setup complete!"
echo ""
echo "📊 Services:"
echo "   • PostgreSQL:  localhost:5432"
echo "   • Redis:       localhost:6379"
echo "   • pgAdmin:     http://localhost:5050"
echo ""
echo "🔐 Database Credentials:"
echo "   • Database:    wolf_of_web3"
echo "   • Username:    wolf_user"
echo "   • Password:    wolf_password"
echo ""
echo "🌐 pgAdmin Login:"
echo "   • Email:       admin@wolf-of-web3.local"
echo "   • Password:    admin"
echo ""
echo "⚙️  Don't forget to update backend/.env:"
echo "   DATABASE_TYPE=postgres"
echo "   DATABASE_HOST=localhost"
echo "   DATABASE_PORT=5432"
echo "   DATABASE_USER=wolf_user"
echo "   DATABASE_PASSWORD=wolf_password"
echo "   DATABASE_NAME=wolf_of_web3"
echo ""
echo "🎉 Ready to start the backend with: cd backend && yarn dev"
echo ""

