#!/bin/bash
# Deactivate virtual environment if active
deactivate 2>/dev/null || true

# Remove virtual environment
rm -rf venv

# Clean Python cache
find . -type d -name "__pycache__" -exec rm -rf {} +
find . -type f -name "*.pyc" -delete

echo "Environment cleaned!"