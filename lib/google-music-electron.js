// Load in our dependencies
var app = require('app');
var BrowserWindow = require('browser-window');
var globalShortcut = require('global-shortcut');
var ipc = require('ipc');
var Menu = require('menu');
var MenuItem = require('menu-item');
var Tray = require('tray');
var GoogleMusic = require('google-music');
var appMenu = require('./app-menu');

// Load in package info
var pkg = require('../package.json');

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

  // Define helpers for controlling/sending messages to our window
  // https://github.com/atom/electron-starter/blob/96f6117b4c1f33c0881d504d655467fc049db433/src/browser/application.coffee#L87-L104
  // DEV: We are choosing to dodge classes to avoid `.bind` calls
  var methods = {
    controlPlayPause: function () {
      if (browserWindow.webContents) {
        browserWindow.webContents.send('control:play-pause');
      }
    },
    controlNext: function () {
      if (browserWindow.webContents) {
        browserWindow.webContents.send('control:next');
      }
    },
    controlPrevious: function () {
      if (browserWindow.webContents) {
        browserWindow.webContents.send('control:previous');
      }
    },
    openAboutWindow: function () {
      var info = [
        '<div style="text-align: center;">',
          '<h1>google-music-electron</h1>',
          '<p>Version: ' + pkg.version + '</p>',
        '</div>'
      ].join('');
      // DEV: aboutWindow will be garbage collection automatically
      var aboutWindow = new BrowserWindow({
        height: 150,
        width: 400
      });
      aboutWindow.loadUrl('data:text/html,' + info);
    },
    quitApplication: function () {
      app.quit();
    },
    reloadWindow: function () {
      BrowserWindow.getFocusedWindow().reload();
    },
    toggleFullScreen: function () {
      var focusedWindow = BrowserWindow.getFocusedWindow();
      // Move to other full screen state (e.g. true -> false)
      var fullScreen = !focusedWindow.isFullScreen();
      focusedWindow.setFullScreen(fullScreen);
    },
    toggleDevTools: function () {
      BrowserWindow.getFocusedWindow().toggleDevTools();
    }
  };

  // Set up our application menu, tray, and shortcuts
  appMenu.init();

  // Set up our tray
  var trayMenu = new Menu();
  trayMenu.append(new MenuItem({
    label: 'Play/Pause',
    click: methods.controlPlayPause
  }));
  trayMenu.append(new MenuItem({
    label: 'Next',
    click: methods.controlNext
  }));
  trayMenu.append(new MenuItem({
    label: 'Previous',
    click: methods.controlPrevious
  }));
  trayMenu.append(new MenuItem({
    type: 'separator'
  }));
  trayMenu.append(new MenuItem({
    label: 'Quit',
    click: methods.quitApplication
  }));
  var tray = new Tray(__dirname + '/assets/icon.png');
  tray.setContextMenu(trayMenu);

  // When the song changes, update our tooltip
  ipc.on('change:song', function handleSongChange (evt, songInfo) {
    var infoStr = [
      'Title: ' + songInfo.title,
      'Artist: ' + songInfo.artist,
      'Album: ' + songInfo.album
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
  if (!globalShortcut.register('mediaplaypause', methods.controlPlayPause)) {
    console.log('Failed to bind `mediaplaypause` shortcut');
  }
  if (!globalShortcut.register('medianexttrack', methods.controlNext)) {
    console.log('Failed to bind `medianexttrack` shortcut');
  }
  if (!globalShortcut.register('mediaprevioustrack', methods.controlPrevious)) {
    console.log('Failed to bind `mediaprevioustrack` shortcut');
  }
});
