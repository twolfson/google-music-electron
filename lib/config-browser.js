// Load in our dependencies
// DEV: Relative paths are loaded from `views/`
var config = require('../config');

// When the DOM loads
window.addEventListener('DOMContentLoaded', function handleDOMLoad () {
  // Fill out existing values
  var $playpauseShortcut = document.getElementById('playpause-shortcut');
  var $nextShortcut = document.getElementById('next-shortcut');
  var $previousShortcut = document.getElementById('previous-shortcut');
  $playpauseShortcut.value = config.get('playpause-shortcut');
  $nextShortcut.value = config.get('next-shortcut');
  $previousShortcut.value = config.get('previous-shortcut');

  // Add change bindings
  console.log('sup');
});
