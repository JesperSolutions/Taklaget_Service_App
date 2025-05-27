export default {
  apps: [{
    name: 'roof-inspection-api',
    script: './src/server.js',
    exec_mode: 'fork', // Changed from cluster to fork for better stability
    instances: 1,
    watch: false,
    max_memory_restart: '1G',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    node_args: '--experimental-specifier-resolution=node',
    // Added error logging
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    merge_logs: true,
    time: true,
    // Added health check
    exp_backoff_restart_delay: 100,
    max_restarts: 10,
    min_uptime: "1m"
  }]
};