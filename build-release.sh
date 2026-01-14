#!/bin/bash

# Spyll Android Build & Release Script
# Builds APK locally and uploads to GitHub releases
# Usage: ./build-release.sh [release_message]

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
KEYSTORE_FILE="$PROJECT_DIR/spyll-release.keystore"
AAB_OUTPUT="$PROJECT_DIR/app.aab"
APK_OUTPUT="$PROJECT_DIR/app.apk"
RELEASES_DIR="$PROJECT_DIR/releases"
LOCAL_AAB="$RELEASES_DIR/spyll-latest.aab"
LOCAL_APK="$RELEASES_DIR/spyll-latest.apk"
REPO="Luckysolanki902/spyll-web"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() { echo -e "${GREEN}[BUILD]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Check requirements
check_requirements() {
    log "Checking requirements..."
    
    command -v node >/dev/null 2>&1 || error "Node.js is required"
    command -v npx >/dev/null 2>&1 || error "npx is required"
    command -v gh >/dev/null 2>&1 || error "GitHub CLI (gh) is required. Install: brew install gh"
    
    # Check gh auth
    gh auth status >/dev/null 2>&1 || error "Not logged into GitHub CLI. Run: gh auth login"
    
    # Check keystore
    if [ ! -f "$KEYSTORE_FILE" ]; then
        error "Keystore not found: $KEYSTORE_FILE"
    fi
    
    # Create releases directory if it doesn't exist
    mkdir -p "$RELEASES_DIR"
    
    log "✅ All requirements met"
}

# Sync web app with Capacitor
sync_capacitor() {
    log "Syncing Capacitor..."
    
    cd "$PROJECT_DIR"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        log "Installing npm dependencies..."
        npm install --legacy-peer-deps
    fi
    
    # Create minimal web directory (redirects to spyll.in)
    mkdir -p out
    cat > out/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>Spyll</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #121212;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .loader {
      text-align: center;
      color: #FF5973;
      font-size: 2rem;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="loader">SPYLL</div>
  <script>
    window.location.href = 'https://spyll.in';
  </script>
</body>
</html>
EOF
    
    # Add Android platform if not exists
    npx cap add android 2>/dev/null || true
    
    # Sync
    npx cap sync android
    
    log "✅ Capacitor synced"
}

# Copy app icons
copy_icons() {
    log "Copying app icons..."
    
    cd "$PROJECT_DIR"
    
    cp public/app-icons/icon-72x72.png android/app/src/main/res/mipmap-hdpi/ic_launcher.png
    cp public/app-icons/icon-72x72.png android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png
    cp public/app-icons/icon-96x96.png android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
    cp public/app-icons/icon-96x96.png android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png
    cp public/app-icons/icon-144x144.png android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
    cp public/app-icons/icon-144x144.png android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png
    cp public/app-icons/icon-192x192.png android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
    cp public/app-icons/icon-192x192.png android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png
    
    # Remove adaptive icon XML to use PNG directly
    rm -rf android/app/src/main/res/mipmap-anydpi-v26
    
    log "✅ Icons copied"
}

# Copy google-services.json
copy_firebase_config() {
    log "Copying Firebase config..."
    
    cd "$PROJECT_DIR"
    
    if [ -f "google-services.json" ]; then
        cp google-services.json android/app/google-services.json
        log "✅ google-services.json copied"
    else
        warn "google-services.json not found - push notifications won't work"
    fi
}

# Setup signing
setup_signing() {
    log "Setting up release signing..."
    
    cd "$PROJECT_DIR"
    
    # Copy keystore to android/app
    cp "$KEYSTORE_FILE" android/app/spyll-release.keystore
    
    # Create keystore.properties
    cat > android/keystore.properties << EOF
storePassword=SpyllApp2026
keyPassword=SpyllApp2026
keyAlias=spyll
storeFile=spyll-release.keystore
EOF
    
    log "✅ Signing configured"
}

# Build AAB and APK
build_app() {
    log "Building release AAB and APK..."
    
    cd "$PROJECT_DIR/android"
    
    # Make gradlew executable
    chmod +x gradlew
    
    # Clean and build AAB (for Play Store)
    ./gradlew clean
    ./gradlew bundleRelease --no-daemon
    
    # Also build APK (for direct distribution)
    ./gradlew assembleRelease --no-daemon
    
    # Find the AAB
    AAB_PATH=$(find app/build/outputs/bundle/release -name "*.aab" -type f | head -1)
    
    if [ -z "$AAB_PATH" ]; then
        error "No AAB found!"
    fi
    
    # Copy AAB to project root
    cp "$AAB_PATH" "$AAB_OUTPUT"
    cp "$AAB_PATH" "$LOCAL_AAB"
    
    AAB_SIZE=$(ls -lh "$AAB_OUTPUT" | awk '{print $5}')
    log "✅ AAB built: $AAB_SIZE (for Play Store)"
    log "✅ Local AAB saved: $LOCAL_AAB"
    
    # Find the APK
    APK_PATH=$(find app/build/outputs/apk/release -name "*.apk" -type f | grep -v unsigned | head -1)
    
    if [ -z "$APK_PATH" ]; then
        APK_PATH=$(find app/build/outputs/apk/release -name "*.apk" -type f | head -1)
    fi
    
    if [ -n "$APK_PATH" ]; then
        cp "$APK_PATH" "$APK_OUTPUT"
        cp "$APK_PATH" "$LOCAL_APK"
        
        APK_SIZE=$(ls -lh "$APK_OUTPUT" | awk '{print $5}')
        log "✅ APK built: $APK_SIZE (for direct install)"
        log "✅ Local APK saved: $LOCAL_APK"
    fi
}

# Get next version
get_next_version() {
    cd "$PROJECT_DIR"
    
    # Get latest tag from GitHub
    LATEST_TAG=$(gh release list --repo "$REPO" --limit 1 --json tagName -q '.[0].tagName' 2>/dev/null || echo "v0")
    
    if [ -z "$LATEST_TAG" ] || [ "$LATEST_TAG" = "null" ]; then
        LATEST_TAG="v0"
    fi
    
    # Extract number and increment
    VERSION_NUM=$(echo "$LATEST_TAG" | sed 's/v//')
    if ! [[ "$VERSION_NUM" =~ ^[0-9]+$ ]]; then
        VERSION_NUM=0
    fi
    
    NEXT_VERSION=$((VERSION_NUM + 1))
    echo "v$NEXT_VERSION"
}

# Upload to GitHub releases
upload_release() {
    local RELEASE_MSG="$1"
    
    log "Uploading to GitHub releases..."
    
    cd "$PROJECT_DIR"
    
    VERSION=$(get_next_version)
    log "Creating release: $VERSION"
    
    # Create release notes
    NOTES="## Spyll - India's Largest Anonymous Network

### Download
📱 **[Download APK](https://github.com/$REPO/releases/download/$VERSION/app.apk)** (Direct Install)
📦 **[Download AAB](https://github.com/$REPO/releases/download/$VERSION/app.aab)** (Play Store Bundle)

### What's New
$RELEASE_MSG

---
🌐 Website: [spyll.in](https://spyll.in)"
    
    # Create release with both AAB and APK
    gh release create "$VERSION" \
        --repo "$REPO" \
        --title "Spyll $VERSION" \
        --notes "$NOTES" \
        "$AAB_OUTPUT" \
        "$APK_OUTPUT"
    
    log "✅ Release created: https://github.com/$REPO/releases/tag/$VERSION"
    log "📦 AAB uploaded for Play Store"
    log "📱 APK uploaded for direct distribution"
}

# Main
main() {
    local RELEASE_MSG="${1:-Bug fixes and improvements}"
    
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════╗"
    echo "║      Spyll Android Build & Release        ║"
    echo "╚═══════════════════════════════════════════╝"
    echo -e "${NC}"
    
    check_requirements
    sync_capacitor
    copy_icons
    copy_firebase_config
    setup_signing
    build_app
    
    echo ""
    log "📦 AAB for Play Store: $AAB_OUTPUT"
    log "📱 APK for direct install: $APK_OUTPUT"
    echo ""
    read -p "Upload to GitHub releases? (y/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        upload_release "$RELEASE_MSG"
    else
        log "Files ready at:"
        log "  - AAB: $AAB_OUTPUT"
        log "  - APK: $APK_OUTPUT"
        log "To upload manually: gh release create vX --repo $REPO app.aab app.apk"
    fi
    
    echo ""
    log "🎉 Done!"
}

# Run
main "$@"
