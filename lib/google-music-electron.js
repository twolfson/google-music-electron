// Load in our dependencies
var app = require('app');
var BrowserWindow = require('browser-window');
var globalShortcut = require('global-shortcut');
var ipc = require('ipc');
var Menu = require('menu');
var MenuItem = require('menu-item');
var Tray = require('tray');
var GoogleMusic = require('google-music');

// Load in package info
var pkg = require('../package.json');

// Load in JSON for our menus (e.g. `./menus/linux.json`)
// https://github.com/atom/electron-starter/blob/96f6117b4c1f33c0881d504d655467fc049db433/src/browser/appmenu.coffee#L15
var menuTemplate = require('./menus/' + process.platform + '.json');

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
  function openAboutWindow() {
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
  }
  function quitApplication() {
    app.quit();
  }
  function reloadWindow() {
    BrowserWindow.getFocusedWindow().reload();
  }
  function toggleFullScreen() {
    var focusedWindow = BrowserWindow.getFocusedWindow();
    // Move to other full screen state (e.g. true -> false)
    var fullScreen = !focusedWindow.isFullScreen();
    focusedWindow.setFullScreen(fullScreen);
  }
  function toggleDevTools() {
    BrowserWindow.getFocusedWindow().toggleDevTools();
  }

  // Parse and set up our menu
  // https://github.com/atom/electron-starter/blob/96f6117b4c1f33c0881d504d655467fc049db433/src/browser/appmenu.coffee#L27-L41
  function bindMenuItems(menuItems) {
    menuItems.forEach(function bindMenuItemFn (menuItem) {
      // If there is a selector, continue
      // DEV: This is an OSX specific binding
      if (menuItem.selector !== undefined) {
        return;
      }

      // If there is a submenu, recurse it
      if (menuItem.submenu) {
        bindMenuItems(menuItem.submenu);
        return;
      }

      // Otherwise, find the function for our command
      var cmd = menuItem.command;
      if (cmd === 'application:about') {
        menuItem.click = openAboutWindow;
      } else if (cmd === 'application:quit') {
        menuItem.click = quitApplication;
      } else if (cmd === 'window:reload') {
        menuItem.click = reloadWindow;
      } else if (cmd === 'window:toggle-dev-tools') {
        menuItem.click = toggleDevTools;
      } else if (cmd === 'window:toggle-full-screen') {
        menuItem.click = toggleFullScreen;
      } else {
        throw new Error('Could not find function for menu command "' + cmd + '" ' +
          'under label "' + menuItem.label + '"');
      }
    });
  }
  bindMenuItems(menuTemplate.menu);
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate.menu));

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
    click: quitApplication
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
