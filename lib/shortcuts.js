// Load in our dependencies
var globalShortcut = require('global-shortcut');

// Define a function to bind shortcuts
exports.init = function (googleMusicElectron) {
  // Set up media keys
  if (!globalShortcut.register('mediaplaypause', googleMusicElectron.controlPlayPause)) {
    console.log('Failed to bind `mediaplaypause` shortcut');
  }
  if (!globalShortcut.register('medianexttrack', googleMusicElectron.controlNext)) {
    console.log('Failed to bind `medianexttrack` shortcut');
  }
  if (!globalShortcut.register('mediaprevioustrack', googleMusicElectron.controlPrevious)) {
    console.log('Failed to bind `mediaprevioustrack` shortcut');
  }
};
