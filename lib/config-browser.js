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
    var $output = $shortcutContainer.querySelector('.output');
    $input.value = config.get(shortcutName);

    // Add change binding for our shortcut
    $input.addEventListener('change', function handleShortcutChange (evt) {
      // Register our new handler
      var result = JSON.parse(ipc.sendSync('set-shortcut', shortcutName, $input.value));

      // Reset output state
      $output.classList.remove('success');
      $output.classList.remove('error');

      // Provide feedback to user
      if (result.success === false) {
        $output.classList.add('error');
        $output.textContent = 'Failed to bind shortcut "' + result.accelerator + '". ' +
          'Keeping current shortcut "' + result.previousAccelerator + '".';
      } else if (result.previousAccelerator === result.accelerator) {
        $output.textContent = '';
      } else {
        $output.classList.add('success');
        $output.textContent = 'Successfully moved from "' + result.previousAccelerator + '" ' +
          'to "' + result.accelerator + '"!';
      }
    });
  });
});
