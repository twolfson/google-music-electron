// Load in our dependencies
var _ = require('underscore');
var program = require('commander');
var installMpris = require('./install-mpris');

// Load in package info
var pkg = require('../package.json');

// Define our CLI parser
exports.parse = function (argv) {
  // Handle CLI arguments
  program
    .version(pkg.version)
    .option('-S, --skip-taskbar', 'Skip showing the application in the taskbar')
    .option('--minimize-to-tray', 'Hide window to tray instead of minimizing')
    .option('--hide-via-tray', 'Hide window to tray instead of minimizing (only for tray icon)')
    .option('--allow-multiple-instances', 'Allow multiple instances of `google-music-electron` to run')
    .option('--verbose', 'Display verbose log output in stdout')
    .option('--debug-repl', 'Starts a `replify` server as `google-music-electron` for debugging')
    // Allow unknown Chromium flags
    // https://github.com/atom/electron/blob/v0.26.0/docs/api/chrome-command-line-switches.md
    .allowUnknownOption();

  // Specify keys that can be used by config if CLI isn't provided
  var cliConfigKeys = ['skip-taskbar', 'minimize-to-tray', 'hide-via-tray', 'allow-multiple-instances'];
  var cliInfo = _.object(cliConfigKeys.map(function generateCliInfo (key) {
    return [key, _.findWhere(program.options, {long: '--' + key})];
  }));

  // Define our commands
  program
    .command('install-mpris')
    .description('Install integration with MPRIS (Linux only)')
    .action(function handleInstallMrpis () {
      // If we are in Electron, then raise an error
      //   https://github.com/twolfson/google-music-electron/issues/25#issuecomment-167368775
      if (process.versions.electron) {
        throw new Error('`install-mpris` command should be handled by `bin/google-music-electron.js`');
      }

      // Otherwise, run our installer
      installMpris();
    });

  // Process our arguments
  program.parse(argv);

  // Amend cliConfigKeys and cliInfo as attributes
  program._cliConfigKeys = cliConfigKeys;
  program._cliInfo = cliInfo;

  // Return our parsed info
  return program;
};
