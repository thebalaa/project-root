#!/bin/bash

# Check if character name is provided
if [ -z "$1" ]; then
    echo "Please provide a character name (e.g. 'bulldog', 'eliza')"
    echo "Available characters:"
    ls ../characters/*.character.json | sed 's/.*\/\(.*\)\.character\.json/\1/'
    exit 1
fi

CHARACTER="$1"
CHARACTER_FILE="../characters/${CHARACTER}.character.json"

# Check if character file exists
if [ ! -f "$CHARACTER_FILE" ]; then
    echo "Character file not found: $CHARACTER_FILE"
    echo "Available characters:"
    ls ../characters/*.character.json | sed 's/.*\/\(.*\)\.character\.json/\1/'
    exit 1
fi

# Start the bot with the specified character
echo "Starting bot with character: $CHARACTER"
cd ..
npm run build
node dist/index.js --character "$CHARACTER"