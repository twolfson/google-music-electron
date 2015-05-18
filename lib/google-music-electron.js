// Load in our dependencies
var app = require('app');
var BrowserWindow = require('browser-window');
var program = require('commander');
var appMenu = require('./app-menu');
var appTray = require('./app-tray');
var getLogger = require('./logger');
var shortcuts = require('./shortcuts');

// Load in package info
var pkg = require('../package.json');

// Handle CLI arguments
program
  .version(pkg.version)
  .option('-S, --skip-taskbar', 'Skip showing the application in the taskbar')
  .option('--verbose', 'Display verbose log output in stdout')
  .parse(process.argv);

// Generate a logger
var logger = getLogger({verbose: program.verbose});

// Log our CLI arguments
logger.debug('CLI arguments received', {argv: process.argv});

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
    logger.debug('All windows closed. Exiting application');
    app.quit();
  } else {
    logger.debug('All windows closed but not exiting because OSX');
  }
});

// When Electron is done loading
app.on('ready', function handleReady () {
  // Create our browser window for Google Music
  var windowOpts = {
    height: 920,
    // Load in our Google Music bindings on the page
    preload: __dirname + '/browser.js',
    'skip-taskbar': program.skipTaskbar,
    'use-content-size': true,
    width: 1024
  };
  logger.info('App ready. Opening Google Music window', {
    options: windowOpts,
    processVersions: process.versions,
    version: pkg.version
  });
  browserWindow = new BrowserWindow(windowOpts);
  browserWindow.loadUrl('https://play.google.com/music/listen');

  // When our window is closed, clean up the reference to our window
  browserWindow.on('closed', function handleWindowClose () {
    logger.debug('Browser window closed, garbage collecting `browserWindow`');
    browserWindow = null;
  });

  // Define helpers for controlling/sending messages to our window
  // https://github.com/atom/electron-starter/blob/96f6117b4c1f33c0881d504d655467fc049db433/src/browser/application.coffee#L87-L104
  // DEV: We are choosing to dodge classes to avoid `.bind` calls
  var googleMusicElectron = {
    controlPlayPause: function () {
      if (browserWindow && browserWindow.webContents) {
        logger.debug('Sending `control:play-pause` to browser window');
        browserWindow.webContents.send('control:play-pause');
      } else {
        logger.debug('`control:play-pause` requested but couldn\'t find browser window');
      }
    },
    controlNext: function () {
      if (browserWindow && browserWindow.webContents) {
        logger.debug('Sending `control:next` to browser window');
        browserWindow.webContents.send('control:next');
      } else {
        logger.debug('`control:next` requested but couldn\'t find browser window');
      }
    },
    controlPrevious: function () {
      if (browserWindow && browserWindow.webContents) {
        logger.debug('Sending `control:previous` to browser window');
        browserWindow.webContents.send('control:previous');
      } else {
        logger.debug('`control:previous` requested but couldn\'t find browser window');
      }
    },
    logger: logger,
    openAboutWindow: function () {
      logger.debug('Showing `about` window for `google-music-electron`');
      var info = [
        // https://github.com/corysimmons/typographic/blob/2.9.3/scss/typographic.scss#L34
        '<div style="text-align: center; font-family: \'Helvetica Neue\', \'Helvetica\', \'Arial\', \'sans-serif\'">',
          '<h1>google-music-electron</h1>',
          '<p>',
            'Version: ' + pkg.version,
            '<br/>',
            'Electron version: ' + process.versions.electron,
            '<br/>',
            'Chromium version: ' + process.versions.chrome,
          '</p>',
        '</div>'
      ].join('');
      // DEV: aboutWindow will be garbage collection automatically
      var aboutWindow = new BrowserWindow({
        height: 180,
        width: 400
      });
      aboutWindow.loadUrl('data:text/html,' + info);
    },
    quitApplication: function () {
      logger.debug('Exiting `google-music-electron`');
      app.quit();
    },
    reloadWindow: function () {
      logger.debug('Reloading focused browser window');
      BrowserWindow.getFocusedWindow().reload();
    },
    toggleDevTools: function () {
      logger.debug('Toggling developer tools in focused browser window');
      BrowserWindow.getFocusedWindow().toggleDevTools();
    },
    toggleFullScreen: function () {
      var focusedWindow = BrowserWindow.getFocusedWindow();
      // Move to other full screen state (e.g. true -> false)
      var wasFullScreen = focusedWindow.isFullScreen();
      var toggledFullScreen = !wasFullScreen;
      logger.debug('Toggling focused browser window full screen', {
        wasFullScreen: wasFullScreen,
        toggledFullScreen: toggledFullScreen
      });
      focusedWindow.setFullScreen(toggledFullScreen);
    },
    toggleMinimize: function () {
      if (browserWindow) {
        var isMinimized = browserWindow.isMinimized;
        logger.debug('Toggling browser window minimization', {
          isMinimized: isMinimized
        });
        if (isMinimized) {
          browserWindow.restore();
        } else {
          browserWindow.minimize();
        }
      } else {
        logger.debug('Browser window minimization toggling requested but browser window as not found');
      }
    }
  };

  // Set up our application menu, tray, and shortcuts
  appMenu.init(googleMusicElectron);
  appTray.init(googleMusicElectron);
  shortcuts.init(googleMusicElectron);
});
