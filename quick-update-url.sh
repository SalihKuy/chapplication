#!/bin/bash
# Quick URL update helper
# Usage: ./quick-update-url.sh https://newurl.ngrok-free.app

if [ $# -eq 0 ]; then
    echo "Usage: ./quick-update-url.sh <new-ngrok-url>"
    echo "Current URL in .env:"
    cat front/.env
    exit 1
fi

NEW_URL=$1
echo "VITE_API_BASE_URL=$NEW_URL" > front/.env
echo "Updated .env with: $NEW_URL"
echo "Remember to restart your dev server!"
