// Load in our dependencies
var app = require('app');
var BrowserWindow = require('browser-window');
var globalShortcut = require('global-shortcut');
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
    height: 920,
    // Load in our Google Music bindings on the page
    preload: __dirname + '/browser.js',
    width: 1024
  });
  browserWindow.loadUrl('https://play.google.com/music/listen');

  // When our window is closed, clean up the reference to our window
  browserWindow.on('closed', function handleWindowClose () {
    browserWindow = null;
  });

  // Define helpers for sending messages to our window
  function controlPlayPause() {
    if (browserWindow.webContents) {
      browserWindow.webContents.send('control:play-pause');
    }
  }
  function controlNext() {
    if (browserWindow.webContents) {
      browserWindow.webContents.send('control:next');
    }
  }
  function controlPrevious() {
    if (browserWindow.webContents) {
      browserWindow.webContents.send('control:previous');
    }
  }

  // Set up our tray
  var trayMenu = new Menu();
  trayMenu.append(new MenuItem({
    label: 'Play/Pause',
    click: controlPlayPause
  }));
  trayMenu.append(new MenuItem({
    label: 'Next',
    click: controlNext
  }));
  trayMenu.append(new MenuItem({
    label: 'Previous',
    click: controlPrevious
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

  // When the song changes, update our tooltip
  ipc.on('change:song', function handleSongChange (evt, songInfo) {
    var infoStr = [
      'Title: ' + songInfo.title,
      'Artist: ' + songInfo.artist,
      'Album: ' + songInfo.album,
    ].join('\n');
    tray.setToolTip(infoStr);
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

  // Set up media keys
  if (!globalShortcut.register('mediaplaypause', controlPlayPause)) {
    console.log('Failed to bind `mediaplaypause` shortcut');
  }
  if (!globalShortcut.register('medianexttrack', controlNext)) {
    console.log('Failed to bind `medianexttrack` shortcut');
  }
  if (!globalShortcut.register('mediaprevioustrack', controlPrevious)) {
    console.log('Failed to bind `mediaprevioustrack` shortcut');
  }
});
