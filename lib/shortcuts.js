// Load in our dependencies
var globalShortcut = require('global-shortcut');

// Define a function to bind shortcuts
exports.init = function (gme) {
  // Set up media keys
  if (!globalShortcut.register('mediaplaypause', gme.controlPlayPause)) {
    gme.logger.warn('Failed to bind `mediaplaypause` shortcut');
  }
  if (!globalShortcut.register('medianexttrack', gme.controlNext)) {
    gme.logger.warn('Failed to bind `medianexttrack` shortcut');
  }
  if (!globalShortcut.register('mediaprevioustrack', gme.controlPrevious)) {
    gme.logger.warn('Failed to bind `mediaprevioustrack` shortcut');
  }
};
