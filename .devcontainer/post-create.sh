#!/bin/bash
echo "Installing dependencies..."
cd backend && npm install
cd ../frontend && npm install

echo "Setting up Database..."
# Start a local postgres if needed or use the service constraint
# Ideally we use docker-compose but for simple codespace feature:
# The feature installs postgres but we might need to start it or use a separate service in devcontainer.json via docker-compose.
# For simplicity, we assume the user might need to set up env vars.
