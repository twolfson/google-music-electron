// Load in our dependencies
var path = require('path');
var spawnSync = require('child_process').spawnSync;

// Load in package info
var pkg = require('../package.json');

// Define our installer
module.exports = function () {
  // Resolve our mpris dependencies
  var installArgs = Object.keys(pkg.mprisDependencies).map(function getInstallArg (dependencyName) {
    return dependencyName + '@' + pkg.mprisDependencies[dependencyName];
  });

  // Run our install command
  // DEV: We are inside of `io.js` of Electron which allows us to use the latest hotness
  var results = spawnSync(
    'npm',
    // Use `--ignore-scripts` to avoid compiling against system's node
    // Use `--save false` prevent saving to `package.json` during development
    ['install', '--ignore-scripts', '--save', 'false'].concat(installArgs),
    {cwd: path.join(__dirname, '..'), stdio: 'inherit'});

  // If there was an error, throw it
  if (results.error) {
    throw results.error;
  }

  // Rebuild electron with our new `mpris-service`
  var electronRebuildCmd = require.resolve('electron-rebuild/lib/cli.js');
  results = spawnSync(electronRebuildCmd, {cwd: path.join(__dirname, '..'), stdio: 'inherit'});

  // If there was an error, throw it
  if (results.error) {
    throw results.error;
  }

  // Log our success an exit
  console.log('MPRIS integration successfully installed! Please start `google-music-electron` to see it in action!');
  process.exit();
};
