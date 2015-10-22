// Load in our dependencies
var ipc = require('ipc');
var _ = require('underscore');
var Configstore = require('configstore');
var pkg = require('../package.json');

// Define config setup
module.exports = function (cliOverrides, cliInfo) {
  // Create our config
  var config = new Configstore(pkg.name, _.defaults({}, cliOverrides, {
    'playpause-shortcut': 'mediaplaypause',
    'next-shortcut': 'medianexttrack',
    'previous-shortcut': 'mediaprevioustrack'
  }));

  // Generate IPC bindings for config and its info
  ipc.on('get-config-sync', function handleGetConfigSync (evt) {
    evt.returnValue = JSON.stringify(config.all);
  });
  ipc.on('get-config-info-sync', function handleGetConfigInfoSync (evt) {
    evt.returnValue = JSON.stringify(cliInfo);
  });
  ipc.on('set-config-item-sync', function handleSetConfigItemSync (evt, key, val) {
    config.set(key, val);
    evt.returnValue = JSON.stringify({success: true});
  });

  // Return our config
  return config;
};
