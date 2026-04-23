module.exports = {
  apps: [
    {
      name: 'OnimaiBaseV3',
      script: './main.js',
      cwd: __dirname,
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      kill_timeout: 5000,
      restart_delay: 3000,
      min_uptime: '10s',
      env: {
        NODE_ENV: 'production',
        BOT_PREFIX: '!',
        WHATSAPP_PRINT_QR: 'true',
        BOT_OWNER_NUMBERS: '',
        WA_API_BOOTSTRAP_SESSIONS: 'main-session',
        WA_API_RETRY_LIMIT: '10',
        ONIMAIBASEV3_DRY_RUN: 'false'
      }
    }
  ]
};
