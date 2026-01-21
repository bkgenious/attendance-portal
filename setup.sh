#!/bin/bash
set +e 

echo "========================================"
echo "   Attendance Portal Setup (Failsafe)   "
echo "========================================"

echo "[1/4] Checking Database..."
sudo service mysql start
# Wait loop
count=0
while ! mysqladmin ping -h localhost --silent; do
    echo "      Waiting for mysql... ($count)"
    sleep 2
    count=$((count+1))
    if [ $count -ge 10 ]; then
        echo "      WARNING: MySQL taking long to start..."
        sudo service mysql restart
        break
    fi
done

echo "[2/4] Installing Backend Dependencies..."
cd backend
npm install --legacy-peer-deps --no-audit

echo "[3/4] Installing Frontend Dependencies..."
cd ../frontend
npm install --legacy-peer-deps --no-audit

echo "[4/4] Setting up Database Schema..."
cd ../backend
export DATABASE_URL="mysql://root:password123@localhost:3306/attendance_portal"
npx prisma db push --accept-data-loss
npx prisma db seed

echo "========================================"
echo "   Setup Complete!                      "
echo "   Run './start.sh' to launch.          "
echo "========================================"
