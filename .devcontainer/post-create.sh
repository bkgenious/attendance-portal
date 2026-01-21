#!/bin/bash
set -e

echo "Starting MySQL..."
# The feature installs mysql-server. Start it.
sudo service mysql start || echo "MySQL already running or failed to start"

echo "Waiting for DB..."
# Wait loop
until mysqladmin ping -h localhost --silent; do
  echo "Waiting for mysql..."
  sleep 2
done

echo "Creating Database if not exists..."
mysql -e "CREATE DATABASE IF NOT EXISTS attendance_portal;" -u root -ppassword123

echo "Installing Dependencies..."
cd backend && npm install
cd ../frontend && npm install

echo "Setting up Database..."
cd ../backend
# Export DB URL for this session so prisma can run
export DATABASE_URL="mysql://root:password123@localhost:3306/attendance_portal"

# Push schema to the local DB
npx prisma db push

echo "Seeding Database..."
npx prisma db seed

echo "------------------------------------------------"
echo "Setup Complete!"
echo "Run './start.sh' to launch the app."
echo "------------------------------------------------"
