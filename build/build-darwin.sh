#!/bin/sh

ELECTRON_VERSION="0.30.3"
ELECTRON_PLATFORM="darwin"
ELECTRON_ARCH="x64"

APP_NAME="Google Music Electron"
APP_VERSION="1.18.0"
BUNDLE_ID="com.twolfson.googlemusicelectron"

SRC_DIR="../"
DIST_DIR="./dist"
OUTPUT_DIR="$DIST_DIR/$APP_NAME-$ELECTRON_PLATFORM-$ELECTRON_ARCH/"
PACKAGER_CLI="../node_modules/electron-packager/cli.js"

# Uses hdiutil, which is only available on Mac OS X
if [ "$(uname)" != "Darwin" ]; then
    echo "This script can only be run on Mac OS X"
    exit 1
fi

# Make sure electron packager exists
if [ ! -f "$PACKAGER_CLI" ]; then
    echo "electron-packager not found. Please npm install"
    exit 1
fi

# Remove temp output directory, if it exists (aborted build)
[[ -d "$OUTPUT_DIR" ]] && rm -r "$OUTPUT_DIR"

# Build
node "$PACKAGER_CLI" "$SRC_DIR" "$APP_NAME" \
    --platform="$ELECTRON_PLATFORM" --arch="$ELECTRON_ARCH" \
    --version="$ELECTRON_VERSION" \
    --out="$DIST_DIR" \
    --icon=../resources/google-music-electron.icns \
    --app-bundle-id="$BUNDLE_ID" --app-version="$APP_VERSION" \
    --ignore="^/.electron(\$|/)" --ignore="^/build(\$|/)" --ignore="^/resources(\$|/)" \
    --ignore="^/node_modules/(jscs|jshint|repl-client|twolfson-style)(\$|/)"

# Create "dist"
[[ ! -d "./dist" ]] && mkdir dist

# Create .dmg file for Mac OS X
echo "Creating disk image"
hdiutil create "./dist/google-music-electron-$APP_VERSION.dmg" -srcfolder "$OUTPUT_DIR" -ov

# Remove temp output directory
rm -r "$OUTPUT_DIR"

echo "Done!"