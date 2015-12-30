#!/usr/bin/env node
// Load in our dependencies
var path = require('path');
var spawn = require('child_process').spawn;
var electronPath = require('electron-prebuilt');
var parseCli = require('../lib/cli-parser').parse;

// Process our arguments (catches any `--help` and `install-mpris` commands)
var program = parseCli(process.argv);

// If didn't match a command (e.g. `install-mpris`), then launch our application
if (program.args.length === 0) {
  // Find our application
  var googleMusicElectronPath = path.join(__dirname, '..');
  var args = [googleMusicElectronPath];

  // Append all arguments after our node invocation
  // e.g. `node bin/google-music-electron.js --version` -> `--version`
  args = args.concat(process.argv.slice(2));

  // Run electron on our application and forward all stdio
  spawn(electronPath, args, {stdio: [0, 1, 2]});
}
