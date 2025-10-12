#!/bin/bash

# GitHub Setup Script for DCSC Attendance Dashboard
# This script will guide you through pushing your code to GitHub

echo "🚀 GitHub Setup for DCSC Attendance Dashboard"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get GitHub username
read -p "Enter your GitHub username: " GITHUB_USERNAME

# Confirm
echo ""
echo "Your repository URL will be:"
echo "https://github.com/$GITHUB_USERNAME/dcsc-attendance-dashboard"
echo ""
read -p "Is this correct? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
    echo "❌ Setup cancelled. Please run the script again."
    exit 1
fi

echo ""
echo "📦 Step 1: Initializing Git repository..."
git init

if [ $? -eq 0 ]; then
    echo "✅ Git repository initialized"
else
    echo "❌ Failed to initialize Git repository"
    exit 1
fi

echo ""
echo "📦 Step 2: Adding all files..."
git add .

if [ $? -eq 0 ]; then
    echo "✅ Files added"
else
    echo "❌ Failed to add files"
    exit 1
fi

echo ""
echo "📦 Step 3: Creating first commit..."
git commit -m "Initial commit: DCSC Attendance Dashboard v1.0"

if [ $? -eq 0 ]; then
    echo "✅ Initial commit created"
else
    echo "❌ Failed to create commit"
    exit 1
fi

echo ""
echo "📦 Step 4: Renaming branch to 'main'..."
git branch -M main

if [ $? -eq 0 ]; then
    echo "✅ Branch renamed to main"
else
    echo "❌ Failed to rename branch"
    exit 1
fi

echo ""
echo "📦 Step 5: Adding GitHub remote..."
git remote add origin "https://github.com/$GITHUB_USERNAME/dcsc-attendance-dashboard.git"

if [ $? -eq 0 ]; then
    echo "✅ GitHub remote added"
else
    echo "⚠️  Remote might already exist, continuing..."
fi

echo ""
echo "📦 Step 6: Pushing to GitHub..."
echo ""
echo "⚠️  IMPORTANT: You'll be asked for your GitHub credentials:"
echo "   - Username: $GITHUB_USERNAME"
echo "   - Password: Use a Personal Access Token (NOT your GitHub password)"
echo ""
echo "If you don't have a token yet, press Ctrl+C to cancel,"
echo "then follow the instructions in GITHUB_TOKEN_SETUP.md"
echo ""
read -p "Press Enter to continue..."

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ SUCCESS! Your code is now on GitHub!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📍 View your repository at:"
    echo "   https://github.com/$GITHUB_USERNAME/dcsc-attendance-dashboard"
    echo ""
    echo "🎯 Next step: Connect GitHub to Render"
    echo "   (See DEPLOYMENT.md for instructions)"
    echo ""
else
    echo ""
    echo "❌ Failed to push to GitHub"
    echo ""
    echo "Common issues:"
    echo "1. Need to create a Personal Access Token"
    echo "   → See GITHUB_TOKEN_SETUP.md"
    echo "2. Repository doesn't exist on GitHub"
    echo "   → Create it at https://github.com/new"
    echo "3. Wrong username"
    echo "   → Run this script again with correct username"
    echo ""
    exit 1
fi

