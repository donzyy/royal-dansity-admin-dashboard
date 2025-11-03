/**
 * PM2 Ecosystem Configuration
 * Manages backend and frontend processes on Windows Server
 * 
 * Usage:
 *   pm2 start ecosystem.config.cjs          # Start all apps
 *   pm2 stop ecosystem.config.cjs          # Stop all apps
 *   pm2 restart ecosystem.config.cjs       # Restart all apps
 *   pm2 delete ecosystem.config.cjs        # Delete all apps
 *   pm2 logs                               # View logs
 *   pm2 save                               # Save current process list
 *   pm2 startup                            # Generate startup script
 */

module.exports = {
  apps: [
    {
      name: 'royaldansity-api',
      script: './backend/dist/index.js',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
      env_development: {
        NODE_ENV: 'development',
      },
      error_file: './logs/pm2-api-error.log',
      out_file: './logs/pm2-api-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
    },
  ],
};



