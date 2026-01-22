#!/bin/bash
set +e 

echo "========================================"
echo "   Attendance Portal Setup (Failsafe)   "
echo "========================================"

echo "[1/4] Checking Database..."
if ! command -v mysql &> /dev/null; then
    echo "      MySQL not found. Installing..."
    sudo apt-get update
    sudo apt-get install -y mysql-server
fi

# Start MySQL
sudo service mysql start

# Configuration for default Codespace (root user often has no password or needs one set)
# We will attempt to set the password to 'password123' to match our config
echo "      Configuring MySQL Password..."
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password123';" 2>/dev/null || true

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
