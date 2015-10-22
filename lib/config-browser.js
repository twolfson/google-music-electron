// Load in our dependencies
// DEV: Relative paths are loaded from `views/`
var ipc = require('ipc');
var config = require('../config');

// When the DOM loads
window.addEventListener('DOMContentLoaded', function handleDOMLoad () {
  // Find and bind all known shortcuts
  var $shortcutContainers = document.querySelectorAll('[data-save-shortcut]');
  [].slice.call($shortcutContainers).forEach(function bindShortcut ($shortcutContainer) {
    // Fill in our existing value
    var shortcutName = $shortcutContainer.dataset.saveShortcut;
    var $input = $shortcutContainer.querySelector('input[type=text]');
    $input.value = config.get(shortcutName);

    // Add change binding for our shortcut
    $input.addEventListener('change', function handleShortcutChange (evt) {
      console.log($input.value);
    });
  });
});
