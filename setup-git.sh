#!/bin/bash

# Initialize Git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Project structure setup"

# Add GitHub repository as remote
git remote add origin https://github.com/gumwoo/ai-pairingsystem.git

echo "Git repository initialized and connected to GitHub remote."
echo "To push to GitHub, run: git push -u origin main"
