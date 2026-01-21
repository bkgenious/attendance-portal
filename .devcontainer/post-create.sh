#!/bin/bash

# FAILSFATE MODE: Do not exit on error. We want the container to assume 'ready' state even if partial setup fails.
set +e

echo ">>> [Codespaces] Starting Post-Create Setup..."

# 1. Start MySQL with retries
echo ">>> [Database] Starting MySQL Service..."
sudo service mysql start
if [ $? -ne 0 ]; then
    echo "!!! MySQL failed to start normally. Retrying..."
    sudo service mysql restart || echo "!!! MySQL restart failed. Proceeding anyway..."
fi

# Wait for MySQL to be ready
echo ">>> [Database] Waiting for MySQL to accept connections..."
MAX_RETRIES=15
count=0
while ! mysqladmin ping -h localhost --silent; do
    echo "    Waiting for mysql... ($count/$MAX_RETRIES)"
    sleep 2
    count=$((count+1))
    if [ $count -ge $MAX_RETRIES ]; then
        echo "!!! MySQL timed out. Database setup may fail."
        break
    fi
done

# 2. Create Database Safely
echo ">>> [Database] ensuring 'attendance_portal' exists..."
mysql -e "CREATE DATABASE IF NOT EXISTS attendance_portal;" -u root -ppassword123 2>/dev/null
if [ $? -ne 0 ]; then
    echo "!!! Failed to create database. Is MySQL running?"
fi

# 3. Install Dependencies (Robust)
echo ">>> [Dependencies] Installing Backend..."
cd backend 
npm install --legacy-peer-deps --no-audit || echo "!!! Backend npm install failed"

echo ">>> [Dependencies] Installing Frontend..."
cd ../frontend 
npm install --legacy-peer-deps --no-audit || echo "!!! Frontend npm install failed"

# 4. Prisma Setup (Robust)
echo ">>> [Prisma] Pushing Schema..."
cd ../backend
export DATABASE_URL="mysql://root:password123@localhost:3306/attendance_portal"

# Try push, capture error if any
npx prisma db push --accept-data-loss || echo "!!! Prisma DB Push Failed. You may need to run this manually."

echo ">>> [Prisma] Seeding Database..."
npx prisma db seed || echo "!!! Prisma Seeding Failed."

# 5. Finalize
echo "----------------------------------------------------------------"
echo "✅ Codespace Setup Finished (Failsafe Mode)"
echo "   If you saw errors above, you can retry steps manually."
echo "   To start the app, run: ./start.sh"
echo "----------------------------------------------------------------"
