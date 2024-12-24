#!/usr/bin/env bash
# setup_local_env.sh
# Example script to create virtual environments or install deps.

echo "Setting up local environment..."

# Example: aggregator side
python -m venv venv_aggregator
source venv_aggregator/bin/activate
pip install -r aggregator/aggregator_requirements.txt
deactivate

# Example: client side
python -m venv venv_client
source venv_client/bin/activate
pip install -r client/client_requirements.txt
deactivate

echo "Local environment setup complete."
