#!/bin/bash

# Clean existing installations
rm -rf node_modules
rm -rf build
rm -rf .next
rm -f package-lock.json
rm -f yarn.lock

# Install dependencies (using your preferred package manager)
pnpm install

# Build the project
pnpm build

echo "Web portal setup complete!" 