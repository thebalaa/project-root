#!/bin/bash

# Create dist directory if it doesn't exist
mkdir -p dist

# Copy static files
cp src/popup.html dist/
cp -r assets dist/

# Run webpack build
npm run build 