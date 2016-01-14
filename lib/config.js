// Load in our dependencies
var ipcMain = require('electron').ipcMain;
var _ = require('underscore');
var Configstore = require('configstore');
var pkg = require('../package.json');

// Define config constructor
function GmeConfig(cliOverrides, cliInfo) {
  // Create our config
  this.config = new Configstore(pkg.name, {
    'playpause-shortcut': 'mediaplaypause',
    'next-shortcut': 'medianexttrack',
    'previous-shortcut': 'mediaprevioustrack'
  });
  this.cliOverrides = cliOverrides;

  // Generate IPC bindings for config and its info
  var that = this;
  ipcMain.on('get-config-sync', function handleGetConfigSync (evt) {
    evt.returnValue = JSON.stringify(that.getAll());
  });
  ipcMain.on('get-config-info-sync', function handleGetConfigInfoSync (evt) {
    evt.returnValue = JSON.stringify(cliInfo);
  });
  ipcMain.on('get-config-overrides-sync', function handleGetConfigInfoSync (evt) {
    evt.returnValue = JSON.stringify(cliOverrides);
  });
  ipcMain.on('set-config-item-sync', function handleSetConfigItemSync (evt, key, val) {
    that.set(key, val);
    evt.returnValue = JSON.stringify({success: true});
  });
}
// DEV: We need to define our own `getAll` since we can't subclass `Configstore#all`
//   Also, since the `setAll` behavior is confusing because we don't want cliOverrides to contaminate anything
//   so we don't ever allow setting it =_=
// https://github.com/yeoman/configstore/blob/v1.2.1/index.js
GmeConfig.prototype = {
  getAll: function () {
    return _.defaults({}, this.cliOverrides, this.config.all);
  },
  get: function (key) {
    var all = this.getAll();
    return all[key];
  },
  set: function (key, val) {
    return this.config.set(key, val);
  },
  del: function (key) {
    return this.config.del(key);
  },
  clear: function () {
    return this.config.clear();
  }
};

// Export our constructor
module.exports = GmeConfig;
