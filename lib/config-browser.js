// Load in our dependencies
var ipc = require('ipc');

// When the DOM loads
window.addEventListener('DOMContentLoaded', function handleDOMLoad () {
  // Request our config
  var config = JSON.parse(ipc.sendSync('get-config-sync'));
  var configInfo = JSON.parse(ipc.sendSync('get-config-info-sync'));

  // Find and bind all known shortcuts
  var $shortcutContainers = document.querySelectorAll('[data-save-shortcut]');
  [].slice.call($shortcutContainers).forEach(function bindShortcut ($shortcutContainer) {
    // Fill in our existing value
    var shortcutName = $shortcutContainer.dataset.saveShortcut;
    var $input = $shortcutContainer.querySelector('input[type=text]');
    var $output = $shortcutContainer.querySelector('.output');
    $input.value = config[shortcutName];

    // Add change binding for our shortcut
    $input.addEventListener('change', function handleShortcutChange (evt) {
      // Register our new handler
      var result = JSON.parse(ipc.sendSync('set-shortcut-sync', shortcutName, $input.value));

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

  // Find and bind all known checkboxes
  var $checkboxContainers = document.querySelectorAll('[data-save-checkbox]');
  [].slice.call($checkboxContainers).forEach(function bindCheckbox ($checkboxContainer) {
    // Fill in our existing value
    var configItemName = $checkboxContainer.dataset.saveCheckbox;
    var $input = $checkboxContainer.querySelector('input[type=checkbox]');
    $input.checked = config[configItemName];
    if (configInfo[configItemName]) {
      var $cliFlags = $checkboxContainer.querySelector('.cli-flags');
      // e.g. Overridden by `-S, --skip-taskbar` in CLI
      $cliFlags.textContent = configInfo[configItemName].flags;
      var $description = $checkboxContainer.querySelector('.description');
      // e.g. Skip showing the application in the taskbar
      $description.textContent = configInfo[configItemName].description;
    }

    // Add change binding for our setting
    $input.addEventListener('change', function handleCheckboxChange (evt) {
      // Update our setting
      var result = JSON.parse(ipc.sendSync('set-config-item-sync', configItemName, $input.checked));

      // If there was an error, complain about it
      if (result.success === false) {
        window.alert('Attempted to set "' + configItemName + '" to "' + $input.checked + '" but failed. ' +
          'Please see console output for more info.');
      }
    });
  });
});
