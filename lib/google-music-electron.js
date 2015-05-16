// Load in our dependencies
var app = require('app');
var BrowserWindow = require('browser-window');
var ipc = require('ipc');

// Report any crashes to Electron's servers
require('crash-reporter').start();

// Add a reference to our window
// DEV: This needs to be global, otherwise it will get garbage collected (and close silently)
var browserWindow = null;

// When all Windows are closed
app.on('window-all-closed', function handleWindowsClosed () {
  // If we are not on OSX, exit
  // DEV: OSX requires users to quit via the menu/cmd+q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// When Electron is done loading
app.on('ready', function handleReady () {
  // Create our browser window for Google Music
  browserWindow = new BrowserWindow({
    'use-content-size': true,
    // DEV: Allow user to peek at their quick selection
    height: 680,
    // Load in our Google Music bindings on the page
    preload: __dirname + '/browser.js',
    // DEV: 960 seems to be minimum width for Google Music
    width: 960
  });
  browserWindow.loadUrl('https://play.google.com/music/listen');

  // When our window is closed, clean up the reference to our window
  browserWindow.on('closed', function handleWindowClose () {
    browserWindow = null;
  });

  // When we receive an ipc message, log it
  ipc.on('change:song', function handleIpcMessage (evt, songInfo) {
    console.log('Song changed', songInfo);
  });
  ipc.on('change:playback', function handleIpcMessage (evt, songInfo) {
    console.log('Playback changed', songInfo);
  });

  // When we receive a keypress to play music
});
