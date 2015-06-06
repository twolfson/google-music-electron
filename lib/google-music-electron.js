// Load in our dependencies
var app = require('app');
var BrowserWindow = require('browser-window');
var program = require('commander');
var replify = require('replify');
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
  .option('--minimize-to-tray', 'Replace minimizing to taskbar with minimizing to tray')
  .option('--verbose', 'Display verbose log output in stdout')
  .option('--debug-repl', 'Starts a `replify` server as `google-music-electron` for debugging')
  // Allow unknown Chromium flags
  // https://github.com/atom/electron/blob/v0.26.0/docs/api/chrome-command-line-switches.md
  .allowUnknownOption()
  .parse(process.argv);

// Generate a logger
var logger = getLogger({verbose: program.verbose});

// Log our CLI arguments
logger.debug('CLI arguments received', {argv: process.argv});

// Report any crashes to Electron's servers
require('crash-reporter').start();

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

// Define helpers for controlling/sending messages to our window
// https://github.com/atom/electron-starter/blob/96f6117b4c1f33c0881d504d655467fc049db433/src/browser/application.coffee#L87-L104
// DEV: We are choosing to dodge classes to avoid `.bind` calls
// DEV: This must be in the top level scope, otherwise our window gets GC'd
var gme = {
  browserWindow: null,
  controlPlayPause: function () {
    if (gme.browserWindow && gme.browserWindow.webContents) {
      logger.debug('Sending `control:play-pause` to browser window');
      gme.browserWindow.webContents.send('control:play-pause');
    } else {
      logger.debug('`control:play-pause` requested but couldn\'t find browser window');
    }
  },
  controlNext: function () {
    if (gme.browserWindow && gme.browserWindow.webContents) {
      logger.debug('Sending `control:next` to browser window');
      gme.browserWindow.webContents.send('control:next');
    } else {
      logger.debug('`control:next` requested but couldn\'t find browser window');
    }
  },
  controlPrevious: function () {
    if (gme.browserWindow && gme.browserWindow.webContents) {
      logger.debug('Sending `control:previous` to browser window');
      gme.browserWindow.webContents.send('control:previous');
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
    if (gme.browserWindow) {
      var isMinimized = gme.browserWindow.isMinimized();
      logger.debug('Toggling browser window minimization', {
        isMinimized: isMinimized
      });
      if (isMinimized) {
        // DEV: Focus is necessary when there is no taskbar and we have lost focus for the app
        gme.browserWindow.restore();
        gme.browserWindow.focus();
      } else {
        gme.browserWindow.minimize();
      }
    } else {
      logger.debug('Browser window minimization toggling requested but browser window as not found');
    }
  }
};

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
  gme.browserWindow = new BrowserWindow(windowOpts);
  gme.browserWindow.loadUrl('https://play.google.com/music/listen');

  // When our window is closed, clean up the reference to our window
  gme.browserWindow.on('closed', function handleWindowClose () {
    logger.debug('Browser window closed, garbage collecting `browserWindow`');
    gme.browserWindow = null;
  });

  // Save browser window context to replify
  // http://dshaw.github.io/2012-10-nodedublin/#/
  if (program.debugRepl) {
    var replServer = replify('google-music-electron', null, {gme: gme});
    replServer.on('listening', function handleReplServerListen () {
      var socketPath = replServer.address();
      logger.info('Debug repl opened at "%s". This should be accessible via `npm run debug-repl`', socketPath);
    });
  }

  // Set up our application menu, tray, and shortcuts
  appMenu.init(gme);
  appTray.init(gme);
  shortcuts.init(gme);
});
