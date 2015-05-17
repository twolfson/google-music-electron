// Load in our dependencies
var app = require('app');
var BrowserWindow = require('browser-window');
var appMenu = require('./app-menu');
var appTray = require('./app-tray');
var shortcuts = require('./shortcuts');

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
    toggleDevTools: function () {
      BrowserWindow.getFocusedWindow().toggleDevTools();
    },
    toggleFullScreen: function () {
      var focusedWindow = BrowserWindow.getFocusedWindow();
      // Move to other full screen state (e.g. true -> false)
      var toggledFullScreen = !focusedWindow.isFullScreen();
      focusedWindow.setFullScreen(toggledFullScreen);
    },
    toggleMinimize: function () {
      if (browserWindow.isMinimized()) {
        browserWindow.restore();
      } else {
        browserWindow.minimize();
      }
    }
  };

  // Set up our application menu, tray, and shortcuts
  appMenu.init(methods);
  appTray.init(methods);
  shortcuts.init(methods);
});
