#!/bin/sh

ELECTRON_VERSION="0.30.3"
ELECTRON_PLATFORM="linux"
ELECTRON_ARCH="x64"

APP_NAME="Google Music Electron"
APP_VERSION="1.18.0"
BUNDLE_ID="com.twolfson.googlemusicelectron"

SRC_DIR="../"
DIST_DIR="./dist"
OUTPUT_DIR="$DIST_DIR/$APP_NAME-$ELECTRON_PLATFORM-$ELECTRON_ARCH"
PACKAGER_CLI="../node_modules/electron-packager/cli.js"

# Uses dpkg-deb, which is only available on Debian-based distros (?)
if ! command -v dpkg-deb >/dev/null 2>&1; then
    echo "This script can only be run on systems with dpkg-deb"
    exit 1
fi

# Make sure electron packager exists
if [ ! -f "$PACKAGER_CLI" ]; then
    echo "electron-packager not found. Please npm install"
    exit 1
fi

# Create "dist"
[ ! -d "./dist" ] && mkdir dist

# Remove temp output directory, if it exists (aborted build)
[ -d "$OUTPUT_DIR" ] && rm -r "$OUTPUT_DIR"

# Build
node "$PACKAGER_CLI" "$SRC_DIR" "$APP_NAME" \
    --platform="$ELECTRON_PLATFORM" --arch="$ELECTRON_ARCH" \
    --version="$ELECTRON_VERSION" \
    --out="$DIST_DIR" \
    --icon=../resources/google-music-electron.icns \
    --app-bundle-id="$BUNDLE_ID" --app-version="$APP_VERSION" \
    --ignore="^/.electron(\$|/)" --ignore="^/build(\$|/)" --ignore="^/resources(\$|/)" \
    --ignore="^/node_modules/(jscs|jshint|repl-client|twolfson-style)(\$|/)"

mkdir -p "$OUTPUT_DIR/opt/google-music-electron"
mv "$OUTPUT_DIR"/* "$OUTPUT_DIR/opt/google-music-electron" >/dev/null 2>&1 # Fails to copy dir into itself, but thats okay

# Remove temp output directory
# rm -r "$OUTPUT_DIR"

echo "Done!"
