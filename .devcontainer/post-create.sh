#!/bin/bash
set -e

echo "Starting Postgres..."
# The feature 'ghcr.io/devcontainers/features/postgresql' installs postgres locally.
# We need to ensure it's running. It usually starts automatically, but let's be safe.
sudo service postgresql start || echo "Postgres already running or failed to start"

echo "Waiting for DB..."
until pg_isready -h localhost -p 5432 -U postgres; do
  echo "Waiting for postgres..."
  sleep 2
done

echo "Installing Dependencies..."
cd backend && npm install
cd ../frontend && npm install

echo "Setting up Database..."
cd ../backend
# Push schema to the local DB
npx prisma db push

echo "Seeding Database..."
npx prisma db seed

echo "------------------------------------------------"
echo "Setup Complete! You can now run:"
echo "  ./start_all.bat (Win) or 'npm run dev' manually"
echo "------------------------------------------------"
