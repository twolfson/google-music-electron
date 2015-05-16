// Load in our dependencies
var app = require('app');
var BrowserWindow = require('browser-window');
var ipc = require('ipc');
var Menu = require('menu');
var MenuItem = require('menu-item');
var Tray = require('tray');
var GoogleMusic = require('google-music');

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

  // Define helpers for sending messages to our window
  function sendPlayPause() {
    if (browserWindow.webContents) {
      browserWindow.webContents.send('control:play-pause');
    }
  }
  function sendNext() {
    if (browserWindow.webContents) {
      browserWindow.webContents.send('control:next');
    }
  }
  function sendPrevious() {
    if (browserWindow.webContents) {
      browserWindow.webContents.send('control:previous');
    }
  }

  // Set up our tray
  var trayMenu = new Menu();
  trayMenu.append(new MenuItem({
    label: 'Play/Pause',
    click: sendPlayPause
  }));
  trayMenu.append(new MenuItem({
    label: 'Next',
    click: sendNext
  }));
  trayMenu.append(new MenuItem({
    label: 'Previous',
    click: sendPrevious
  }));
  trayMenu.append(new MenuItem({
    type: 'separator'
  }));
  trayMenu.append(new MenuItem({
    label: 'Quit',
    click: function () {
      app.quit();
    }
  }));
  var tray = new Tray(__dirname + '/assets/icon.png');
  tray.setContextMenu(trayMenu);

  // When we receive an ipc message, log it
  ipc.on('change:song', function handleIpcMessage (evt, songInfo) {
    console.log('Song changed', songInfo);
  });

  // When the playback state changes, update the icon
  ipc.on('change:playback', function handlePlaybackChange (evt, playbackState) {
    // Determine which icon to display based on state
    // By default, render the clean icon (stopped state)
    var icon = __dirname + '/assets/icon.png';
    if (playbackState === GoogleMusic.Playback.PLAYING) {
      icon = __dirname + '/assets/icon-playing.png';
    } else if (playbackState === GoogleMusic.Playback.PAUSED) {
      icon = __dirname + '/assets/icon-paused.png';
    }

    // Update the icon
    tray.setImage(icon);
  });
});
