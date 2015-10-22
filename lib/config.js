// Load in our dependencies
var Configstore = require('configstore');
var pkg = require('../package.json');

// Generate our config
module.exports = new Configstore(pkg.name, {
  'playpause-shortcut': 'mediaplaypause',
  'next-shortcut': 'medianexttrack',
  'previous-shortcut': 'mediaprevioustrack'
});
