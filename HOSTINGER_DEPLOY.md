# Hostinger VPS Deployment Guide for Attendance Portal

This guide walks you through deploying the Attendance Portal (Next.js + Fastify + MySQL) on a Hostinger VPS (Ubuntu 22.04).

## 1. Prerequisites

* Hostinger VPS plan (KVM 1 or higher recommended).
* Domain name pointing to your VPS IP (e.g., `portal.yourcompany.com`).
* SSH Client (PuTTY or Terminal).

## 2. Server Setup

Login to your VPS via SSH:

```bash
ssh root@<YOUR_VPS_IP>
```

### Update System & Install Basics

```bash
apt update && apt upgrade -y
apt install -y curl git build-essential nginx mysql-server
```

### Install Node.js (v20)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2
```

## 3. Database Setup (MySQL)

Run the security script:

```bash
mysql_secure_installation
```

(Say Y to Password Validation Policy if you want strong passwords, then set root password).

Log in to MySQL:

```bash
mysql -u root -p
```

Create Database and User:

```sql
CREATE DATABASE attendance_db;
CREATE USER 'portal_user'@'localhost' IDENTIFIED BY 'StrongPassword123!';
GRANT ALL PRIVILEGES ON attendance_db.* TO 'portal_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## 4. Upload Code

You can use FileZilla (SFTP) to upload your project folder `attendance-portal` to `/var/www/attendance-portal`.
**Exclude**: `node_modules`, `.next`, `dist`, `.git`.

## 5. Build & Configure

### Backend

Navigate to backend folder:

```bash
cd /var/www/attendance-portal/backend
```

Create .env file:

```bash
nano .env
```

Paste content:

```ini
DATABASE_URL="mysql://portal_user:StrongPassword123!@localhost:3306/attendance_db"
JWT_SECRET="ProductionSecretKeyHere"
PORT=3001
```

Install and Build:

```bash
npm install
npm run build
npx prisma db push
npx prisma db seed
```

### Frontend

Navigate to frontend folder:

```bash
cd /var/www/attendance-portal/frontend
```

Create .env.local file:

```bash
nano .env.local
```

Paste content:

```ini
NEXT_PUBLIC_API_URL=https://portal.yourcompany.com/api
# Or http://<VPS_IP>/api if using IP only
```

Install and Build:

```bash
npm install
npm run build
```

## 6. Start Application with PM2

Go to project root:

```bash
cd /var/www/attendance-portal
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

(Run the command output by `pm2 startup`).

## 7. Nginx Configuration (Reverse Proxy)

Configure Nginx to serve the site on port 80/443.

Create config:

```bash
nano /etc/nginx/sites-available/attendance-portal
```

Content:

```nginx
server {
    listen 80;
    server_name portal.yourcompany.com; # OR your VPS IP

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API (Fastify)
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:

```bash
ln -s /etc/nginx/sites-available/attendance-portal /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default  # Optional: Disable default if conflicting
nginx -t
systemctl restart nginx
```

## 8. Final Steps

* If using a domain, run `certbot` (Let's Encrypt) for HTTPS.
* Access your site at `http://portal.yourcompany.com` or `http://<VPS_IP>`.

**Troubleshooting:**

* Check logs: `pm2 logs`
* Status: `pm2 status`
