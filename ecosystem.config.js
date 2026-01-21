module.exports = {
    apps: [
        {
            name: 'attendance-backend',
            script: './dist/app.js',
            cwd: './backend',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '500M',
            env: {
                NODE_ENV: 'production',
                PORT: 3001
            }
        },
        {
            name: 'attendance-frontend',
            script: 'npm',
            args: 'start',
            cwd: './frontend',
            instances: 1,
            autorestart: true,
            watch: false,
            env: {
                NODE_ENV: 'production',
                PORT: 3000
            }
        }
    ]
};
