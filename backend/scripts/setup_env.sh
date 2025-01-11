#!/bin/bash
# Remove existing virtual environment
rm -rf venv

# Create new virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install requirements
pip install -r companion_app/requirements.txt

echo "Virtual environment setup complete!"