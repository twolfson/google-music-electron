// Load in our dependencies
var globalShortcut = require('global-shortcut');
var config = require('./config');

// Define a function to bind shortcuts
exports.init = function (gme) {
  // Set up media keys
  var playpauseShortcut = config.get('playpause-shortcut');
  if (!globalShortcut.register(playpauseShortcut, gme.controlPlayPause)) {
    gme.logger.warn('Failed to bind `' + playpauseShortcut + '` shortcut');
  }
  var nextShortcut = config.get('next-shortcut');
  if (!globalShortcut.register(nextShortcut, gme.controlNext)) {
    gme.logger.warn('Failed to bind `' + nextShortcut + ' + ` shortcut');
  }
  var previousShortcut = config.get('previous-shortcut');
  if (!globalShortcut.register(previousShortcut, gme.controlPrevious)) {
    gme.logger.warn('Failed to bind `' + previousShortcut + '` shortcut');
  }
};
