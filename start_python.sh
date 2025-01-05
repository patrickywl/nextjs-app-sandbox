export FLASK_APP=app
export FLASK_ENV=development
export FLASK_DEBUG=1
export DD_SERVICE="dummy-server" 
export DD_ENV="dev-01" 
export DD_AGENT_PORT=8136
export DD_LOGS_INJECTION=true 
export DD_PROFILING_ENABLED=true
pipenv run ddtrace-run flask run --host=0.0.0.0 --port=443 --cert=adhoc