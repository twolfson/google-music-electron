#!/usr/bin/env node
// Load in our dependencies
var path = require('path');
var spawn = require('child_process').spawn;

// Find our application
var googleMusicElectronPath = path.join(__dirname, '..');
var args = [googleMusicElectronPath];

// Append all arguments after our node invocation
// e.g. `node bin/google-music-electron.js --version` -> `--version`
args = args.concat(process.argv.slice(2));

// Run electron on our application and forward all stdio
spawn('electron', args, {stdio: [0, 1, 2]});
