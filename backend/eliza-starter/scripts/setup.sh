#!/bin/bash

# Clean existing installations
rm -rf node_modules
rm -rf .pnpm-store
rm -rf dist

# Install dependencies
pnpm install

# Build the project
pnpm build

echo "Eliza-starter setup complete!" 