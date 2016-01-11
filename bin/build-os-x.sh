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

# Compile our OS X application
# TODO: Figure out command here
