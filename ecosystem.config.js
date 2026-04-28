import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default {
  apps: [
    {
      name: 'OnimaiBaseV3',
      script: './Onimai.js',
      cwd: __dirname,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production'
      },
      out_file: './logs/OnimaiBaseV3.out.log',
      error_file: './logs/OnimaiBaseV3.error.log',
      log_file: './logs/OnimaiBaseV3.combined.log',
      time: true
    }
  ]
}
