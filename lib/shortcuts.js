// Load in our dependencies
var globalShortcut = require('global-shortcut');

// Define a function to bind shortcuts
exports.init = function (methods) {
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
};
