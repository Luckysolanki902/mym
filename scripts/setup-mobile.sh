#!/bin/bash

# Spyll Mobile App Setup Script
# This script initializes Capacitor and prepares the mobile app build environment

set -e

echo "🚀 Spyll Mobile App Setup"
echo "========================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
yarn install

# Create a minimal out directory for Capacitor
# Since this app uses server-side rendering, Capacitor will load from spyll.in
echo ""
echo "📁 Creating Capacitor web directory..."
mkdir -p out

# Create a redirect page that loads spyll.in
cat > out/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Spyll - Loading...</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        .loader {
            text-align: center;
        }
        .spinner {
            width: 50px;
            height: 50px;
            border: 3px solid rgba(255,255,255,0.1);
            border-top-color: #6366f1;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        h1 { font-size: 24px; margin-bottom: 10px; }
        p { opacity: 0.7; font-size: 14px; }
    </style>
</head>
<body>
    <div class="loader">
        <div class="spinner"></div>
        <h1>Spyll</h1>
        <p>Loading...</p>
    </div>
</body>
</html>
EOF

echo "✅ Web directory created"

# Initialize Capacitor (if not already initialized)
if [ ! -f "capacitor.config.ts" ] && [ ! -f "capacitor.config.json" ]; then
    echo ""
    echo "⚡ Initializing Capacitor..."
    npx cap init Spyll in.spyll.app --web-dir out
fi

# Add Android platform
if [ ! -d "android" ]; then
    echo ""
    echo "🤖 Adding Android platform..."
    npx cap add android
fi

# Add iOS platform (macOS only)
if [ "$(uname)" == "Darwin" ] && [ ! -d "ios" ]; then
    echo ""
    echo "🍎 Adding iOS platform..."
    npx cap add ios
fi

# Sync Capacitor
echo ""
echo "🔄 Syncing Capacitor..."
npx cap sync

# Copy Firebase config files if they exist
if [ -f "google-services.json" ]; then
    echo ""
    echo "🔥 Copying google-services.json to Android..."
    cp google-services.json android/app/
fi

if [ -f "GoogleService-Info.plist" ]; then
    echo ""
    echo "🔥 Copying GoogleService-Info.plist to iOS..."
    cp GoogleService-Info.plist ios/App/App/
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📱 Your app is configured to load from https://spyll.in"
echo ""
echo "📱 Next steps:"
echo "  1. For Android:"
echo "     - Run: npx cap open android"
echo "     - Build APK from Android Studio"
echo "     - Or push to GitHub to trigger automated builds"
echo ""
echo "  2. For iOS (macOS only):"
echo "     - Run: npx cap open ios"
echo "     - Configure signing in Xcode"
echo ""
echo "  3. GitHub Actions:"
echo "     - Push to main/master branch to trigger builds"
echo "     - Download APKs from GitHub Actions artifacts"
echo ""
echo "🔐 For signed releases, configure these GitHub Secrets:"
echo "  Android: ANDROID_KEYSTORE_BASE64, ANDROID_KEYSTORE_PASSWORD,"
echo "           ANDROID_KEY_ALIAS, ANDROID_KEY_PASSWORD"
echo ""
