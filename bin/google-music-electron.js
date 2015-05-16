#!/usr/bin/env node
// Load in our dependencies
var path = require('path');
var spawn = require('child_process').spawn;

// Run electron on our application and forward all stdio
var googleMusicElectronPath = path.join(__dirname, '..');
spawn('electron', [googleMusicElectronPath], {stdio: [0, 1, 2]});
