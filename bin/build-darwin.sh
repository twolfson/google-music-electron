#!/usr/bin/env bash
# Exit on our first error and echo commands
set -e
set -x

# TODO: Move to `shelljs` or `node's execSync`

# Copy our library and `package.json` into a build directory
if test -d tmp-build; then
  rm -r tmp-build
fi
mkdir tmp-build
cp -r lib tmp-build
cp package.json tmp-build

# Navigate into our build directory
cd tmp-build

# Install our production only dependencies
npm install --production

# Navigate back to our development directory
cd -

# Resolve our electron version (e.g. 0.36.2)
electron_version="$(node --eval "console.log(require('electron-prebuilt/package.json').version);")"

# Compile our OS X application
if ! test -d dist; then
  mkdir dist
fi
src_dir="tmp-build/"
app_name="google-music-electron"
./node_modules/.bin/electron-packager "$src_dir" "$app_name" \
  --platform darwin --arch all --version "$electron_version" \
  --out dist/
