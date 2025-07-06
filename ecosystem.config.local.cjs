module.exports = {
  apps: [
    {
      name: 'tool-server-app',
      exec_mode: 'cluster',
      instances: 1,
      script: './.output/server/index.mjs',
      env: {
        NODE_ENV: 'production',
        NITRO_PORT: 3003,
        NITRO_HOST: '0.0.0.0',
      }
    }
  ]
} 