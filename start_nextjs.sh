export NODE_TLS_REJECT_UNAUTHORIZED=0
export DD_SERVICE=""
export DD_ENV=""
export DD_LOGS_INJECTION=true
export DD_AGENT_PORT=8126
export DD_PROFILING_ENABLED=true
export NODE_OPTIONS='--require dd-trace/init'
# npm start
npx next dev -H 0.0.0.0

# npm build
#npm start
