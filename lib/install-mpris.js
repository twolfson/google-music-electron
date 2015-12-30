// Load in our dependencies
var assert = require('assert');
var path = require('path');
var spawn = require('child_process').spawn;

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
  var child = spawn(
    'npm',
    // Use `--ignore-scripts` to avoid compiling against system's node
    // Use `--save false` prevent saving to `package.json` during development
    ['install', '--ignore-scripts', '--save', 'false'].concat(installArgs),
    {cwd: path.join(__dirname, '..'), stdio: 'inherit'});

  // If there is an error, throw it
  child.on('error', function handleError (err) {
    throw err;
  });

  // When the child exits
  child.on('exit', function handleExit (code, signal) {
    // Verify we received a zero exit code
    assert.strictEqual(code, 0, 'Expected "npm install" exit code to be "0" but it was "' + code + '"');

    // Rebuild electron with our new `mpris-service`
    var electronRebuildCmd = require.resolve('electron-rebuild/lib/cli.js');
    child = spawn(electronRebuildCmd, {cwd: path.join(__dirname, '..'), stdio: 'inherit'});

    // If there is an error, throw it
    child.on('error', function handleError (err) {
      throw err;
    });

    // When the child exits
    child.on('exit', function handleExit (code, signal) {
      // Verify we received a zero exit code
      assert.strictEqual(code, 0, 'Expected "electron-rebuild" exit code to be "0" but it was "' + code + '"');

      // Log our success and exit
      console.log('MPRIS integration successfully installed! ' +
        'Please start `google-music-electron` to see it in action!');
      process.exit();
    });
  });
};
