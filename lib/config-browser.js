// Load in our dependencies
var ipcRenderer = require('electron').ipcRenderer;

// When the DOM loads
window.addEventListener('DOMContentLoaded', function handleDOMLoad () {
  // Request our config
  var config = JSON.parse(ipcRenderer.sendSync('get-config-sync'));
  var configInfo = JSON.parse(ipcRenderer.sendSync('get-config-info-sync'));
  var configOverrides = JSON.parse(ipcRenderer.sendSync('get-config-overrides-sync'));

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
      var result = JSON.parse(ipcRenderer.sendSync('set-shortcut-sync', shortcutName, $input.value));

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

    // If our config item is overridden, then disable it
    if (configOverrides[configItemName] !== undefined) {
      $checkboxContainer.classList.add('muted');
      $input.disabled = true;
      var $overriddenSpan = $checkboxContainer.querySelector('.overridden');
      $overriddenSpan.classList.remove('hidden');
    }

    // If we have config information, fill out that content as well
    if (configInfo[configItemName]) {
      var $cliFlags = $checkboxContainer.querySelector('.cli-flags');
      // e.g. Overridden by `-S, --skip-taskbar` in CLI
      $cliFlags.textContent = configInfo[configItemName].flags;
      var $description = $checkboxContainer.querySelector('.description');
      // e.g. Skip showing the application in the taskbar
      $description.textContent += configInfo[configItemName].description;
    }

    // If the container is mutually exclusive
    var $unsetTarget;
    if ($checkboxContainer.dataset.unsetCheckbox) {
      $unsetTarget = document.querySelector($checkboxContainer.dataset.unsetCheckbox);
    }

    // Add change binding for our setting
    $input.addEventListener('change', function handleCheckboxChange (evt) {
      // Update our setting
      var result = JSON.parse(ipcRenderer.sendSync('set-config-item-sync', configItemName, $input.checked));

      // If there was an error, complain about it
      if (result.success === false) {
        window.alert('Attempted to set "' + configItemName + '" to "' + $input.checked + '" but failed. ' +
          'Please see console output for more info.');
      }

      // If there is a target to unset and we are truthy, unset them and trigger a change
      if ($unsetTarget && $input.checked) {
        // http://youmightnotneedjquery.com/#trigger_native
        $unsetTarget.checked = false;
        var triggerEvt = document.createEvent('HTMLEvents');
        triggerEvt.initEvent('change', true, false);
        $unsetTarget.dispatchEvent(triggerEvt);
      }
    });
  });
});
