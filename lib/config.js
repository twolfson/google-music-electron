// Load in our dependencies
var ipc = require('ipc');
var _ = require('underscore');
var Configstore = require('configstore');
var pkg = require('../package.json');

// Define config setup
module.exports = function (cliOverrides, cliInfo) {
  // Create our config
  var config = new Configstore(pkg.name, _.extend({
    'playpause-shortcut': 'mediaplaypause',
    'next-shortcut': 'medianexttrack',
    'previous-shortcut': 'mediaprevioustrack'
  }, cliOverrides));

  // Generate IPC bindings for config and its info
  ipc.on('get-config-sync', function handleGetConfigSync (evt) {
    evt.returnValue = JSON.stringify(config.all);
  });
  ipc.on('get-config-info-sync', function handleGetConfigInfoSync (evt) {
    evt.returnValue = JSON.stringify(cliInfo);
  });

  // Return our config
  return config;
};
