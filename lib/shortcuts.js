// Load in our dependencies
var globalShortcut = require('electron').globalShortcut;
var ipcMain = require('electron').ipcMain;

// Define a function to bind shortcuts
exports.init = function (gme) {
  // Set up media keys
  var shortcutCallbacks = {
    'playpause-shortcut': gme.controlPlayPause,
    'next-shortcut': gme.controlNext,
    'previous-shortcut': gme.controlPrevious
  };
  var playpauseShortcut = gme.config.get('playpause-shortcut');
  if (playpauseShortcut && !globalShortcut.register(playpauseShortcut, shortcutCallbacks['playpause-shortcut'])) {
    gme.logger.warn('Failed to bind `' + playpauseShortcut + '` shortcut');
  }
  var nextShortcut = gme.config.get('next-shortcut');
  if (nextShortcut && !globalShortcut.register(nextShortcut, shortcutCallbacks['next-shortcut'])) {
    gme.logger.warn('Failed to bind `' + nextShortcut + '` shortcut');
  }
  var previousShortcut = gme.config.get('previous-shortcut');
  if (previousShortcut && !globalShortcut.register(previousShortcut, shortcutCallbacks['previous-shortcut'])) {
    gme.logger.warn('Failed to bind `' + previousShortcut + '` shortcut');
  }

  // When a shortcut change is requested
  ipcMain.on('set-shortcut-sync', function handleShortcutChange (evt, shortcutName, accelerator) {
    // Prepare common set of results
    var previousAccelerator = gme.config.get(shortcutName);
    var retVal = {
      success: false,
      previousAccelerator: previousAccelerator,
      accelerator: accelerator
    };

    // If the accelerator is the same as the current one, exit with success
    if (previousAccelerator === accelerator) {
      retVal.success = true;
      evt.returnValue = JSON.stringify(retVal);
      return;
    }

    // If the accelerator is nothing, then consider it a success
    if (accelerator === '') {
      retVal.success = true;
    // Otherwise, attempt to register the new shortcut
    } else {
      gme.logger.info('Attempting to register shortcut "' + shortcutName + '" under "' + accelerator + '"');
      try {
        retVal.success = globalShortcut.register(accelerator, shortcutCallbacks[shortcutName]);
        gme.logger.info('Registration successful');
      } catch (err) {
        // Catch any unrecognized accelerators
      }
    }

    // If we were successful, remove the last binding and update our config
    if (retVal.success) {
      if (previousAccelerator) {
        gme.logger.info('Unregistering shortcut "' +
          shortcutName + '" from "' + previousAccelerator + '"');
        globalShortcut.unregister(previousAccelerator);
      }

      gme.logger.info('Updating config...');
      gme.config.set(shortcutName, accelerator);
    // Otherwise, log failure
    } else {
      gme.logger.info('Registration failed. Couldn\'t register shortcut "' +
        shortcutName + '" to "' + accelerator + '"');
    }

    // In any event, return with our success status
    evt.returnValue = JSON.stringify(retVal);
  });
};
