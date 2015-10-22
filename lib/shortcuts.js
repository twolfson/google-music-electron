// Load in our dependencies
var globalShortcut = require('global-shortcut');
var ipc = require('ipc');
var config = require('./config');

// Define a function to bind shortcuts
exports.init = function (gme) {
  // Set up media keys
  var shortcutCallbacks = {
    'playpause-shortcut': gme.controlPlayPause,
    'next-shortcut': gme.controlNext,
    'previous-shortcut': gme.controlPrevious
  };
  var playpauseShortcut = config.get('playpause-shortcut');
  if (!globalShortcut.register(playpauseShortcut, shortcutCallbacks['playpause-shortcut'])) {
    gme.logger.warn('Failed to bind `' + playpauseShortcut + '` shortcut');
  }
  var nextShortcut = config.get('next-shortcut');
  if (!globalShortcut.register(nextShortcut, shortcutCallbacks['next-shortcut'])) {
    gme.logger.warn('Failed to bind `' + nextShortcut + ' + ` shortcut');
  }
  var previousShortcut = config.get('previous-shortcut');
  if (!globalShortcut.register(previousShortcut, shortcutCallbacks['previous-shortcut'])) {
    gme.logger.warn('Failed to bind `' + previousShortcut + '` shortcut');
  }

  // When a shortcut change is requested
  ipc.on('set-shortcut', function handleShortcutChange (evt, shortcutName, accelerator) {
    // If the accelerator is the same as the current one, exit with success
    var currentAccelerator = config.get(shortcutName);
    if (currentAccelerator === accelerator) {
      evt.returnValue = {success: true};
      return;
    }

    // Attempt to register the new shortcut
    gme.logger.info('Attempting to register shortcut "' + shortcutName + '" under "' + accelerator + '"');
    var success = globalShortcut.register(accelerator, shortcutCallbacks[shortcutName]);

    // If we were successful, remove the last binding
    if (success) {
      gme.logger.info('Registration successful. Unregistering shortcut "' +
        shortcutName + '" from "' + currentAccelerator + '"');
      globalShortcut.unregister(currentAccelerator);
    // Otherwise, log failure
    } else {
      gme.logger.info('Registration failed. Couldn\'t register shortcut "' +
        shortcutName + '" to "' + accelerator + '"');
    }

    // In any event, return with our success status
    evt.returnValue = {success: success};
  });
};
