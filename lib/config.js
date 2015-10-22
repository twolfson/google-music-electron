// Load in our dependencies
var ipc = require('ipc');
var _ = require('underscore');
var Configstore = require('configstore');
var pkg = require('../package.json');

// Define config setup
function GmeConfig(cliOverrides, cliInfo) {
  // Load our config onto this class
  Configstore.call(this, pkg.name, {
    'playpause-shortcut': 'mediaplaypause',
    'next-shortcut': 'medianexttrack',
    'previous-shortcut': 'mediaprevioustrack'
  });

  // Generate IPC bindings for config and its info
  var that = this;
  ipc.on('get-config-sync', function handleGetConfigSync (evt) {
    evt.returnValue = JSON.stringify(_.defaults({}, cliOverrides, that.all);
  });
  ipc.on('get-config-info-sync', function handleGetConfigInfoSync (evt) {
    evt.returnValue = JSON.stringify(cliInfo);
  });
  ipc.on('set-config-item-sync', function handleSetConfigItemSync (evt, key, val) {
    that.set(key, val);
    evt.returnValue = JSON.stringify({success: true});
  });
}
