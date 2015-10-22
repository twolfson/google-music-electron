// Load in our dependencies
var app = require('app');
var BrowserWindow = require('browser-window');
var path = require('path');
var spawnSync = require('child_process').spawnSync;
var program = require('commander');
var replify = require('replify');
var assets = require('./assets');
var appMenu = require('./app-menu');
var appTray = require('./app-tray');
var getLogger = require('./logger');
var shortcuts = require('./shortcuts');
var mpris;
try {
  mpris = require('./mpris');
} catch (err) {
  // Optionally allow `mpris` to be installed
}

// Load in package info
var pkg = require('../package.json');

// Handle CLI arguments
program
  .version(pkg.version)
  .option('-S, --skip-taskbar', 'Skip showing the application in the taskbar')
  .option('--minimize-to-tray', 'Hide window to tray instead of minimizing')
  .option('--hide-via-tray', 'Hide window to tray instead of minimizing (only for tray icon)')
  .option('--verbose', 'Display verbose log output in stdout')
  .option('--debug-repl', 'Starts a `replify` server as `google-music-electron` for debugging')
  // Allow unknown Chromium flags
  // https://github.com/atom/electron/blob/v0.26.0/docs/api/chrome-command-line-switches.md
  .allowUnknownOption();

// Define our commands
program
  .command('install-mpris')
  .description('Install integration with MPRIS (Linux only)')
  .action(function installMrpis () {
    // Resolve our mpris dependencies
    var installArgs = Object.keys(pkg.mprisDependencies).map(function getInstallArg (dependencyName) {
      return dependencyName + '@' + pkg.mprisDependencies[dependencyName];
    });

    // Run our install command
    // DEV: We are inside of `io.js` of Electron which allows us to use the latest hotness
    var results = spawnSync(
      'npm',
      // Use `--ignore-scripts` to avoid compiling against system's node
      // Use `--save false` prevent saving to `package.json` during development
      ['install', '--ignore-scripts', '--save', 'false'].concat(installArgs),
      {cwd: path.join(__dirname, '..'), stdio: 'inherit'});

    // If there was an error, throw it
    if (results.error) {
      throw results.error;
    }

    // Rebuild electron with our new `mpris-service`
    var electronRebuildCmd = require.resolve('electron-rebuild/lib/cli.js');
    results = spawnSync(electronRebuildCmd, {cwd: path.join(__dirname, '..'), stdio: 'inherit'});

    // If there was an error, throw it
    if (results.error) {
      throw results.error;
    }

    // Log our success an exit
    console.log('MPRIS integration successfully installed! Please start `google-music-electron` to see it in action!');
    app.quit();
  });

// Process our arguments
program.parse(process.argv);

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
      icon: assets['icon-32'],
      width: 400
    });
    aboutWindow.loadUrl('data:text/html,' + info);
  },
  openConfigWindow: function () {
    logger.debug('Showing `config` window for `google-music-electron`');
    // DEV: configWindow will be garbage collection automatically
    var configWindow = new BrowserWindow({
      height: 440,
      icon: assets['icon-32'],
      width: 620
    });
    configWindow.loadUrl('file://' + __dirname + '/views/config.html');
  },
  quitApplication: function () {
    logger.debug('Exiting `google-music-electron`');
    app.quit();
  },
  reloadWindow: function () {
    logger.debug('Reloading focused browser window');
    BrowserWindow.getFocusedWindow().reload();
  },
  showMinimizedWindow: function () {
    // DEV: Focus is necessary when there is no taskbar and we have lost focus for the app
    gme.browserWindow.restore();
    gme.browserWindow.focus();
  },
  showInvisibleWindow: function () {
    gme.browserWindow.show();
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
        gme.showMinimizedWindow();
      } else {
        gme.browserWindow.minimize();
      }
    } else {
      logger.debug('Browser window minimization toggling requested but browser window as not found');
    }
  },
  toggleVisibility: function () {
    if (gme.browserWindow) {
      var isVisible = gme.browserWindow.isVisible();
      logger.debug('Toggling browser window visibility', {
        isVisible: isVisible
      });
      if (isVisible) {
        gme.browserWindow.hide();
      } else {
        gme.showInvisibleWindow();
      }
    } else {
      logger.debug('Browser window visibility toggling requested but browser window as not found');
    }
  }
};

// Assign tray click behavior
gme.onTrayClick = (program.hideViaTray || program.minimizeToTray) ? gme.toggleVisibility : gme.toggleMinimize;
gme.onRaise = (program.hideViaTray || program.minimizeToTray) ? gme.showInvisibleWindow : gme.showMinimizedWindow;

// When Electron is done loading
app.on('ready', function handleReady () {
  // TODO: Remove dev openConfigWindow
  gme.openConfigWindow();
  return;

  // Create our browser window for Google Music
  var windowOpts = {
    height: 920,
    icon: assets['icon-32'],
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

  // If hiding to tray was requested, trigger a visibility toggle when the window is minimized
  if (program.minimizeToTray) {
    gme.browserWindow.on('minimize', gme.toggleVisibility);
  }

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
  if (mpris) {
    mpris.init(gme);
  }
});
